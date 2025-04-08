import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const token = query.get("token");
  const email = query.get("email");

  useEffect(() => {
    document.title = "AS Denim - Reset Password";
    if (!token || !email) {
      toast.error("Link reset password tidak valid.");
      navigate("/login");
    }
  }, [token, email, navigate]);

  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null, global: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: "Konfirmasi password tidak cocok." });
      return;
    }

    try {
      const response = await fetch("/api/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Password berhasil direset.");
        navigate("/login");
      } else if (response.status === 422) {
        setErrors(data.errors || {});
      } else {
        toast.error(data.message || "Terjadi kesalahan, silakan coba lagi.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan, silakan coba lagi.");
    }
  };

  return (
    <div className="pt-24">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
      >
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-reguler text-3xl">RESET PASSWORD</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>

        <p className="text-sm text-center text-gray-700 mb-2">
          Masukkan password baru Anda dan konfirmasi.
        </p>

        <div className="w-full">
          <input
            type="password"
            name="password"
            placeholder="Password Baru"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-800"
            required
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="w-full">
          <input
            type="password"
            name="password_confirmation"
            placeholder="Konfirmasi Password Baru"
            value={formData.password_confirmation}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-800"
            required
          />
          {errors.password_confirmation && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password_confirmation}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="bg-black text-white font-light px-8 py-2 mt-4"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
