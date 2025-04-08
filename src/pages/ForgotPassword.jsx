import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  useEffect(() => {
    document.title = "AS Denim - Lupa Password";
  }, []);

  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email wajib diisi.");
      return;
    }

    try {
      const response = await fetch("/api/password/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Link reset password telah dikirim.");
        setMessage(data.message);
      } else {
        setError(data.message || "Terjadi kesalahan, silakan coba lagi.");
        toast.error(data.message || "Terjadi kesalahan, silakan coba lagi.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan, silakan coba lagi.", err);
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
          <p className="prata-reguler text-3xl">LUPA PASSWORD</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>

        <p className="text-center text-sm text-gray-700 mb-2">
          Masukkan email Anda yang terdaftar untuk menerima link reset password.
        </p>

        <div className="w-full">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-3 py-2 border border-gray-800"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            required
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          {message && <p className="text-green-500 text-sm mt-1">{message}</p>}
        </div>

        <button
          type="submit"
          className="bg-black text-white font-light px-8 py-2 mt-4"
        >
          Kirim Link Reset
        </button>

        <p className="mt-4 text-sm">
          Kembali ke{" "}
          <Link to="/login" className="text-blue-500">
            Halaman Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
