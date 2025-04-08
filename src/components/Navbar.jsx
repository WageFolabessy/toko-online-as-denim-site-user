import { useContext, useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { getCartCount, token, handleLogout } = useContext(AppContext);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img src={assets.as_logo} alt="Logo" className="h-20 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {["BERANDA", "KOLEKSI", "TENTANG KAMI", "KONTAK"].map(
                (label, index) => {
                  const paths = ["/", "/collection", "/about", "/contact"];
                  return (
                    <NavLink
                      key={index}
                      to={paths[index]}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive
                            ? "text-white bg-gray-900"
                            : "text-gray-300 hover:text-white hover:bg-gray-700"
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  );
                }
              )}
            </div>
          </div>

          {/* Profile & Cart */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={profileRef}>
              {token ? (
                <>
                  <FontAwesomeIcon
                    icon={faUser}
                    className="cursor-pointer text-white text-xl"
                    onClick={() => setShowProfileDropdown((prev) => !prev)}
                  />
                  {showProfileDropdown && (
                    <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                      >
                        <Link
                          to="/dashboard"
                          onClick={() => setShowProfileDropdown(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowProfileDropdown(false);
                          }}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-sm text-white hover:underline"
                >
                  Masuk
                </Link>
              )}
            </div>
            <Link to="/cart" className="relative">
              <FontAwesomeIcon
                icon={faShoppingCart}
                className="text-white text-xl"
              />
              <span className="absolute -top-1 -right-1 bg-red-600 rounded-full h-5 w-5 flex items-center justify-center text-xs text-white">
                {getCartCount()}
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setSidebarVisible(true)}
                className="text-white focus:outline-none"
              >
                <img src={assets.menu_icon} className="w-6 bg-white text-white" alt="Menu Icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-gray-800 bg-opacity-95 transform transition-transform duration-300 ease-in-out ${
          sidebarVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <div
            onClick={() => setSidebarVisible(false)}
            className="mb-4 flex items-center cursor-pointer"
          >
            <img
              className="h-6 w-6 transform rotate-180"
              src={assets.dropdown_icon}
              alt="Back Icon"
            />
            <span className="ml-2 text-white">Kembali</span>
          </div>
          <div className="space-y-2">
            {["BERANDA", "KOLEKSI", "TENTANG KAMI", "KONTAK"].map(
              (label, index) => {
                const paths = ["/", "/collection", "/about", "/contact"];
                return (
                  <NavLink
                    key={index}
                    onClick={() => setSidebarVisible(false)}
                    to={paths[index]}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                        isActive
                          ? "text-white bg-gray-900"
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                );
              }
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
