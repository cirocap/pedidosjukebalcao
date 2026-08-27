"use client";

import { useState, useEffect, useCallback } from "react";

interface ProductData {
  id: number;
  name: string;
  price: number;
  category: string;
  ingredients: string[] | null;
  duploPrice: number | null;
  isSandwich: boolean;
  sortOrder: number;
}

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  removedIngredients: string[];
  isDuplo?: boolean;
}

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

const categoryEmojis: Record<string, string> = {
  "Hambúrguers": "🍔",
  "Porções": "🍟",
  "Adicionais": "➕",
  "Chopes": "🍺",
  "Shots": "🥃",
  "Drinks": "🍹",
  "Sem Álcool": "🚫",
  "Caipirinhas": "🍋",
  "Red Bull Combos": "🐂",
};

const categoryOrderMap: Record<string, number> = {
  "Hambúrguers": 1,
  "Porções": 2,
  "Adicionais": 3,
  "Chopes": 4,
  "Shots": 5,
  "Drinks": 6,
  "Sem Álcool": 7,
  "Caipirinhas": 8,
  "Red Bull Combos": 9,
};

type MainTab = "pedido" | "prontos" | "entregues";

export default function CounterPage() {
  const [mainTab, setMainTab] = useState<MainTab>("pedido");
  const [customerNumber, setCustomerNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [ingredientModal, setIngredientModal] = useState<{
    product: ProductData;
    isDuplo: boolean;
  } | null>(null);
  const [selectedRemovals, setSelectedRemovals] = useState<string[]>([]);

  // DB products
  const [productsByCategory, setProductsByCategory] = useState<
    Record<string, ProductData[]>
  >({});
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Orders for "prontos" and "entregues" tabs
  const [readyOrders, setReadyOrders] = useState<OrderData[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Load products from DB
  useEffect(() => {
    const load = async () => {
      try {
        // Seed if needed
        await fetch("/api/products/seed", { method: "POST" });

        const res = await fetch("/api/products");
        const data: ProductData[] = await res.json();

        const grouped: Record<string, ProductData[]> = {};
        for (const p of data) {
          if (!grouped[p.category]) grouped[p.category] = [];
          grouped[p.category].push(p);
        }
        setProductsByCategory(grouped);
        const cats = Object.keys(grouped).sort(
          (a, b) => (categoryOrderMap[a] ?? 99) - (categoryOrderMap[b] ?? 99)
        );
        if (cats.length > 0 && !activeCategory) {
          setActiveCategory(cats[0]);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load orders for prontos/entregues
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const [readyRes, deliveredRes] = await Promise.all([
        fetch("/api/orders?status=pronto"),
        fetch("/api/orders?status=entregue"),
      ]);
      const readyData = await readyRes.json();
      const deliveredData = await deliveredRes.json();
      setReadyOrders(readyData);
      setDeliveredOrders(deliveredData);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (mainTab === "prontos" || mainTab === "entregues") {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [mainTab, fetchOrders]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const addToCart = useCallback(
    (product: ProductData, removedIngredients: string[] = [], isDuplo = false) => {
      const price =
        isDuplo && product.duploPrice ? product.duploPrice : product.price;
      const name = isDuplo ? `${product.name} (Duplo)` : product.name;
      const id = `${name}-${removedIngredients.sort().join(",")}-${Date.now()}`;

      setCart((prev) => [
        ...prev,
        {
          id,
          name,
          category: product.category,
          price,
          quantity: 1,
          removedIngredients,
          isDuplo,
        },
      ]);
    },
    []
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOpenIngredientModal = (product: ProductData, isDuplo: boolean) => {
    setSelectedRemovals([]);
    setIngredientModal({ product, isDuplo });
  };

  const handleConfirmSandwich = () => {
    if (!ingredientModal) return;
    addToCart(
      ingredientModal.product,
      [...selectedRemovals],
      ingredientModal.isDuplo
    );
    setIngredientModal(null);
    setSelectedRemovals([]);
  };

  const sendOrder = async () => {
    if (!customerNumber.trim() || !customerName.trim()) {
      alert("Preencha o número e o nome do cliente!");
      return;
    }
    if (cart.length === 0) {
      alert("Adicione itens ao pedido!");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerNumber: customerNumber.trim(),
          customerName: customerName.trim(),
          items: cart.map((item) => ({
            itemName: item.name,
            category: item.category,
            price: item.price,
            quantity: item.quantity,
            removedIngredients: item.removedIngredients,
          })),
        }),
      });

      if (!res.ok) throw new Error("Erro ao enviar pedido");

      setSuccessMessage(
        `✅ Pedido enviado para a cozinha! Cliente: ${customerName}`
      );
      setCart([]);
      setCustomerNumber("");
      setCustomerName("");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch {
      alert("Erro ao enviar o pedido. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  const categories = Object.keys(productsByCategory).sort(
    (a, b) => (categoryOrderMap[a] ?? 99) - (categoryOrderMap[b] ?? 99)
  );

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
      <header className="bg-gradient-to-r from-orange-600 to-red-700 px-4 py-3 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👽</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Juke Bar</h1>
              <p className="text-orange-200 text-sm">
                Sistema de Pedidos - Balcão
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/cozinha"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              🍳 Cozinha
            </a>
            <a
              href="/admin"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              ⚙️ Admin
            </a>
          </div>
        </div>
      </header>

      {/* Main Tabs: Novo Pedido / Prontos / Entregues */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMainTab("pedido")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mainTab === "pedido"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            📝 Novo Pedido
          </button>
          <button
            onClick={() => setMainTab("prontos")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              mainTab === "prontos"
                ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            ✅ Prontos
            {readyOrders.length > 0 && (
              <span className="bg-white/25 px-2 py-0.5 rounded-full text-xs">
                {readyOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setMainTab("entregues")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mainTab === "entregues"
                ? "bg-gray-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            📦 Entregues
          </button>
        </div>
      </div>

      {/* TAB: Novo Pedido */}
      {mainTab === "pedido" && (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 px-4 pb-4">
          {/* Left: Menu */}
          <div className="flex-1 min-w-0">
            {/* Customer Info */}
            <div className="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-800">
              <h2 className="text-lg font-semibold mb-3 text-orange-400">
                📋 Dados do Cliente
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">
                    Número / Mesa
                  </label>
                  <input
                    type="text"
                    value={customerNumber}
                    onChange={(e) => setCustomerNumber(e.target.value)}
                    placeholder="Ex: Mesa 5, Balcão 3..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nome do cliente..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {loadingProducts ? (
              <div className="text-center py-20 text-gray-500">
                <div className="text-4xl mb-4">⏳</div>
                <p>Carregando cardápio...</p>
              </div>
            ) : (
              <>
                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeCategory === cat
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      {categoryEmojis[cat] || "📦"} {cat}
                    </button>
                  ))}
                </div>

                {/* Menu Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {productsByCategory[activeCategory]?.map((product) => (
                    <div
                      key={product.id}
                      className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-orange-500/50 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white text-base">
                          {product.name}
                        </h3>
                        <span className="text-orange-400 font-bold text-lg whitespace-nowrap ml-2">
                          R${product.price}
                        </span>
                      </div>
                      {product.ingredients &&
                        product.ingredients.length > 0 && (
                          <p className="text-gray-500 text-xs mb-3 leading-relaxed">
                            {product.ingredients.join(", ")}
                          </p>
                        )}
                      <div className="flex gap-2 flex-wrap">
                        {product.isSandwich ? (
                          <>
                            <button
                              onClick={() =>
                                handleOpenIngredientModal(product, false)
                              }
                              className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              + Adicionar
                            </button>
                            {product.duploPrice && (
                              <button
                                onClick={() =>
                                  handleOpenIngredientModal(product, true)
                                }
                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                + Duplo R${product.duploPrice}
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            + Adicionar ao Pedido
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: Cart */}
          <div className="lg:w-96 w-full">
            <div className="bg-gray-900 rounded-xl border border-gray-800 sticky top-20">
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-bold text-orange-400">
                  🛒 Pedido Atual
                </h2>
                {customerName && (
                  <p className="text-sm text-gray-400 mt-1">
                    Cliente:{" "}
                    <span className="text-white">{customerName}</span>
                    {customerNumber && (
                      <>
                        {" "}
                        •{" "}
                        <span className="text-white">{customerNumber}</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <p className="text-gray-600 text-center py-8 text-sm">
                    Nenhum item adicionado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-800 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-white truncate">
                              {item.name}
                            </p>
                            {item.removedIngredients.length > 0 && (
                              <p className="text-red-400 text-xs mt-1">
                                ❌ Sem:{" "}
                                {item.removedIngredients.join(", ")}
                              </p>
                            )}
                          </div>
                          <p className="text-orange-400 font-bold text-sm ml-2 whitespace-nowrap">
                            R${item.price * item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-full bg-gray-700 hover:bg-red-600 text-white text-sm flex items-center justify-center transition-colors"
                            >
                              −
                            </button>
                            <span className="text-white font-medium text-sm w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-full bg-gray-700 hover:bg-green-600 text-white text-sm flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            🗑️ Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-white">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-orange-400">
                      R${total}
                    </span>
                  </div>
                  <button
                    onClick={sendOrder}
                    disabled={sending}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-600/30 disabled:shadow-none"
                  >
                    {sending ? "Enviando..." : "🚀 Enviar para Cozinha"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Prontos */}
      {mainTab === "prontos" && (
        <div className="max-w-7xl mx-auto px-4 pb-4">
          {loadingOrders ? (
            <div className="text-center py-20 text-gray-500">
              <div className="text-4xl mb-4">⏳</div>
              <p>Carregando pedidos...</p>
            </div>
          ) : readyOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg">Nenhum pedido pronto no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {readyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={updateOrderStatus}
                  timeSince={timeSince}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Entregues */}
      {mainTab === "entregues" && (
        <div className="max-w-7xl mx-auto px-4 pb-4">
          {loadingOrders ? (
            <div className="text-center py-20 text-gray-500">
              <div className="text-4xl mb-4">⏳</div>
              <p>Carregando pedidos...</p>
            </div>
          ) : deliveredOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg">Nenhum pedido entregue ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {deliveredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={updateOrderStatus}
                  timeSince={timeSince}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ingredient Removal Modal */}
      {ingredientModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-5 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">
                {ingredientModal.product.name}
                {ingredientModal.isDuplo ? " (Duplo)" : ""}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Desmarque os ingredientes que deseja{" "}
                <span className="text-red-400 font-medium">TIRAR</span>
              </p>
            </div>
            <div className="p-5 max-h-[50vh] overflow-y-auto">
              <div className="space-y-2">
                {ingredientModal.product.ingredients?.map((ingredient) => {
                  const isRemoved = selectedRemovals.includes(ingredient);
                  return (
                    <label
                      key={ingredient}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        isRemoved
                          ? "bg-red-900/30 border border-red-800"
                          : "bg-gray-800 border border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isRemoved}
                        onChange={() => {
                          setSelectedRemovals((prev) =>
                            prev.includes(ingredient)
                              ? prev.filter((i) => i !== ingredient)
                              : [...prev, ingredient]
                          );
                        }}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs border-2 transition-colors ${
                          isRemoved
                            ? "bg-red-600 border-red-600 text-white"
                            : "border-gray-500 text-transparent"
                        }`}
                      >
                        ✕
                      </div>
                      <span
                        className={`text-sm ${
                          isRemoved
                            ? "text-red-300 line-through"
                            : "text-white"
                        }`}
                      >
                        {ingredient}
                      </span>
                      {isRemoved && (
                        <span className="ml-auto text-red-400 text-xs font-medium">
                          TIRAR
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="p-5 border-t border-gray-800 flex gap-3">
              <button
                onClick={() => {
                  setIngredientModal(null);
                  setSelectedRemovals([]);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSandwich}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold transition-colors"
              >
                ✅ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce text-lg font-bold">
          {successMessage}
        </div>
      )}
    </div>
  );
}

/* ─── OrderCard component ─── */
function OrderCard({
  order,
  onStatusChange,
  timeSince,
}: {
  order: OrderData;
  onStatusChange: (id: number, status: string) => void;
  timeSince: (d: string) => string;
}) {
  const statusColors: Record<string, string> = {
    pronto: "bg-green-600",
    entregue: "bg-gray-600",
  };
  const statusBorders: Record<string, string> = {
    pronto: "border-green-500/50",
    entregue: "border-gray-600/50",
  };

  return (
    <div
      className={`bg-gray-900 rounded-xl border-2 ${
        statusBorders[order.status] ?? "border-gray-700"
      } overflow-hidden shadow-lg`}
    >
      <div
        className={`${
          statusColors[order.status] ?? "bg-gray-700"
        } px-4 py-3 flex justify-between items-center`}
      >
        <div>
          <span className="font-bold text-lg">Pedido #{order.id}</span>
          <span className="ml-2 text-white/80 text-sm">
            • {timeSince(order.createdAt)}
          </span>
        </div>
        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium uppercase">
          {order.status}
        </span>
      </div>
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-800/50">
        <p className="text-white font-medium">👤 {order.customerName}</p>
        <p className="text-gray-400 text-sm">📍 {order.customerNumber}</p>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-lg p-3">
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
                        ❌ SEM: {item.removedIngredients.join(", ")}
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
          <span className="text-gray-400 text-sm font-medium">Total:</span>
          <span className="text-orange-400 font-bold text-lg">
            R${order.total}
          </span>
        </div>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        {order.status === "pronto" && (
          <button
            onClick={() => onStatusChange(order.id, "entregue")}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2.5 rounded-lg font-bold transition-colors text-sm"
          >
            📦 Marcar Entregue
          </button>
        )}
        {order.status === "entregue" && (
          <span className="flex-1 text-center text-gray-500 py-2.5 text-sm">
            ✔️ Pedido finalizado
          </span>
        )}
      </div>
    </div>
  );
}
