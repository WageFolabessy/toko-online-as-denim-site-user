import { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import { useLocation } from "react-router-dom";
import ProductItem from "../components/ProductItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../context/AppContext";

const Collection = () => {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(AppContext);
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevent");
  const [filterProducts, setFilterProducts] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const baseImageUrl = "/storage/";

  useEffect(() => {
    document.title = "AS Denim - Koleksi";
    window.history.replaceState({}, document.title);
  }, []);

  useEffect(() => {
    if (location.state?.selectedCategory) {
      setCategory([location.state.selectedCategory]);
    } else {
      setCategory([]);
      setShowFilter([]);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/user/get_products");
        const data = await response.json();
        const formattedProducts = data.map((item) => {
          const primaryImage = item.images.find((img) => img.is_primary === 1);
          return {
            id: item.id,
            name: item.product_name,
            original_price: item.original_price,
            sale_price: item.sale_price,
            image:
              baseImageUrl +
              (primaryImage ? primaryImage.image : item.images[0].image),
            category: item.category.category_name,
            description: item.description,
            slug: item.slug,
            stock: item.stock,
          };
        });
        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const toggleFilter = (value, filterType) => {
    if (filterType === "category") {
      setCategory((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      );
    } else if (filterType === "subCategory") {
      setSubCategory((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      );
    }
  };

  const applyFiltersAndSort = () => {
    let filteredProducts = [...products];
    if (showSearch && search) {
      filteredProducts = filteredProducts.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category.length > 0) {
      filteredProducts = filteredProducts.filter((item) =>
        category.includes(item.category)
      );
    }
    switch (sortType) {
      case "low-high":
        filteredProducts.sort((a, b) => a.sale_price - b.sale_price);
        break;
      case "high-low":
        filteredProducts.sort((a, b) => b.sale_price - a.sale_price);
        break;
      default:
        break;
    }
    setFilterProducts(filteredProducts);
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [category, subCategory, search, showSearch, sortType, products]);

  const uniqueCategories = [...new Set(products.map((item) => item.category))];

  return (
    <div className="flex flex-col lg:flex-row gap-6 pt-10 mt-16 border-t px-4 sm:px-8">
      {/* Sidebar Filter */}
      <aside className="lg:w-64 space-y-4">
        {/* Search */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Cari</h2>
          <FontAwesomeIcon
            onClick={() => setShowSearch(true)}
            icon={faSearch}
            className="cursor-pointer text-gray-600"
          />
        </div>

        {/* Filter Button (Mobile) */}
        <div className="lg:hidden flex justify-between items-center">
          <h2 className="text-lg font-semibold">Filter</h2>
          <FontAwesomeIcon
            icon={faArrowRight}
            onClick={() => setShowFilter((prev) => !prev)}
            className={`h-5 cursor-pointer transition-transform duration-300 ${
              showFilter ? "rotate-90" : ""
            }`}
          />
        </div>

        {/* Filter Area */}
        <div
          className={`mt-3 border-t pt-4 ${
            showFilter ? "block" : "hidden lg:block"
          }`}
        >
          <h3 className="text-sm font-medium mb-2">Kategori</h3>
          <div className="flex flex-col gap-2 text-sm">
            {uniqueCategories.map((item, index) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={item}
                  checked={category.includes(item)}
                  onChange={() => toggleFilter(item, "category")}
                  className="accent-black"
                />
                {item}
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Title + Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <Title text1="SEMUA" text2="KOLEKSI" />
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border border-gray-300 text-sm px-3 py-2 rounded-md"
          >
            <option value="relevent">Urutkan: Paling Sesuai</option>
            <option value="low-high">Urutkan: Harga Terendah</option>
            <option value="high-low">Urutkan: Harga Tertinggi</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              id={item.id}
              name={item.name}
              originalPrice={item.original_price}
              salePrice={item.sale_price}
              image={item.image}
              slug={item.slug}
              stock={item.stock}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Collection;
