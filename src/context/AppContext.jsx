import { createContext, useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem("token") || null);
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const currency = "Rp. ";
  const delivery_fee = 0;
  const navigate = useNavigate();
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 menit

  // Gunakan useRef untuk menyimpan timer dan flag logout
  const inactivityTimerRef = useRef(null);
  const isLoggedOutRef = useRef(false);

  const updateToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      sessionStorage.setItem("token", newToken);
    } else {
      sessionStorage.removeItem("token");
    }
  };

  // Fungsi logout yang hanya akan dipicu satu kali
  const handleLogout = useCallback(async (logoutMessage) => {
    if (isLoggedOutRef.current) return; // Jika sudah logout, jangan jalankan lagi
    isLoggedOutRef.current = true;
    try {
      // Jika perlu, panggil API logout di sini
    } catch (error) {
      console.error("Error saat logout:", error);
    } finally {
      updateToken(null);
      setCartItems([]);
      navigate("/login");
      // Tampilkan satu toast informasi logout
      toast.info(logoutMessage || "Sesi Anda telah berakhir. Silakan login kembali.");
    }
  }, [navigate]);

  const authFetch = useCallback(
    async (url, options = {}) => {
      const defaultHeaders = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const mergedOptions = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      };

      try {
        const response = await fetch(url, mergedOptions);
        if (response.status === 401) {
          // Hanya panggil handleLogout tanpa toast tambahan
          handleLogout("Sesi Anda telah berakhir. Silakan login kembali.");
        }
        return response;
      } catch (error) {
        console.error("Network error:", error);
        toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.");
        throw error;
      }
    },
    [token, handleLogout]
  );

  const fetchCartItems = useCallback(async () => {
    try {
      const response = await authFetch("/api/user/shopping_cart");
      const data = await response.json();
      if (response.ok) {
        const transformedCartItems = data.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          qty: item.qty,
          size: item.size,
          productData: item.product,
        }));
        setCartItems(transformedCartItems);
      } else {
        toast.error(data.message || "Gagal mengambil data keranjang");
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast.error("Terjadi kesalahan saat mengambil data keranjang");
    }
  }, [authFetch]);

  // Reset timer inaktivitas dan simpan di ref
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      handleLogout("Sesi Anda telah berakhir karena tidak ada aktivitas.");
    }, INACTIVITY_TIMEOUT);
  }, [handleLogout, INACTIVITY_TIMEOUT]);

  useEffect(() => {
    if (token) {
      fetchCartItems();
      const activityEvents = ["click", "mousemove", "keydown", "scroll", "touchstart"];
      activityEvents.forEach((eventName) => {
        window.addEventListener(eventName, resetInactivityTimer);
      });
      resetInactivityTimer();
      return () => {
        activityEvents.forEach((eventName) => {
          window.removeEventListener(eventName, resetInactivityTimer);
        });
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
      };
    } else {
      setCartItems([]);
    }
  }, [token, fetchCartItems, resetInactivityTimer]);

  // Fungsi-fungsi tambahan (addToCart, updateQuantity, removeFromCart, dll)
  const addToCart = useCallback(async (itemId, size, quantity = 1) => {
    try {
      const response = await authFetch("/api/user/shopping_cart", {
        method: "POST",
        body: JSON.stringify({
          product_id: itemId,
          qty: quantity,
          size: size,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Produk berhasil ditambahkan ke keranjang");
        fetchCartItems();
      } else {
        toast.error(data.message || "Gagal menambahkan produk ke keranjang");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Terjadi kesalahan saat menambahkan produk ke keranjang");
    }
  }, [authFetch, fetchCartItems]);

  const updateQuantity = useCallback(async (cartItemId, qty) => {
    try {
      const response = await authFetch(`/api/user/shopping_cart/${cartItemId}`, {
        method: "PUT",
        body: JSON.stringify({ qty }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Jumlah produk berhasil diperbarui");
        fetchCartItems();
      } else {
        toast.error(data.message || "Gagal mengupdate jumlah produk");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Terjadi kesalahan saat mengupdate jumlah produk");
    }
  }, [authFetch, fetchCartItems]);

  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      const response = await authFetch(`/api/user/shopping_cart/${cartItemId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Produk berhasil dihapus dari keranjang");
        fetchCartItems();
      } else {
        toast.error(data.message || "Gagal menghapus produk dari keranjang");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Terjadi kesalahan saat menghapus produk dari keranjang");
    }
  }, [authFetch, fetchCartItems]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartCount = () => cartItems.reduce((total, item) => total + item.qty, 0);

  const getCartAmount = () =>
    cartItems.reduce((total, cartItem) => {
      const price = cartItem.productData?.original_price || cartItem.productData.sale_price;
      return total + price * cartItem.qty;
    }, 0);

  const value = {
    token,
    setToken: updateToken,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    getCartAmount,
    updateQuantity,
    removeFromCart,
    clearCart,
    navigate,
    handleLogout,
    authFetch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
