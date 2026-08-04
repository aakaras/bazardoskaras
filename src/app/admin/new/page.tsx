"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { createItem, uploadImage, CATEGORIES, ItemStatus } from "@/services/items";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Save, Send } from "lucide-react";
import Link from "next/link";

export default function NewItem() {
  const { user, loading } = useAuth(true);
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [status, setStatus] = useState<ItemStatus>("available");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 8) {
        alert("Você pode adicionar no máximo 8 fotos.");
        return;
      }
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitWithStatus = async (targetStatus: ItemStatus) => {
    if (files.length === 0) {
      alert("Adicione pelo menos 1 foto do item.");
      return;
    }
    
    setSubmitting(true);
    try {
      // 1. Upload images
      const uploadedUrls = await Promise.all(
        files.map(file => uploadImage(file))
      );

      // 2. Create item with selected status
      await createItem({
        title,
        description,
        price: parseFloat(price),
        category,
        images: uploadedUrls,
        status: targetStatus,
      });

      router.push("/admin");
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      alert("Ocorreu um erro ao salvar o item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitWithStatus(status);
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Novo Item</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Título do Item</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-br-green/50 focus:border-br-green"
                placeholder="Ex: Sofá Retrátil 3 Lugares"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-br-green/50 focus:border-br-green resize-none"
                placeholder="Descreva as condições do item, tempo de uso, medidas..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-br-green/50 focus:border-br-green"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-br-green/50 focus:border-br-green bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block text-sm font-semibold text-slate-800 mb-2">Visibilidade / Status de Publicação</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${status === 'available' ? 'bg-white border-br-green ring-2 ring-br-green/20' : 'bg-slate-100/60 border-slate-200'}`}>
                  <input
                    type="radio"
                    name="statusOption"
                    value="available"
                    checked={status === 'available'}
                    onChange={() => setStatus('available')}
                    className="mt-0.5 text-br-green focus:ring-br-green"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 text-sm block">Publicar Imediatamente</span>
                    <span className="text-xs text-slate-500 block">O item fica visível na vitrine pública do site.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${status === 'draft' ? 'bg-white border-purple-500 ring-2 ring-purple-500/20' : 'bg-slate-100/60 border-slate-200'}`}>
                  <input
                    type="radio"
                    name="statusOption"
                    value="draft"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="mt-0.5 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="font-semibold text-purple-900 text-sm block">Salvar como Rascunho</span>
                    <span className="text-xs text-purple-700/80 block">Guarda no admin para você publicar depois.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fotos (Até 8)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(file)} alt="Preview" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {files.length < 8 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-br-green hover:bg-green-50/50 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-br-green">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium">Adicionar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitWithStatus("draft")}
              className="flex items-center justify-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Salvar como Rascunho</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitWithStatus("available")}
              className="flex items-center justify-center gap-2 bg-br-green text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 text-sm shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Publicar Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
