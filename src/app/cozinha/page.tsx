"use client";

import { useState, useEffect, useCallback } from "react";

interface OrderItemData {
  id: number;
  orderId: number;
  itemName: string;
  category: string;
  price: number;
  quantity: number;
  removedIngredients: string[] | null;
  notes: string | null;
}

interface OrderData {
  id: number;
  customerNumber: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItemData[];
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filter, setFilter] = useState<string>("pendente");
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?status=${filter}`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-600";
      case "preparando":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case "pendente":
        return "border-yellow-500/50";
      case "preparando":
        return "border-blue-500/50";
      default:
        return "border-gray-500/50";
    }
  };

  const timeSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "agora";
    if (diffMin < 60) return `${diffMin}min`;
    const hours = Math.floor(diffMin / 60);
    return `${hours}h ${diffMin % 60}min`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-purple-700 px-4 py-3 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍳</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Cozinha</h1>
              <p className="text-blue-200 text-sm">
                Juke Bar - Painel de Pedidos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              📋 Balcão
            </a>
            <button
              onClick={fetchOrders}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Filter Tabs - only pendente and preparando */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: "pendente", label: "🔴 Pendentes" },
            { key: "preparando", label: "🔵 Preparando" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setFilter(tab.key);
                setLoading(true);
              }}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                filter === tab.key
                  ? `${getStatusColor(tab.key)} text-white shadow-lg`
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-lg">Carregando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">
              {filter === "pendente" ? "✅" : "📭"}
            </div>
            <p className="text-lg">
              {filter === "pendente"
                ? "Nenhum pedido pendente!"
                : "Nenhum pedido sendo preparado"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`bg-gray-900 rounded-xl border-2 ${getStatusBorder(
                  order.status
                )} overflow-hidden shadow-lg`}
              >
                {/* Order Header */}
                <div
                  className={`${getStatusColor(
                    order.status
                  )} px-4 py-3 flex justify-between items-center`}
                >
                  <div>
                    <span className="font-bold text-lg">
                      Pedido #{order.id}
                    </span>
                    <span className="ml-2 text-white/80 text-sm">
                      • {timeSince(order.createdAt)}
                    </span>
                  </div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium uppercase">
                    {order.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="px-4 py-3 border-b border-gray-800 bg-gray-800/50">
                  <p className="text-white font-medium">
                    👤 {order.customerName}
                  </p>
                  <p className="text-gray-400 text-sm">
                    📍 {order.customerNumber}
                  </p>
                </div>

                {/* Items */}
                <div className="p-4">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-800 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-white text-sm">
                              <span className="text-orange-400 font-bold mr-1">
                                {item.quantity}x
                              </span>
                              {item.itemName}
                            </p>
                            {item.removedIngredients &&
                              item.removedIngredients.length > 0 && (
                                <p className="text-red-400 text-xs mt-1 font-medium">
                                  ❌ SEM:{" "}
                                  {item.removedIngredients.join(", ")}
                                </p>
                              )}
                          </div>
                          <span className="text-gray-400 text-xs ml-2">
                            R${item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800">
                    <span className="text-gray-400 text-sm font-medium">
                      Total:
                    </span>
                    <span className="text-orange-400 font-bold text-lg">
                      R${order.total}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4 flex gap-2">
                  {order.status === "pendente" && (
                    <button
                      onClick={() => updateStatus(order.id, "preparando")}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-bold transition-colors text-sm"
                    >
                      👨‍🍳 Preparar
                    </button>
                  )}
                  {order.status === "preparando" && (
                    <button
                      onClick={() => updateStatus(order.id, "pronto")}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-lg font-bold transition-colors text-sm"
                    >
                      ✅ Pronto
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(order.id, "pendente")}
                    className="bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-400 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
                    title="Voltar para pendente"
                  >
                    ↩️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
