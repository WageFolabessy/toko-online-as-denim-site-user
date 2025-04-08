import { assets } from "../assets/assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 mt-20 text-gray-300">
      <div className="container mx-auto px-4 py-10 text-sm sm:text-base">
        <div className="flex flex-col sm:grid sm:grid-cols-[3fr_1fr_1fr] gap-10 sm:gap-14">
          {/* Logo */}
          <div>
            <Link to="/">
              <img
                src={assets.as_logo}
                className="mb-5 w-36 sm:w-40"
                alt="AS Denim Logo"
              />
            </Link>
          </div>

          {/* Layanan Pelanggan */}
          <div>
            <p className="text-lg font-semibold mb-4">Layanan Pelanggan</p>
            <ul className="flex flex-col gap-2 text-gray-300">
              <li>
                <Link
                  to="/"
                  className="hover:text-gray-500 transition duration-300 hover:translate-x-1 inline-block"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-gray-500 transition duration-300 hover:translate-x-1 inline-block"
                >
                  Tentang Kami
                </Link>
              </li>
              <li className="hover:text-gray-500 transition duration-300 hover:translate-x-1 cursor-pointer">
                Syarat & Ketentuan
              </li>
              <li className="hover:text-gray-500 transition duration-300 hover:translate-x-1 cursor-pointer">
                Pengiriman
              </li>
              <li className="hover:text-gray-500 transition duration-300 hover:translate-x-1 cursor-pointer">
                Kebijakan Privasi
              </li>
              <li className="hover:text-gray-500 transition duration-300 hover:translate-x-1 cursor-pointer">
                FAQs
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <p className="text-lg font-semibold mb-4">Kontak</p>
            <ul className="flex flex-col gap-2 text-gray-300">
              <li>
                <a
                  href="https://wa.me/6285845214967"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-gray-500 transition duration-300"
                >
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  +62 858 4521 4967
                </a>
              </li>
              <li>
                <a
                  href="mailto:garisas336@gmail.com"
                  className="flex items-center hover:text-gray-500 transition duration-300"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  garisas336@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bawah */}
        <div className="mt-10 border-t pt-4 text-center text-gray-300 text-sm">
          <p>
            &copy; 2025 -{" "}
            <span className="text-red-600 font-medium">Garis AS</span> - All
            Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
