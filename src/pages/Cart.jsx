import { useContext, useEffect } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { AppContext } from "../context/AppContext";

const Cart = () => {
  useEffect(() => {
    document.title = "AS Denim - Keranjang";
  }, []);

  const { currency, cartItems, updateQuantity, removeFromCart, navigate } =
    useContext(AppContext);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="pt-36 px-4 lg:px-20">
        <Title text1={"Keranjang"} text2={"Anda"} />
        <p className="text-center py-10 text-gray-500 text-lg">
          Keranjang belanja kosong.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t pt-36 px-4 lg:px-20">
      {/* Header */}
      <div className="mb-10">
        <Title text1={"Keranjang"} text2={"Anda"} />
      </div>

      {/* Daftar Produk di Cart */}
      <div className="space-y-6">
        {cartItems.map((item) => {
          const productData = item.productData;

          if (!productData) {
            return (
              <div key={item.id}>
                <p>Produk tidak ditemukan.</p>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="py-4 border-t border-b grid grid-cols-1 sm:grid-cols-[3fr_1fr_auto] gap-4 items-center"
            >
              {/* Info Produk */}
              <div className="flex items-center gap-4">
                <img
                  className="w-20 h-20 object-cover rounded-md shadow-sm"
                  src={
                    productData.images?.[0]?.image
                      ? `/storage/${productData.images[0].image}`
                      : "fallback-image-url"
                  }
                  alt={productData.product_name || "Product image"}
                />
                <div>
                  <p className="text-sm sm:text-lg font-medium text-gray-800">
                    {productData.product_name}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-700">
                      {currency}
                      {(productData.sale_price > 0
                        ? Number(productData.sale_price)
                        : Number(productData.original_price)
                      ).toLocaleString("id-ID")}
                    </p>
                    {item.size && (
                      <p className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600">
                        {item.size}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Jumlah Produk */}
              <div>
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => {
                    const qty = Number(e.target.value);
                    if (qty > 0) {
                      updateQuantity(item.id, qty);
                    } else {
                      updateQuantity(item.id, 1);
                    }
                  }}
                  className="w-16 border border-gray-300 px-2 py-1 rounded text-center"
                />
              </div>

              {/* Tombol Hapus */}
              <div className="flex justify-end">
                <img
                  onClick={() => removeFromCart(item.id)}
                  className="w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity"
                  src={assets.bin_icon}
                  alt="Hapus Produk"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Total dan Lanjut Pembayaran */}
      <div className="mt-16 flex justify-end">
        <div className="w-full sm:w-[450px] border p-6 rounded-md shadow-md">
          <CartTotal />
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/place-order")}
              className="bg-black text-white text-sm px-8 py-3 rounded hover:bg-gray-800 transition-colors"
            >
              LANJUT KE PEMBAYARAN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
