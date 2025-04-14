import { useState, useEffect, useContext } from "react";
import ProductItem from "../components/ProductItem";
import { AppContext } from "../context/AppContext";

const ProductRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [errorRecs, setErrorRecs] = useState(null);
  const { authFetch } = useContext(AppContext);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      setErrorRecs(null);
      try {
        const response = await authFetch(
          "/api/user/recommendations/cart?limit=6"
        );
        const data = await response.json();

        if (response.ok) {
          if (Array.isArray(data.data)) {
            const formattedRecs = data.data.map((item) => ({
              id: item.id,
              name: item.name,
              original_price: item.original_price ?? 0,
              sale_price: item.sale_price ?? null,
              image: item.primary_image || "/placeholder.jpg",
              slug: item.slug,
              stock: item.stock ?? 1,
            }));
            setRecommendations(formattedRecs);
          } else {
            console.warn("Recommendation data format unexpected:", data);
            setRecommendations([]);
          }
        } else {
          console.error("Failed to fetch recommendations:", data);
          setErrorRecs(data?.message || "Gagal memuat rekomendasi");
          setRecommendations([]);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        if (
          error.message !== "Unauthorized" &&
          error.message !== "Forbidden" &&
          error.message !== "User not authenticated"
        ) {
          setErrorRecs("Terjadi kesalahan jaringan saat memuat rekomendasi.");
        }
        setRecommendations([]);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [authFetch]);

  if (loadingRecs) {
    return <div className="text-center p-4">Memuat rekomendasi...</div>;
  }

  if (errorRecs) {
    return null;
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t">
      <h3 className="text-lg font-semibold mb-4">Anda Mungkin Juga Suka</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recommendations.map((product) => (
          <ProductItem key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;
