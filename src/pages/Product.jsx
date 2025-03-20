import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import ProductReview from "../components/ProductReview";

const Product = () => {
  const { slug } = useParams();
  const { addToCart } = useContext(AppContext);
  const [productData, setProductData] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProductData = async () => {
    try {
      const response = await fetch(`/api/user/product/${slug}/detail`);
      if (!response.ok) {
        throw new Error("Produk tidak ditemukan.");
      }
      const data = await response.json();
      if (data.product) {
        const product = data.product;
        setProductData(product);
        setImages(product.images.map((image) => `/storage/${image.image}`));
        setSelectedImage(`/storage/${product.images[0]?.image}`);
      } else {
        setProductData(null);
        console.error("Produk tidak ditemukan.");
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [slug]);

  if (loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }
  if (!productData) {
    return <p className="text-center mt-20">Produk tidak ditemukan.</p>;
  }

  const salePrice = productData.sale_price ?? productData.original_price;

  const handleAddToCart = () => {
    addToCart(productData.id.toString());
  };

  return (
    <div className="pt-36 pb-10 border-t-2">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Gambar Produk */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto">
              {images.map((item, index) => (
                <img
                  key={index}
                  onClick={() => setSelectedImage(item)}
                  src={item}
                  alt={`Product ${index + 1}`}
                  className={`cursor-pointer rounded-lg border ${
                    selectedImage === item
                      ? "border-blue-500"
                      : "border-transparent"
                  } w-20 h-20 object-cover`}
                />
              ))}
            </div>
            <div className="flex-1">
              <img
                className="w-full rounded-lg shadow-lg object-cover"
                src={selectedImage}
                alt={productData.product_name}
              />
            </div>
          </div>
          {/* Detail Produk */}
          <div className="flex-1">
            <h1 className="text-3xl font-semibold mb-4">
              {productData.product_name}
            </h1>
            <div className="mb-6">
              {productData.original_price === salePrice ? (
                <p className="text-3xl font-bold">
                  Rp {productData.original_price.toLocaleString("id-ID")}
                </p>
              ) : (
                <>
                  <p className="text-2xl font-bold text-black">
                    Rp {salePrice.toLocaleString("id-ID")}
                  </p>
                  <p className="text-lg text-red-500 line-through">
                    Rp {productData.original_price.toLocaleString("id-ID")}
                  </p>
                  <p className="mt-2 inline-block bg-red-100 text-red-600 px-3 py-1 rounded">
                    Diskon{" "}
                    {(
                      ((productData.original_price - salePrice) /
                        productData.original_price) *
                      100
                    ).toFixed(2)}{" "}
                    %
                  </p>
                </>
              )}
            </div>
            <div className="mb-6">
              <p className="mb-2 font-medium">Ukuran:</p>
              <span className="inline-block px-4 py-2 bg-black text-white rounded">
                {productData.size}
              </span>
            </div>
            <p className="mb-6 text-gray-600">Stok: {productData.stock}</p>
            <button
              onClick={handleAddToCart}
              className="bg-black text-white px-8 py-3 rounded hover:bg-gray-700 transition-colors"
            >
              Tambah ke Keranjang
            </button>
          </div>
        </div>
        {/* Deskripsi Produk */}
        <div className="mt-20">
          <div className="mb-4">
            <h2 className="inline-block px-5 py-3 border rounded text-lg font-medium">
              Deskripsi
            </h2>
          </div>
          <div className="border rounded-lg p-6 text-gray-700 leading-relaxed">
            <div
              dangerouslySetInnerHTML={{ __html: productData.description }}
            />
          </div>
        </div>
        {/* Review Produk */}
        <div className="mt-20">
          <ProductReview productId={productData.id} />
        </div>
      </div>
    </div>
  );
};

export default Product;
