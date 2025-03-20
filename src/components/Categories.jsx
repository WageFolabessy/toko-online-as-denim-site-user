import { useEffect, useState } from "react";
import Title from "./Title";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function SampleNextArrow(props) {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 right-0 transform -translate-y-1/2 text-black text-2xl cursor-pointer z-10"
      onClick={onClick}
    >
      <FaArrowCircleRight />
    </div>
  );
}

function SamplePrevArrow(props) {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 left-0 transform -translate-y-1/2 text-black text-2xl cursor-pointer z-10"
      onClick={onClick}
    >
      <FaArrowCircleLeft />
    </div>
  );
}

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/user/get_categories")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  // Tentukan jumlah slide yang ditampilkan
  const slidesToShow = categories.length < 3 ? categories.length : 3;
  // Autoplay hanya aktif jika data lebih dari 3
  const autoplay = categories.length > 3;

  const sliderSettings = {
    dots: false,
    infinite: categories.length > slidesToShow, // infinite jika ada lebih banyak data daripada slidesToShow
    speed: 600,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: autoplay,
    autoplaySpeed: 4000,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: slidesToShow },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: Math.min(2, slidesToShow) },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center text-3xl pb-4">
        <Title text1={"KATEGORI"} text2={"PRODUK"} />
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Memuat kategori...</p>
      ) : error ? (
        <p className="text-center text-red-500">
          Terjadi kesalahan saat mengambil data.
        </p>
      ) : (
        <Slider {...sliderSettings}>
          {categories.map((category) => (
            <div
              key={category.id}
              className="px-2"
              onClick={() =>
                navigate("/collection", {
                  state: { selectedCategory: category.category_name },
                })
              }
            >
              <div className="cursor-pointer group flex flex-col items-center p-4 bg-gradient-to-r from-gray-200 to-white rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="h-60 w-full mb-2 overflow-hidden">
                  <img
                    src={`/storage/${category.image}`}
                    alt={category.category_name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <p className="text-lg font-semibold text-gray-400 text-center mt-2 group-hover:text-black transition-colors duration-300">
                  {category.category_name}
                </p>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default Categories;
