import { useEffect } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";

const About = () => {
  useEffect(() => {
    document.title = "AS Denim - Tentang Kami";
  }, []);

  return (
    <div className="pt-36 px-4 lg:px-20 text-gray-700">
      <div className="text-center mb-12">
        <Title text1={"TENTANG"} text2={"KAMI"} />
        <p className="mt-4 text-base md:text-lg text-gray-500 max-w-3xl mx-auto">
          Kenali lebih dekat siapa kami, visi, dan misi yang membentuk AS Denim.
        </p>
      </div>

      <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">
        {/* Text */}
        <div className="md:w-1/2 space-y-6">
          <p>
            <strong className="text-gray-900">AS Denim</strong> adalah
            perusahaan yang bergerak di bidang penjualan pakaian bekas dengan
            fokus utama pada kualitas produk dan kenyamanan pelanggan. Berdiri
            sejak 26 Mei 2022, AS Denim berlokasi di Jl. Ahmad Tani 2, depan
            Aneka Motor, Sungai Raya, Kab. Kubu Raya, Kalimantan Barat.
          </p>
          <p>
            Kami berdedikasi untuk menyediakan produk pakaian bekas yang
            stylish, nyaman, dan tetap terjangkau. Produk kami mencakup berbagai
            kategori seperti kaos, kemeja, hingga celana.
          </p>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              VISI KAMI
            </h3>
            <p>
              Menjadi toko pakaian bekas terpercaya yang mampu memenuhi gaya
              fashion yang unik dan mencerminkan kepribadian masyarakat.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              MISI KAMI
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Menyediakan koleksi pakaian bekas berkualitas yang sesuai tren
                dan selera pelanggan.
              </li>
              <li>
                Memberikan pengalaman belanja yang menyenangkan dengan pelayanan
                ramah dan cepat.
              </li>
              <li>
                Menjamin kualitas produk dengan standar kenyamanan yang tinggi.
              </li>
              <li>
                Menawarkan pilihan fashion yang mencerminkan kepribadian
                pelanggan.
              </li>
            </ul>
          </div>
        </div>

        {/* Image */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={assets.as_logo}
            alt="Tentang AS Denim"
            className="rounded-lg shadow-md max-h-[400px] object-cover w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
