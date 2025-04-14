import { useContext, useEffect, useState, useCallback } from "react";
import Title from "../components/Title";
import { useSearchParams } from "react-router-dom";
import ProductItem from "../components/ProductItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../context/AppContext";

const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        if (value.length > 0) query.append(key, value[0]);
      } else {
        query.append(key, value);
      }
    }
  });
  return query.toString();
};

const formatProductItem = (item) => {
  if (
    !item ||
    typeof item !== "object" ||
    item.id === undefined ||
    item.name === undefined
  ) {
    console.warn("Invalid product item structure:", item);
    return null;
  }
  const originalPriceValue = item.original_price ?? 0;
  const salePriceValue = item.sale_price ?? null;
  return {
    id: item.id,
    name: item.name,
    original_price: originalPriceValue,
    sale_price: salePriceValue,
    image: item.primary_image ? item.primary_image : "/placeholder.jpg",
    category: item.category?.name || "Unknown",
    description: item.description,
    slug: item.slug,
    stock: item.stock ?? 1,
  };
};

const Collection = () => {
  const { search, showSearch, setShowSearch } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [sortOption, setSortOption] = useState("relevance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const [allCategories, setAllCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const initialCategoryIdFilter = searchParams.get("category") || null;

  useEffect(() => {
    const fetchAllCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(null);
      setAllCategories([]);
      console.log("Fetching categories...");
      try {
        const response = await fetch("/api/user/get_categories");
        console.log("Category API Response Status:", response.status);
        if (!response.ok) {
          let errorBody = `HTTP error! status: ${response.status}`;
          try {
            const text = await response.text();
            const json = JSON.parse(text);
            errorBody = json.message || JSON.stringify(json);
          } catch (parseError) {}
          throw new Error(`Gagal mengambil kategori: ${errorBody}`);
        }
        const responseData = await response.json();
        console.log("Raw Category API Data:", responseData);
        const categoryArraySource = responseData?.data || responseData;
        if (Array.isArray(categoryArraySource)) {
          const formattedCategories = categoryArraySource
            .map((cat) => {
              if (
                !cat ||
                typeof cat !== "object" ||
                cat.id === undefined ||
                cat.name === undefined
              )
                return null;
              return { id: cat.id, name: cat.name };
            })
            .filter(Boolean);
          setAllCategories(formattedCategories);
        } else {
          throw new Error("Format data kategori tidak valid.");
        }
      } catch (catError) {
        console.error("Error fetching categories:", catError);
        setCategoryError(catError.message || "Gagal memuat kategori.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchAllCategories();
  }, []);

  useEffect(() => {
    if (initialCategoryIdFilter) {
      const initialId = parseInt(initialCategoryIdFilter, 10);
      if (!isNaN(initialId) && !selectedCategoryIds.includes(initialId)) {
        console.log(
          "Setting initial category filter from URL param:",
          initialId
        );
        setSelectedCategoryIds([initialId]);
      }
    } else if (
      !initialCategoryIdFilter &&
      selectedCategoryIds.length > 0 &&
      !location.state?.navigatedInternally
    ) {
      // console.log("URL param category removed, resetting selected categories");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategoryIdFilter]);

  const fetchSearchResults = useCallback(
    async (page, keyword, categoryIds, sort) => {
      setLoading(true);
      setError(null);
      console.log(`Workspaceing search results... Params:`, {
        page,
        keyword,
        categoryIds,
        sort,
      });

      let sortBy = "_score",
        sortOrder = "desc";
      if (sort === "price-asc") {
        sortBy = "original_price";
        sortOrder = "asc";
      } else if (sort === "price-desc") {
        sortBy = "original_price";
        sortOrder = "desc";
      }

      const params = {
        page: page,
        keyword: keyword,
        category_id: categoryIds.length > 0 ? categoryIds[0] : null,
        sort_by: sortBy,
        sort_order: sortOrder,
        per_page: 12,
      };
      const queryString = buildQueryString(params);
      const apiUrl = `/api/products/search?${queryString}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          let errorBody = `HTTP error! status: ${response.status}`;
          try {
            const text = await response.text();
            const json = JSON.parse(text);
            errorBody = json.message || JSON.stringify(json);
          } catch (parseError) {}
          throw new Error(`Gagal mengambil produk: ${errorBody}`);
        }
        const responseData = await response.json();

        if (responseData && responseData.links && responseData.meta) {
          let productArraySource = null;
          if (Array.isArray(responseData.data)) {
            productArraySource = responseData.data;
          } else if (
            typeof responseData.data === "object" &&
            responseData.data !== null
          ) {
            productArraySource = Object.values(responseData.data);
          } else {
            productArraySource = [];
          }

          const formattedProducts = productArraySource
            .map(formatProductItem)
            .filter(Boolean);
          setProducts(formattedProducts);
          setPaginationData({
            links: responseData.links,
            meta: responseData.meta,
          });
        } else {
          throw new Error("Format respons server tidak dikenali.");
        }
      } catch (fetchError) {
        console.error("Error fetching search results:", fetchError);
        setError(fetchError.message || "Terjadi kesalahan.");
        setProducts([]);
        setPaginationData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    console.log("Search effect triggered. Deps:", {
      currentPage,
      search,
      selectedCategoryIds,
      sortOption,
    });
    fetchSearchResults(currentPage, search, selectedCategoryIds, sortOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, selectedCategoryIds, sortOption]);

  const toggleCategoryFilter = useCallback(
    (categoryId) => {
      const currentId = parseInt(categoryId, 10);
      if (isNaN(currentId)) return;

      const newSelectedIds = selectedCategoryIds.includes(currentId)
        ? selectedCategoryIds.filter((id) => id !== currentId)
        : [currentId];

      setSelectedCategoryIds(newSelectedIds);

      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("page", "1");
          if (newSelectedIds.length > 0) {
            newParams.set("category", newSelectedIds[0].toString());
          } else {
            newParams.delete("category");
          }
          return newParams;
        },
        { replace: true }
      );
    },
    [selectedCategoryIds, setSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      if (
        newPage >= 1 &&
        paginationData?.meta?.last_page &&
        newPage <= paginationData.meta.last_page
      ) {
        setSearchParams(
          (prev) => {
            const n = new URLSearchParams(prev);
            n.set("page", newPage.toString());
            return n;
          },
          { replace: true }
        );
        window.scrollTo(0, 0);
      }
    },
    [paginationData, setSearchParams]
  );

  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        n.set("page", "1");
        return n;
      },
      { replace: true }
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 border-t px-4 sm:px-8 pt-8 mt-9">
      <aside className="lg:w-64 space-y-4 flex-shrink-0">
        <div className="flex justify-between items-center pb-4">
          <h2 className="text-lg font-semibold">Cari</h2>
          <FontAwesomeIcon
            onClick={() => setShowSearch((prev) => !prev)}
            icon={faSearch}
            className="cursor-pointer text-gray-600 hover:text-black h-5"
            title={showSearch ? "Sembunyikan Pencarian" : "Tampilkan Pencarian"}
          />
        </div>
        <div className="lg:hidden flex justify-between items-center border-t pt-4">
          <h2 className="text-lg font-semibold">Filter</h2>
          <FontAwesomeIcon
            icon={faFilter}
            onClick={() => setShowFilter((prev) => !prev)}
            className={`h-5 cursor-pointer transition-opacity duration-300 ${
              showFilter ? "opacity-100" : "opacity-70"
            }`}
          />
        </div>
        <div
          className={`mt-3 border-t pt-4 ${
            showFilter ? "block" : "hidden lg:block"
          }`}
        >
          <h3 className="text-base font-semibold mb-2">Kategori</h3>
          {loadingCategories ? (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <FontAwesomeIcon icon={faSpinner} spin /> Memuat kategori...
            </p>
          ) : categoryError ? (
            <p className="text-xs text-red-500">Error: {categoryError}</p>
          ) : allCategories.length === 0 ? (
            <p className="text-xs text-gray-500">Tidak ada kategori.</p>
          ) : (
            <div className="flex flex-col gap-2 text-sm max-h-60 overflow-y-auto pr-2">
              {allCategories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={cat.id}
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => toggleCategoryFilter(cat.id)}
                    className="accent-black"
                  />
                  {cat.name || `Kategori ID ${cat.id}`}
                </label>
              ))}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <Title text1="SEMUA" text2="KOLEKSI" />
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="border border-gray-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            disabled={loading}
          >
            <option value="relevance">Urutkan: Paling Sesuai</option>
            <option value="price-asc">Urutkan: Harga Terendah</option>
            <option value="price-desc">Urutkan: Harga Tertinggi</option>
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
          <div className="text-center text-red-500 py-10 px-4">
            <p className="font-semibold">Oops!</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-10 px-4">
            Tidak ada produk yang cocok.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map(
              (item) =>
                item && (
                  <div
                    key={item.id}
                    className="transform transition-transform duration-300 ease-in-out hover:scale-[1.03]"
                  >
                    <ProductItem {...item} />
                  </div>
                )
            )}
          </div>
        )}

        {paginationData?.meta?.last_page > 1 &&
          !loading &&
          products.length > 0 && (
            <div className="flex justify-center items-center space-x-2 mt-8 py-4 border-t">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || !paginationData?.links?.prev}
                className={`px-4 py-2 border rounded text-sm ${
                  currentPage === 1 || !paginationData?.links?.prev
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Sebelumnya
              </button>
              {paginationData?.meta && (
                <span className="text-sm text-gray-600">
                  {" "}
                  Hal {paginationData.meta.current_page} dari{" "}
                  {paginationData.meta.last_page}{" "}
                </span>
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage === paginationData?.meta?.last_page ||
                  !paginationData?.links?.next
                }
                className={`px-4 py-2 border rounded text-sm ${
                  currentPage === paginationData?.meta?.last_page ||
                  !paginationData?.links?.next
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
