import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import Title from "../components/Title";
import { useLocation, useSearchParams } from "react-router-dom";
import ProductItem from "../components/ProductItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faArrowRight,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../context/AppContext";

const Collection = () => {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(AppContext);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortType, setSortType] = useState("relevent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await fetch("/api/user/get_categories");
        if (!response.ok) throw new Error("Gagal mengambil data kategori");
        const data = await response.json();
        if (data && data.data) {
          setAllCategories(data.data);
        }
      } catch (catError) {
        console.error("Error fetching all categories:", catError);
      }
    };
    fetchAllCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      const apiUrl = `/api/user/get_products?page=${currentPage}`;
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: response.statusText }));
          throw new Error(
            `Gagal mengambil produk: ${response.status} ${
              errorData.message || ""
            }`
          );
        }
        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          const formattedProducts = data.data.map((item) => ({
            id: item.id,
            name: item.name,
            original_price: item.original_price,
            sale_price: item.sale_price,
            image: item.primary_image || "/placeholder.jpg",
            category: item.category?.name || "Unknown",
            description: item.description,
            slug: item.slug,
            stock: item.stock,
          }));
          setProducts(formattedProducts);
          setPaginationData({ links: data.links, meta: data.meta });
        } else {
          console.warn("Format data produk tidak sesuai:", data);
          setProducts([]);
          setPaginationData(null);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(
          error.message || "Terjadi kesalahan saat mengambil data produk."
        );
        setProducts([]);
        setPaginationData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage]);

  useEffect(() => {
    if (location.state?.selectedCategory) {
      setSelectedCategories([location.state.selectedCategory]);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredAndSortedProducts = useMemo(() => {
    let processedProducts = [...products];

    if (showSearch && search) {
      processedProducts = processedProducts.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      processedProducts = processedProducts.filter(
        (item) => selectedCategories.includes(item.category)
      );
    }

    switch (sortType) {
      case "low-high":
        processedProducts.sort(
          (a, b) =>
            (a.sale_price ?? a.original_price) -
            (b.sale_price ?? b.original_price)
        );
        break;
      case "high-low":
        processedProducts.sort(
          (a, b) =>
            (b.sale_price ?? b.original_price) -
            (a.sale_price ?? a.original_price)
        );
        break;
      default:
        break;
    }
    return processedProducts;
  }, [products, selectedCategories, search, showSearch, sortType]);

  const toggleCategoryFilter = useCallback(
    (categoryName) => {
      setSelectedCategories((prev) =>
        prev.includes(categoryName)
          ? prev.filter((item) => item !== categoryName)
          : [...prev, categoryName]
      );
      setSearchParams({ page: "1" }, { replace: true });
    },
    [setSearchParams]
  );

  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      paginationData &&
      newPage <= paginationData.meta.last_page
    ) {
      setSearchParams({ page: newPage.toString() }, { replace: true });
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 border-t px-4 sm:px-8 pt-8 mt-9">
      {" "}
      <aside className="lg:w-64 space-y-4 flex-shrink-0">
        <div className="flex justify-between items-center pb-4">
          <h2 className="text-lg font-semibold">Cari</h2>
          <FontAwesomeIcon
            onClick={() => setShowSearch((prev) => !prev)}
            icon={faSearch}
            className="cursor-pointer text-gray-600 hover:text-black"
            title={showSearch ? "Sembunyikan Pencarian" : "Tampilkan Pencarian"}
          />
        </div>

        <div className="lg:hidden flex justify-between items-center border-t pt-4">
          <h2 className="text-lg font-semibold">Filter</h2>
          <FontAwesomeIcon
            icon={faArrowRight}
            onClick={() => setShowFilter((prev) => !prev)}
            className={`h-5 cursor-pointer transition-transform duration-300 ${
              showFilter ? "rotate-90" : ""
            }`}
          />
        </div>

        <div
          className={`mt-3 border-t pt-4 ${
            showFilter ? "block" : "hidden lg:block"
          }`}
        >
          <h3 className="text-base font-semibold mb-2">Kategori</h3>
          <div className="flex flex-col gap-2 text-sm max-h-60 overflow-y-auto pr-2">
            {" "}
            {allCategories.length > 0 ? (
              allCategories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={cat.name}
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => toggleCategoryFilter(cat.name)}
                    className="accent-black"
                  />
                  {cat.name}
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-500">Memuat kategori...</p>
            )}
          </div>
        </div>
      </aside>
      <main className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <Title text1="SEMUA" text2="KOLEKSI" />
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="border border-gray-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="default">Urutkan: Paling Sesuai</option>
            <option value="low-high">Urutkan: Harga Terendah</option>
            <option value="high-low">Urutkan: Harga Tertinggi</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="2x"
              className="text-gray-500"
            />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">Error: {error}</div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Tidak ada produk yang cocok dengan filter Anda.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredAndSortedProducts.map((item) => (
              <div
                key={item.id}
                className="transform transition-transform duration-300 ease-in-out hover:scale-[1.03]"
              >
                <ProductItem
                  id={item.id}
                  name={item.name}
                  originalPrice={item.original_price}
                  salePrice={item.sale_price}
                  image={item.image}
                  slug={item.slug}
                  stock={item.stock}
                />
              </div>
            ))}
          </div>
        )}

        {paginationData && paginationData.meta.last_page > 1 && !loading && (
          <div className="flex justify-center items-center space-x-2 mt-8 py-4 border-t">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 border rounded text-sm ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Sebelumnya
            </button>
            <span className="text-sm text-gray-600">
              Halaman {paginationData.meta.current_page} dari{" "}
              {paginationData.meta.last_page}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === paginationData.meta.last_page}
              className={`px-4 py-2 border rounded text-sm ${
                currentPage === paginationData.meta.last_page
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Berikutnya
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Collection;
