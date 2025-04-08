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
      className="absolute top-1/2 right-0 transform -translate-y-1/2 text-gray-800 text-3xl cursor-pointer z-10 hover:text-black"
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
      className="absolute top-1/2 left-0 transform -translate-y-1/2 text-gray-800 text-3xl cursor-pointer z-10 hover:text-black"
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

  const slidesToShow = categories.length < 3 ? categories.length : 3;
  const autoplay = categories.length > 3;

  const sliderSettings = {
    dots: false,
    infinite: categories.length > slidesToShow,
    speed: 600,
    slidesToShow,
    slidesToScroll: 1,
    autoplay,
    autoplaySpeed: 4000,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow } },
      {
        breakpoint: 768,
        settings: { slidesToShow: Math.min(2, slidesToShow) },
      },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center pb-6">
        <Title text1="KATEGORI" text2="PRODUK" />
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
            <div key={category.id} className="px-2">
              <div
                className="cursor-pointer group flex flex-col items-center p-4 bg-gradient-to-r from-gray-200 to-white rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                onClick={() =>
                  navigate("/collection", {
                    state: { selectedCategory: category.category_name },
                  })
                }
              >
                <div className="h-60 w-full mb-2 overflow-hidden rounded-lg">
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
    </section>
  );
};

export default Categories;
