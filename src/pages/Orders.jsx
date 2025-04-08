import { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import format from "date-fns/format";
import id from "date-fns/locale/id";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const { authFetch } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AS Denim - Pesanan";
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await authFetch("/api/user/user_orders");
        const data = await response.json();
        if (response.ok) {
          setOrders(data);
        } else {
          console.error("Failed to fetch orders:", data.message);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [authFetch]);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Pesanan Saya</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">Anda belum memiliki pesanan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border-b p-3 font-semibold">No. Order</th>
                <th className="border-b p-3 font-semibold">Tanggal</th>
                <th className="border-b p-3 font-semibold">Status</th>
                <th className="border-b p-3 font-semibold">Total</th>
                <th className="border-b p-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="border-b p-3">{order.order_number}</td>
                  <td className="border-b p-3">
                    {format(new Date(order.created_at), "dd MMM yyyy HH:mm", {
                      locale: id,
                    })}
                  </td>
                  <td className="border-b p-3 capitalize">{order.status}</td>
                  <td className="border-b p-3">
                    Rp {Number(order.total_amount).toLocaleString("id-ID")}
                  </td>
                  <td className="border-b p-3">
                    <button
                      onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Lihat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
