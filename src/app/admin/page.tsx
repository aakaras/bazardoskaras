"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { getItems, Item, updateItemStatus, deleteItem } from "@/services/items";
import { LogOut, Plus, Trash2, Edit } from "lucide-react";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, loading } = useAuth(true);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error("Error loading items", error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    router.push("/");
  };

  const handleDelete = async (id: string, images: string[]) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      await deleteItem(id, images);
      loadItems();
    }
  };

  const handleStatusChange = async (id: string, newStatus: Item["status"]) => {
    await updateItemStatus(id, newStatus);
    loadItems();
  };

  if (loading || loadingItems) {
    return <div className="text-center py-20">Carregando painel...</div>;
  }

  if (!user) return null; // Redirect handled by useAuth

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Painel de Controle</h1>
          <p className="text-sm text-slate-500">Gerencie seus itens e reservas.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/admin/new"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-br-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Novo Item
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Seus Itens</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Preço</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhum item cadastrado ainda.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {item.title}
                    </td>
                    <td className="px-6 py-4">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id!, e.target.value as Item["status"])}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border outline-none cursor-pointer
                          ${item.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' : 
                            item.status === 'negotiating' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                            'bg-slate-100 text-slate-700 border-slate-200'}`}
                      >
                        <option value="available">Disponível</option>
                        <option value="negotiating">Em negociação</option>
                        <option value="sold">Vendido</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => handleDelete(item.id!, item.images)}
                        className="text-red-500 hover:text-red-700 transition-colors inline-block"
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
