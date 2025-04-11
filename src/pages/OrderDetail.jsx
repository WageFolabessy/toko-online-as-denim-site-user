import { useEffect, useState, useContext, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationCircle,
  faCopy,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";

const OrderDetail = () => {
  const { authFetch, currency } = useContext(AppContext);
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const invoiceRef = useRef(null);

  const formatCurrency = (amount) => {
    const numericAmount = typeof amount === "number" ? amount : 0;
    return (
      (currency || "Rp ") +
      numericAmount.toLocaleString("id-ID", { minimumFractionDigits: 0 })
    );
  };

  useEffect(() => {
    document.title = `AS Denim - Detail Order`;
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      setOrder(null);
      try {
        const response = await authFetch(`/api/user/user_orders/${orderId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 404) {
            throw new Error("Pesanan tidak ditemukan.");
          }
          throw new Error(
            errorData?.message ||
              `Gagal mengambil detail pesanan (${response.status})`
          );
        }
        const data = await response.json();

        const orderData = data?.data || data;

        if (
          orderData &&
          orderData.id &&
          orderData.order_number &&
          Array.isArray(orderData.items)
        ) {
          setOrder(orderData);
          document.title = `AS Denim - Order ${orderData.order_number}`;
        } else {
          throw new Error("Format data detail pesanan tidak valid.");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        if (error.message !== "Unauthorized" && error.message !== "Forbidden") {
          setError(
            error.message || "Terjadi kesalahan saat mengambil detail pesanan."
          );
        }
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      setError("ID Pesanan tidak valid.");
      setLoading(false);
    }
  }, [authFetch, orderId]);

  const copyTrackingNumber = () => {
    if (order?.shipment?.tracking_number) {
      navigator.clipboard
        .writeText(order.shipment.tracking_number)
        .then(() => toast.success("Nomor resi berhasil disalin"))
        .catch((err) => {
          console.error("Gagal menyalin resi:", err);
          toast.error("Gagal menyalin nomor resi.");
        });
    }
  };

  const downloadInvoice = () => {
    const invoiceElement = invoiceRef.current;
    if (!invoiceElement) return;

    const storeNameEl = document.createElement("h1");
    storeNameEl.textContent = "AS Denim";
    storeNameEl.className = "text-center text-2xl font-bold mb-6 pt-4";
    invoiceElement.prepend(storeNameEl);

    const elementsToHide = invoiceElement.querySelectorAll(".hide-on-print");
    elementsToHide.forEach((el) => (el.style.visibility = "hidden"));

    html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    })
      .then((canvas) => {
        const link = document.createElement("a");
        link.download = `Nota_ASDenim_${order?.order_number || orderId}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      })
      .catch((err) => {
        console.error("Gagal mengunduh nota (html2canvas):", err);
        toast.error("Gagal membuat file nota.");
      })
      .finally(() => {
        if (invoiceElement.contains(storeNameEl)) {
          invoiceElement.removeChild(storeNameEl);
        }
        elementsToHide.forEach((el) => (el.style.visibility = "visible"));
      });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center min-h-[300px] flex justify-center items-center">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="lg"
          className="text-gray-400"
        />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
        {error || "Gagal memuat detail pesanan."}
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="ml-3 text-xs text-blue-600 underline"
        >
          Kembali ke Daftar Pesanan
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Detail Pesanan
        </h2>
        <button
          onClick={downloadInvoice}
          className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded shadow text-sm hide-on-print"
        >
          <FontAwesomeIcon icon={faPrint} className="mr-2" /> Unduh Nota
        </button>
      </div>

      <div
        ref={invoiceRef}
        className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
      >
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Informasi Pesanan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="font-semibold text-gray-600 w-28 inline-block">
                No. Order:
              </span>{" "}
              {order.order_number}
            </div>
            <div>
              <span className="font-semibold text-gray-600 w-28 inline-block">
                Status Pesanan:
              </span>{" "}
              <span className="capitalize font-medium">
                {order.status?.replace("_", " ")}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-600 w-28 inline-block">
                Tanggal Pesan:
              </span>{" "}
              {order.order_date
                ? format(new Date(order.order_date), "dd MMM yyyy, HH:mm", {
                    locale: id,
                  })
                : "-"}
            </div>
            <div>
              <span className="font-semibold text-gray-600 w-28 inline-block">
                Total Bayar:
              </span>{" "}
              <span className="font-semibold">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
            {order.payment && (
              <>
                <div>
                  <span className="font-semibold text-gray-600 w-28 inline-block">
                    Metode Bayar:
                  </span>{" "}
                  {order.payment.payment_type
                    ?.replace(/_/g, " ")
                    ?.toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-gray-600 w-28 inline-block">
                    Status Bayar:
                  </span>{" "}
                  <span className="capitalize font-medium">
                    {order.payment.status}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-4 border-b border-gray-200">
          {order.address && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                Alamat Pengiriman
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-medium">{order.address.recipient_name}</p>
                <p>{order.address.phone_number}</p>
                <p>{order.address.address_line1}</p>
                {order.address.address_line2 && (
                  <p>{order.address.address_line2}</p>
                )}
                <p>
                  {order.address.city}, {order.address.province}{" "}
                  {order.address.postal_code}
                </p>
              </div>
            </div>
          )}
          {order.shipment && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                Info Pengiriman
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Kurir:</span>{" "}
                  {order.shipment.courier?.toUpperCase()} (
                  {order.shipment.service})
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className="capitalize font-medium">
                    {order.shipment.status}
                  </span>
                </p>
                <div className="flex items-center">
                  <span className="font-medium mr-1">Resi:</span>
                  {order.shipment.tracking_number ? (
                    <span className="flex items-center gap-2">
                      <span>{order.shipment.tracking_number}</span>
                      <button
                        onClick={copyTrackingNumber}
                        className="p-1 text-blue-600 hover:text-blue-800 hide-on-print"
                        title="Salin nomor resi"
                      >
                        <FontAwesomeIcon icon={faCopy} size="xs" />
                      </button>
                    </span>
                  ) : (
                    <span>Belum Tersedia</span>
                  )}
                </div>
                <p>
                  <span className="font-medium">Ongkir:</span>{" "}
                  {formatCurrency(order.shipment.shipping_cost)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Produk yang Dipesan
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 text-xs uppercase">
                  <th className="border-b font-semibold p-2">Produk</th>
                  <th className="border-b font-semibold p-2 text-right">
                    Harga Satuan
                  </th>
                  <th className="border-b font-semibold p-2 text-center">
                    Qty
                  </th>
                  <th className="border-b font-semibold p-2 text-right">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border-b p-2">
                      {item.product
                        ? item.product.name
                        : "Produk Tidak Tersedia"}
                    </td>
                    <td className="border-b p-2 text-right whitespace-nowrap">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="border-b p-2 text-center">{item.qty}</td>
                    <td className="border-b p-2 text-right whitespace-nowrap">
                      {formatCurrency(item.price * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-right font-semibold p-2 pt-3">
                    Subtotal Produk:
                  </td>
                  <td className="text-right font-semibold p-2 pt-3 whitespace-nowrap">
                    {formatCurrency(order.total_amount - order.shipping_cost)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-right font-semibold p-2">
                    Biaya Pengiriman:
                  </td>
                  <td className="text-right font-semibold p-2 whitespace-nowrap">
                    {formatCurrency(order.shipping_cost)}
                  </td>
                </tr>
                <tr className="bg-gray-100 font-bold text-base">
                  <td colSpan="3" className="text-right p-2">
                    Grand Total:
                  </td>
                  <td className="text-right p-2 whitespace-nowrap">
                    {formatCurrency(order.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
