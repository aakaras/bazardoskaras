"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { createItem, uploadImage } from "@/services/items";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";

export default function NewItem() {
  const { user, loading } = useAuth(true);
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // 2. Create item
      await createItem({
        title,
        description,
        price: parseFloat(price),
        images: uploadedUrls,
        status: "available",
      });

      router.push("/admin");
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      alert("Ocorreu um erro ao salvar o item.");
    } finally {
      setSubmitting(false);
    }
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

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-br-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Salvando..." : "Salvar Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
