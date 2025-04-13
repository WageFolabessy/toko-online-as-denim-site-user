import { useState, useEffect, useContext, useCallback } from "react";
import { FaStar } from "react-icons/fa"; // Using react-icons for stars
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const colors = {
  orange: "#FFBA5A",
  grey: "#a9a9a9",
};

const ProductReview = ({ productId }) => {
  const { authFetch, token, user: contextUser } = useContext(AppContext);

  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(contextUser || null);
  const [eligibility, setEligibility] = useState({
    checked: false,
    eligible: false,
    reason: "",
  });
  const [reviewInput, setReviewInput] = useState({
    rating: 0,
    hoverRating: 0,
    text: "",
  });
  const [editingReview, setEditingReview] = useState({
    id: null,
    rating: 0,
    hoverRating: 0,
    text: "",
  });
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!token || currentUser) return;
    try {
      const response = await authFetch("/api/user/get_user");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.data);
      } else {
        console.error("Failed to fetch user profile:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, [authFetch, token, currentUser]);

  const fetchReviews = useCallback(async () => {
    try {
      const fetchFn = token ? authFetch : fetch;
      const response = await fetchFn(`/api/user/product/${productId}/reviews`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setReviews(data.data || data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Gagal memuat review produk.");
      setReviews([]);
    }
  }, [authFetch, productId, token]);

  const checkEligibility = useCallback(async () => {
    if (!token) {
      setEligibility({
        checked: true,
        eligible: false,
        reason: "User not logged in.",
      });
      return;
    }
    try {
      const response = await authFetch(
        `/api/user/product/${productId}/review-eligibility`
      );
      if (response.ok) {
        const data = await response.json();
        setEligibility({
          checked: true,
          eligible: data.eligible,
          reason: data.reason || "",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Eligibility check failed:",
          response.statusText,
          errorData
        );
        setEligibility({
          checked: true,
          eligible: false,
          reason: errorData.message || "Gagal memeriksa kelayakan review.",
        });
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      setEligibility({
        checked: true,
        eligible: false,
        reason: "Kesalahan jaringan saat memeriksa kelayakan.",
      });
    }
  }, [authFetch, productId, token]);

  useEffect(() => {
    setLoadingInit(true);
    Promise.all([
      fetchUserProfile(),
      fetchReviews(),
      checkEligibility(),
    ]).finally(() => {
      setLoadingInit(false);
    });
  }, [fetchUserProfile, fetchReviews, checkEligibility]);

  const currentUserReview =
    token && currentUser
      ? reviews.find((review) => review.user?.id === currentUser.id)
      : null;

  const handleRatingChange = (newRating) => {
    setReviewInput((prev) => ({ ...prev, rating: newRating }));
  };

  const handleHoverRatingChange = (hoverValue) => {
    setReviewInput((prev) => ({ ...prev, hoverRating: hoverValue }));
  };

  const handleTextChange = (e) => {
    setReviewInput((prev) => ({ ...prev, text: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reviewInput.rating === 0) {
      toast.error("Silakan berikan rating bintang.");
      return;
    }
    setLoadingSubmit(true);
    try {
      const response = await authFetch(
        `/api/user/product/${productId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            rating: reviewInput.rating,
            review: reviewInput.text,
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Review berhasil dikirim.");
        const newReview = data.review;
        if (newReview && !newReview.user && currentUser) {
          newReview.user = { id: currentUser.id, name: currentUser.name };
        }
        setReviews((prev) => [newReview, ...prev]);
        setReviewInput({ rating: 0, hoverRating: 0, text: "" });
        checkEligibility();
      } else {
        throw new Error(data.message || "Gagal mengirim review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Terjadi kesalahan saat mengirim review.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const startEditing = (review) => {
    setEditingReview({
      id: review.id,
      rating: review.rating,
      hoverRating: 0,
      text: review.review || "",
    });
  };

  const cancelEditing = () => {
    setEditingReview({ id: null, rating: 0, hoverRating: 0, text: "" });
  };

  const handleEditRatingChange = (newRating) => {
    setEditingReview((prev) => ({ ...prev, rating: newRating }));
  };

  const handleEditHoverRatingChange = (hoverValue) => {
    setEditingReview((prev) => ({ ...prev, hoverRating: hoverValue }));
  };

  const handleEditTextChange = (e) => {
    setEditingReview((prev) => ({ ...prev, text: e.target.value }));
  };

  const handleEditSubmit = async (reviewId) => {
    if (editingReview.rating === 0) {
      toast.error("Silakan berikan rating bintang.");
      return;
    }
    setLoadingSubmit(true);
    try {
      const response = await authFetch(`/api/user/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          rating: editingReview.rating,
          review: editingReview.text,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Review berhasil diperbarui.");
        const updatedReview = data.review;
        if (updatedReview && !updatedReview.user && currentUser) {
          updatedReview.user = { id: currentUser.id, name: currentUser.name };
        }
        setReviews((prev) =>
          prev.map((rev) => (rev.id === reviewId ? updatedReview : rev))
        );
        cancelEditing();
      } else {
        throw new Error(data.message || "Gagal memperbarui review.");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error(
        error.message || "Terjadi kesalahan saat memperbarui review."
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus review ini?"))
      return;

    setLoadingSubmit(true);
    try {
      const response = await authFetch(`/api/user/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (response.ok || response.status === 204) {
        toast.success("Review berhasil dihapus.");
        setReviews((prev) => prev.filter((rev) => rev.id !== reviewId));
        checkEligibility();
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Gagal menghapus review.");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(error.message || "Terjadi kesalahan saat menghapus review.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const renderStars = (
    currentRating,
    hoverValue,
    setRatingFn,
    setHoverFn,
    interactive = true
  ) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={!interactive || loadingSubmit}
        onClick={() => interactive && setRatingFn(star)}
        onMouseEnter={() => interactive && setHoverFn(star)}
        onMouseLeave={() => interactive && setHoverFn(0)}
        className={`disabled:opacity-50 disabled:cursor-not-allowed ${
          interactive ? "cursor-pointer" : "cursor-default"
        }`}
        aria-label={`Rate ${star} out of 5 stars`}
      >
        <FaStar
          className={`text-2xl transition-colors duration-150 ease-in-out ${
            interactive ? "hover:scale-110" : ""
          }`}
          color={
            (hoverValue || currentRating) >= star ? colors.orange : colors.grey
          }
        />
      </button>
    ));
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-6 border-b pb-3">
        Review Produk
      </h2>

      {loadingInit && (
        <div className="text-center py-6">
          <p className="text-gray-500">Memuat review...</p>
        </div>
      )}

      {!loadingInit && (
        <>
          {token &&
            eligibility.checked &&
            eligibility.eligible &&
            !currentUserReview && (
              <form
                onSubmit={handleSubmit}
                className="mb-8 p-4 sm:p-6 bg-white rounded-lg shadow-md border border-gray-200"
              >
                <h3 className="text-lg sm:text-xl font-medium mb-4">
                  Berikan Penilaian Anda
                </h3>
                <div className="flex items-center mb-4 space-x-1">
                  {renderStars(
                    reviewInput.rating,
                    reviewInput.hoverRating,
                    handleRatingChange,
                    handleHoverRatingChange,
                    true
                  )}
                  {reviewInput.rating > 0 && (
                    <span className="ml-3 text-sm font-medium text-gray-600">
                      ({reviewInput.rating}/5)
                    </span>
                  )}
                </div>
                {/* Text Input */}
                <textarea
                  value={reviewInput.text}
                  onChange={handleTextChange}
                  placeholder="Bagikan pendapat Anda tentang produk ini..."
                  className="w-full border p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  rows="4"
                  maxLength={1000}
                  disabled={loadingSubmit}
                />
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loadingSubmit || reviewInput.rating === 0}
                  className="bg-blue-600 text-white px-5 py-2 rounded font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loadingSubmit ? "Mengirim..." : "Kirim Review"}
                </button>
              </form>
            )}

          {token && eligibility.checked && !eligibility.eligible && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
              {eligibility.reason ||
                "Anda tidak dapat memberikan review untuk produk ini saat ini."}
            </div>
          )}
          {!token && eligibility.checked && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm">
              Silakan{" "}
              <a
                href="/login"
                className="font-medium underline hover:text-blue-600"
              >
                login
              </a>{" "}
              untuk memberikan review.
            </div>
          )}
        </>
      )}

      {!loadingInit && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-100"
            >
              {editingReview.id === review.id ? (
                <div className="space-y-3">
                  {/* Edit Stars */}
                  <div className="flex items-center space-x-1">
                    {renderStars(
                      editingReview.rating,
                      editingReview.hoverRating,
                      handleEditRatingChange,
                      handleEditHoverRatingChange,
                      true
                    )}
                    {editingReview.rating > 0 && (
                      <span className="ml-3 text-sm font-medium text-gray-600">
                        ({editingReview.rating}/5)
                      </span>
                    )}
                  </div>
                  {/* Edit Textarea */}
                  <textarea
                    value={editingReview.text}
                    onChange={handleEditTextChange}
                    className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-150 ease-in-out"
                    rows="3"
                    maxLength={1000}
                    disabled={loadingSubmit}
                  />
                  {/* Edit Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditSubmit(review.id)}
                      disabled={loadingSubmit || editingReview.rating === 0}
                      className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loadingSubmit ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={loadingSubmit}
                      className="bg-gray-500 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(
                        review.rating,
                        0,
                        () => {},
                        () => {},
                        false
                      )}{" "}
                      {/* Non-interactive stars */}
                    </div>
                    <span className="ml-3 text-sm font-semibold text-gray-700">
                      {review.user?.name || "Pengguna"} {/* Fallback name */}
                    </span>
                  </div>
                  {/* Display Review Text */}
                  {review.review && (
                    <p className="text-gray-800 text-base leading-relaxed">
                      {review.review}
                    </p>
                  )}
                  {token &&
                    currentUser &&
                    review.user?.id === currentUser.id && (
                      <div className="mt-3 flex gap-4">
                        <button
                          onClick={() => startEditing(review)}
                          disabled={loadingSubmit}
                          className="text-blue-600 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          disabled={loadingSubmit}
                          className="text-red-600 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loadingInit && reviews.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          Belum ada review untuk produk ini.
        </p>
      )}
    </div>
  );
};

export default ProductReview;
