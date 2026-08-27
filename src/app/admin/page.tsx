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
  active: boolean;
  sortOrder: number;
}

const CATEGORIES = [
  "Hambúrguers",
  "Porções",
  "Adicionais",
  "Chopes",
  "Shots",
  "Drinks",
  "Sem Álcool",
  "Caipirinhas",
  "Red Bull Combos",
];

export default function AdminPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // New product form
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newIngredients, setNewIngredients] = useState("");
  const [newDuploPrice, setNewDuploPrice] = useState("");
  const [newIsSandwich, setNewIsSandwich] = useState(false);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editIngredients, setEditIngredients] = useState("");
  const [editDuploPrice, setEditDuploPrice] = useState("");
  const [editIsSandwich, setEditIsSandwich] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products/all");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleAddProduct = async () => {
    if (!newName.trim() || !newPrice.trim()) {
      alert("Preencha pelo menos nome e preço!");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          price: parseInt(newPrice),
          category: newCategory,
          ingredients: newIngredients
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          duploPrice: newDuploPrice ? parseInt(newDuploPrice) : null,
          isSandwich: newIsSandwich,
          sortOrder: 99,
        }),
      });
      if (!res.ok) throw new Error("Erro");
      setShowAddModal(false);
      setNewName("");
      setNewPrice("");
      setNewIngredients("");
      setNewDuploPrice("");
      setNewIsSandwich(false);
      fetchProducts();
      showSuccess("✅ Produto adicionado com sucesso!");
    } catch {
      alert("Erro ao adicionar produto");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (product: ProductData) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditCategory(product.category);
    setEditIngredients(
      product.ingredients ? product.ingredients.join(", ") : ""
    );
    setEditDuploPrice(
      product.duploPrice ? product.duploPrice.toString() : ""
    );
    setEditIsSandwich(product.isSandwich);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct || !editName.trim() || !editPrice.trim()) {
      alert("Preencha pelo menos nome e preço!");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          price: parseInt(editPrice),
          category: editCategory,
          ingredients: editIngredients
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          duploPrice: editDuploPrice ? parseInt(editDuploPrice) : null,
          isSandwich: editIsSandwich,
        }),
      });
      if (!res.ok) throw new Error("Erro");
      setEditingProduct(null);
      fetchProducts();
      showSuccess("✅ Produto atualizado com sucesso!");
    } catch {
      alert("Erro ao atualizar produto");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (product: ProductData) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      fetchProducts();
      showSuccess(
        product.active
          ? `⛔ "${product.name}" desativado`
          : `✅ "${product.name}" ativado`
      );
    } catch {
      alert("Erro ao atualizar produto");
    }
  };

  const deleteProduct = async (product: ProductData) => {
    if (!confirm(`Tem certeza que deseja EXCLUIR "${product.name}"?`)) return;
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      fetchProducts();
      showSuccess(`🗑️ "${product.name}" excluído`);
    } catch {
      alert("Erro ao excluir produto");
    }
  };

  const filteredProducts =
    filterCategory === "all"
      ? products
      : products.filter((p) => p.category === filterCategory);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 to-pink-700 px-4 py-3 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚙️</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Administração
              </h1>
              <p className="text-purple-200 text-sm">
                Juke Bar - Gerenciar Cardápio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              📋 Balcão
            </a>
            <a
              href="/cozinha"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              🍳 Cozinha
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Top Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
          <div className="flex gap-2 overflow-x-auto flex-wrap">
            <button
              onClick={() => setFilterCategory("all")}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterCategory === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Todos
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterCategory === cat
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm whitespace-nowrap"
          >
            ➕ Novo Produto
          </button>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-4">⏳</div>
            <p>Carregando produtos...</p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-gray-400">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 font-medium">
                      Categoria
                    </th>
                    <th className="text-right px-4 py-3 font-medium">Preço</th>
                    <th className="text-right px-4 py-3 font-medium">Duplo</th>
                    <th className="text-center px-4 py-3 font-medium">
                      Sanduíche
                    </th>
                    <th className="text-center px-4 py-3 font-medium">
                      Status
                    </th>
                    <th className="text-center px-4 py-3 font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-800/50 transition-colors ${
                        !product.active ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">
                            {product.name}
                          </p>
                          {product.ingredients &&
                            product.ingredients.length > 0 && (
                              <p className="text-gray-500 text-xs mt-0.5 max-w-xs truncate">
                                {product.ingredients.join(", ")}
                              </p>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {product.category}
                      </td>
                      <td className="px-4 py-3 text-right text-orange-400 font-bold">
                        R${product.price}
                      </td>
                      <td className="px-4 py-3 text-right text-purple-400">
                        {product.duploPrice ? `R$${product.duploPrice}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {product.isSandwich ? (
                          <span className="text-green-400">🍔 Sim</span>
                        ) : (
                          <span className="text-gray-600">Não</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleActive(product)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            product.active
                              ? "bg-green-600/20 text-green-400 hover:bg-green-600/40"
                              : "bg-red-600/20 text-red-400 hover:bg-red-600/40"
                          }`}
                        >
                          {product.active ? "Ativo" : "Inativo"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => openEdit(product)}
                            className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => deleteProduct(product)}
                            className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Nenhum produto encontrado
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">
                ➕ Novo Produto
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome do produto..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="25"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">
                    Preço Duplo (R$)
                  </label>
                  <input
                    type="number"
                    value={newDuploPrice}
                    onChange={(e) => setNewDuploPrice(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Categoria *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Ingredientes (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={newIngredients}
                  onChange={(e) => setNewIngredients(e.target.value)}
                  placeholder="Pão, Queijo, Tomate..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsSandwich}
                  onChange={(e) => setNewIsSandwich(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-white">
                  É sanduíche (permite retirar ingredientes)
                </span>
              </label>
            </div>
            <div className="p-5 border-t border-gray-800 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProduct}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white py-3 rounded-xl font-bold transition-colors"
              >
                {saving ? "Salvando..." : "💾 Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">
                ✏️ Editar Produto
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">
                    Preço Duplo (R$)
                  </label>
                  <input
                    type="number"
                    value={editDuploPrice}
                    onChange={(e) => setEditDuploPrice(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Categoria *
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Ingredientes (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={editIngredients}
                  onChange={(e) => setEditIngredients(e.target.value)}
                  placeholder="Pão, Queijo, Tomate..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsSandwich}
                  onChange={(e) => setEditIsSandwich(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-white">
                  É sanduíche (permite retirar ingredientes)
                </span>
              </label>
            </div>
            <div className="p-5 border-t border-gray-800 flex gap-3">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white py-3 rounded-xl font-bold transition-colors"
              >
                {saving ? "Salvando..." : "💾 Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 text-base font-bold">
          {successMsg}
        </div>
      )}
    </div>
  );
}
