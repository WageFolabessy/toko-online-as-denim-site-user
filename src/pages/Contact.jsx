import { useEffect } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";

const Contact = () => {
  useEffect(() => {
    document.title = "AS Denim - Kontak";
  }, []);

  return (
    <div className="pt-36 px-4 lg:px-20 text-gray-700">
      {/* Judul */}
      <div className="text-center mb-12">
        <Title text1="KONTAK" text2="KAMI" />
        <p className="mt-4 text-base md:text-lg text-gray-500">
          Hubungi kami melalui alamat dan kontak berikut
        </p>
      </div>

      {/* Konten Utama */}
      <div className="flex flex-col md:flex-row items-center gap-12 mb-28">
        {/* Logo atau Gambar */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            className="w-full max-w-[400px] rounded-lg shadow-md object-contain"
            src={assets.as_logo}
            alt="AS Denim Logo"
          />
        </div>

        {/* Info Kontak */}
        <div className="w-full md:w-1/2 space-y-6">
          <div>
            <h3 className="font-semibold text-xl text-gray-800 mb-2">
              🏬 Toko Kami
            </h3>
            <p className="text-gray-600">
              Jl. Ahmad Tani 2, depan Aneka Motor, Sungai Raya, Kab. Kubu Raya,
              Kalimantan Barat.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-xl text-gray-800 mb-2">
              📞 Kontak
            </h3>
            <p className="text-gray-600">
              +62 858 4521 4967 <br />
              garisas336@gmail.com
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-xl text-gray-800 mb-2">
              ⏰ Jam Operasional
            </h3>
            <p className="text-gray-600">
              Setiap Hari <br />
              09.00 - 21.00 WIB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
