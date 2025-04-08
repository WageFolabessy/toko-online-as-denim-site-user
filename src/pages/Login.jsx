import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

const AuthForm = () => {
  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const getInitialFormData = () => ({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = `AS Denim - ${isLogin ? "Masuk" : "Register"}`;
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null, global: null }));
  };

  const validateFormData = (data) => {
    const errors = {};
    if (!data.email) errors.email = ["Email wajib diisi."];
    if (!data.password) errors.password = ["Password wajib diisi."];
    if (!isLogin) {
      if (!data.name) errors.name = ["Nama wajib diisi."];
      if (!data.password_confirmation)
        errors.password_confirmation = ["Konfirmasi password wajib diisi."];
      if (data.password !== data.password_confirmation)
        errors.password_confirmation = ["Konfirmasi password tidak cocok."];
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFormData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const endpoint = isLogin ? "/api/user/login" : "/api/user/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          setToken(data.token);
          toast.success("Login berhasil!");
          navigate("/");
        } else {
          toast.success("Registrasi berhasil! Silakan login.");
          resetForm();
          setIsLogin(true);
        }
      } else if (response.status === 422) {
        setErrors(data.errors || {});
      } else {
        throw new Error(data.message || "Terjadi kesalahan.");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error.message || "Terjadi kesalahan jaringan.");
    }
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setErrors({});
  };

  const toggleForm = () => {
    resetForm();
    setIsLogin(!isLogin);
  };

  return (
    <div className="pt-24">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-14 gap-4 text-gray-800 bg-white p-6 rounded-lg shadow-md"
      >
        <div className="flex items-center gap-2 mb-4">
          <p className="prata-reguler text-3xl">
            {isLogin ? "MASUK" : "DAFTAR"}
          </p>
          <hr className="border-none h-[2px] w-8 bg-gray-800" />
        </div>

        {errors.global && (
          <div className="text-red-500 text-sm text-center">
            <p>{errors.global}</p>
          </div>
        )}

        {renderFormFields()}

        <button className="bg-black hover:bg-gray-900 text-white font-light px-8 py-2 mt-4 rounded-md transition-all duration-300">
          {isLogin ? "MASUK" : "DAFTAR"}
        </button>

        <p className="mt-4 text-sm text-center">
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={toggleForm}
          >
            {isLogin ? "Daftar" : "Masuk"}
          </span>
        </p>

        {isLogin && (
          <p className="mt-2 text-sm text-center">
            <Link
              to="/forgot-password"
              className="text-blue-500 hover:underline"
            >
              Lupa Password?
            </Link>
          </p>
        )}
      </form>
    </div>
  );

  function renderFormFields() {
    const fields = [];

    if (!isLogin) {
      fields.push({ label: "Nama Lengkap", name: "name", type: "text" });
    }

    fields.push(
      { label: "Email", name: "email", type: "email" },
      { label: "Password", name: "password", type: "password" }
    );

    if (!isLogin) {
      fields.push({
        label: "Konfirmasi Password",
        name: "password_confirmation",
        type: "password",
      });
    }

    return (
      <>
        {fields.map((field) => (
          <div key={field.name} className="w-full">
            <input
              name={field.name}
              type={field.type}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.label}
              className={`w-full px-4 py-2 border ${
                errors[field.name] ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
              required
            />
            {errors[field.name] && (
              <p className="text-red-500 text-xs mt-1">
                {errors[field.name][0]}
              </p>
            )}
          </div>
        ))}
      </>
    );
  }
};

export default AuthForm;
