import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const ProductItem = ({
  image = "/placeholder.jpg",
  name = "Unknown Product",
  originalPrice = 0,
  salePrice = null,
  slug = null,
  stock = 1,
}) => {
  const isOutOfStock = stock === 0;
  const hasDiscount = salePrice !== null && salePrice < originalPrice;
  const discountPercentage = hasDiscount
    ? (((originalPrice - salePrice) / originalPrice) * 100).toFixed(0)
    : 0;

  const productContent = (
    <>
      {/* Container gambar dengan ukuran tetap */}
      <div className="relative w-full h-64 overflow-hidden rounded-xl">
        {hasDiscount && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded">
            -{discountPercentage}%
          </span>
        )}
        <img
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          src={image}
          alt={name}
          onError={(e) => (e.target.src = "/placeholder.jpg")}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <span className="text-white text-xs font-bold">Stok Habis</span>
          </div>
        )}
      </div>

      {/* Nama Produk */}
      <p className="pt-3 text-sm font-semibold text-center line-clamp-2">
        {name}
      </p>

      {/* Harga Produk */}
      <div className="flex flex-col items-center">
        {hasDiscount ? (
          <>
            <p className="text-xs text-gray-500 line-through">
              Rp{originalPrice.toLocaleString("id-ID")}
            </p>
            <p className="text-sm font-bold text-green-600">
              Rp{salePrice.toLocaleString("id-ID")}
            </p>
          </>
        ) : (
          <p className="text-sm font-bold text-green-600">
            Rp{originalPrice.toLocaleString("id-ID")}
          </p>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      {slug ? (
        <Link className="text-gray-700 w-full" to={`/product/${slug}`}>
          {productContent}
        </Link>
      ) : (
        <div className="text-gray-700 w-full">{productContent}</div>
      )}
    </div>
  );
};

ProductItem.propTypes = {
  image: PropTypes.string,
  name: PropTypes.string,
  originalPrice: PropTypes.number,
  salePrice: PropTypes.number,
  slug: PropTypes.string,
  stock: PropTypes.number,
};

export default ProductItem;
