import { assets } from "../assets/assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-0 sm:mt-40 text-sm">
        <div>
          <Link to="/">
            <img
              src={assets.as_logo}
              className="mb-5 mt-10 sm:mt-0 w-40"
              alt=""
            />
          </Link>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">Layanan Pelanggan</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li className="cursor-pointer hover:text-black transition-all duration-300 hover:translate-x-1">
              <Link to="/">Beranda</Link>
            </li>
            <li className="cursor-pointer hover:text-black transition-all duration-300 hover:translate-x-1">
              <Link to="/about">Tentang Kami</Link>
            </li>
            <li className="cursor-pointer hover:text-black transition-all duration-300 hover:translate-x-1">
              Syarat & Ketentuan
            </li>
            <li className="cursor-pointer hover:text-black transition-all duration-300 hover:translate-x-1">
              Pengiriman
            </li>
            <li className="cursor-pointer hover:text-black transition-all duration-300 hover:translate-x-1">
              Kebijakan Privasi
            </li>
            <li className="cursor-pointer hover:text-black transition-all duration-300 hover:translate-x-1">
              FAQs
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">Kontak</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li className="cursor-pointer hover:text-black transition-all duration-300 hover:translate-x-1">
              <a
                href="https://wa.me/6285845214967"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <FontAwesomeIcon
                  icon={faPhone}
                  style={{ marginRight: "10px" }}
                />
                +62 858 4521 4967
              </a>
            </li>
            <li className="cursor-pointer hover:text-black transition-all duration-300 hover:translate-x-1">
              <a
                href="mailto:garisas336@gmail.com"
                className="flex items-center"
              >
                <FontAwesomeIcon
                  icon={faEnvelope}
                  style={{ marginRight: "10px" }}
                />
                garisas336@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div>
        <hr />
        <p className="py-5 text-size-sm text-center">
          Copyright 2025 - <span className="text-red-600">Garis AS</span> - All
          Right Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
