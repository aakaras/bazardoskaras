"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { getItems, deleteItem, updateItemStatus, Item } from "@/services/items";
import { auth, isConfigured } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Plus, Trash2, Edit, LogOut, ShoppingBag, DollarSign, Clock, CheckCircle2, FileText } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading } = useAuth(true);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getItems();
        setItems(data);
      } catch (error) {
        console.error("Erro ao carregar itens:", error);
      } finally {
        setLoadingItems(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user]);

  const handleDelete = async (id: string, images: string[]) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      try {
        await deleteItem(id, images);
        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Erro ao excluir item:", error);
        alert("Ocorreu um erro ao excluir o item.");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: Item["status"]) => {
    try {
      await updateItemStatus(id, newStatus);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Ocorreu um erro ao atualizar o status.");
    }
  };

  const handleLogout = async () => {
    try {
      if (isConfigured) {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Cálculo das Métricas
  const totalCount = items.length;
  const totalValue = items.reduce((acc, item) => acc + item.price, 0);

  const draftItems = items.filter(item => item.status === "draft");
  const draftValue = draftItems.reduce((acc, item) => acc + item.price, 0);

  const availableItems = items.filter(item => item.status === "available");
  const availableValue = availableItems.reduce((acc, item) => acc + item.price, 0);

  const negotiatingItems = items.filter(item => item.status === "negotiating");
  const negotiatingValue = negotiatingItems.reduce((acc, item) => acc + item.price, 0);

  const soldItems = items.filter(item => item.status === "sold");
  const soldValue = soldItems.reduce((acc, item) => acc + item.price, 0);

  if (loading || loadingItems) {
    return <div className="text-center py-20">Carregando painel...</div>;
  }

  if (!user) return null; // Redirect handled by useAuth

  return (
    <div className="space-y-6">
      {/* Header do Painel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Painel de Controle</h1>
          <p className="text-sm text-slate-500">Gerencie seus itens, edite preços, crie rascunhos e acompanhe o balanço.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/admin/new"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-br-green text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Item
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Grid de Métricas TOTAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Geral */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Anunciado</p>
            <p className="text-xl font-bold text-slate-800">R$ {totalValue.toFixed(2).replace('.', ',')}</p>
            <p className="text-xs text-slate-500 font-medium">{totalCount} {totalCount === 1 ? 'item' : 'itens'}</p>
          </div>
        </div>

        {/* Rascunhos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Rascunhos</p>
            <p className="text-xl font-bold text-purple-900">R$ {draftValue.toFixed(2).replace('.', ',')}</p>
            <p className="text-xs text-purple-600 font-medium">{draftItems.length} {draftItems.length === 1 ? 'rascunho' : 'rascunhos'}</p>
          </div>
        </div>

        {/* Disponíveis */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disponíveis</p>
            <p className="text-xl font-bold text-emerald-600">R$ {availableValue.toFixed(2).replace('.', ',')}</p>
            <p className="text-xs text-slate-500 font-medium">{availableItems.length} {availableItems.length === 1 ? 'item' : 'itens'}</p>
          </div>
        </div>

        {/* Em Negociação */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Em Negociação</p>
            <p className="text-xl font-bold text-amber-600">R$ {negotiatingValue.toFixed(2).replace('.', ',')}</p>
            <p className="text-xs text-slate-500 font-medium">{negotiatingItems.length} {negotiatingItems.length === 1 ? 'item' : 'itens'}</p>
          </div>
        </div>

        {/* Vendidos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Vendido</p>
            <p className="text-xl font-bold text-rose-600">R$ {soldValue.toFixed(2).replace('.', ',')}</p>
            <p className="text-xs text-slate-500 font-medium">{soldItems.length} {soldItems.length === 1 ? 'item' : 'itens'}</p>
          </div>
        </div>
      </div>

      {/* Tabela de Itens */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Seus Itens Cadastrados</h2>
          <span className="text-xs text-slate-400 font-medium">{items.length} cadastrados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Preço</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum item cadastrado ainda.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=200"}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                      />
                      <span className="line-clamp-1">{item.title}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md">
                        {item.category || "Sem Categoria"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id!, e.target.value as Item["status"])}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border outline-none cursor-pointer
                          ${item.status === 'draft' ? 'bg-purple-50 text-purple-700 border-purple-200 font-semibold' :
                            item.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' : 
                            item.status === 'negotiating' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                            'bg-slate-100 text-slate-700 border-slate-200'}`}
                      >
                        <option value="draft">Rascunho</option>
                        <option value="available">Disponível</option>
                        <option value="negotiating">Em negociação</option>
                        <option value="sold">Vendido</option>
                      </select>
                      {item.interestedCount && item.interestedCount > 0 ? (
                        <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold block mt-1.5 w-fit">
                          {item.interestedCount} {item.interestedCount === 1 ? 'interessado' : 'interessados'}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/edit?id=${item.id}`}
                        className="p-1.5 text-slate-600 hover:text-br-green hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(item.id!, item.images)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
