"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/useAuth";
import { getItem, updateItem, uploadImage, CATEGORIES, Item, ItemStatus } from "@/services/items";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";

function EditItemContent() {
  const { user, loading: authLoading } = useAuth(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loadingItem, setLoadingItem] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [status, setStatus] = useState<ItemStatus>("available");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Sale Details State
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [salePricePaid, setSalePricePaid] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("Retirada no local");
  const [agreedDate, setAgreedDate] = useState("");
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    if (id) {
      loadItemData(id);
    } else {
      setLoadingItem(false);
    }
  }, [id]);

  const loadItemData = async (itemId: string) => {
    try {
      const data = await getItem(itemId);
      if (data) {
        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price.toString());
        setOriginalPrice(data.originalPrice ? data.originalPrice.toString() : "");
        setCategory(data.category || CATEGORIES[0]);
        setStatus(data.status);
        setExistingImages(data.images || []);

        if (data.saleDetails) {
          setBuyerName(data.saleDetails.buyerName);
          setBuyerPhone(data.saleDetails.buyerPhone || "");
          setSalePricePaid(data.saleDetails.pricePaid.toString());
          setDeliveryMethod(data.saleDetails.deliveryMethod);
          setAgreedDate(data.saleDetails.agreedDate);
          setHasPaid(data.saleDetails.hasPaid || false);
        } else {
          setSalePricePaid(data.price.toString());
          setAgreedDate(new Date().toISOString().split('T')[0]);
          setHasPaid(false);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar item:", error);
    } finally {
      setLoadingItem(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (existingImages.length + newFiles.length + selectedFiles.length > 8) {
        alert("Você pode ter no máximo 8 fotos por item.");
        return;
      }
      setNewFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeExistingImage = (index: number) => {
    if (existingImages.length + newFiles.length <= 1) {
      alert("O item precisa ter pelo menos 1 foto.");
      return;
    }
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (existingImages.length + newFiles.length === 0) {
      alert("Adicione pelo menos 1 foto do item.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload new images if any
      const newlyUploadedUrls = await Promise.all(
        newFiles.map((file) => uploadImage(file))
      );

      const allImages = [...existingImages, ...newlyUploadedUrls];

      // 2. Update item
      const itemUpdate: any = {
        title,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        category,
        status,
        images: allImages,
      };

      if (status === "sold") {
        itemUpdate.saleDetails = {
          buyerName,
          buyerPhone,
          pricePaid: parseFloat(salePricePaid),
          deliveryMethod,
          agreedDate,
          hasPaid,
        };
      }

      await updateItem(id, itemUpdate);

      router.push("/admin");
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      alert("Ocorreu um erro ao atualizar o item.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingItem) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-br-green"></div>
      </div>
    );
  }

  if (!user) return null;

  if (!id) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">ID do item não especificado.</p>
        <Link href="/admin" className="text-br-green font-medium hover:underline">Voltar para o Painel</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Editar Item</h1>
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço de Venda (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-br-green/50 focus:border-br-green font-semibold text-br-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Original de Novo (R$) <span className="text-slate-400 font-normal text-xs">(Opcional)</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-br-green/50 focus:border-br-green"
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

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Status do Item</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ItemStatus)}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-br-green/50 focus:border-br-green bg-white font-medium"
              >
                <option value="draft">Rascunho (Não publicado)</option>
                <option value="available">Disponível (Publicado)</option>
                <option value="negotiating">Em negociação</option>
                <option value="sold">Vendido</option>
              </select>
            </div>

            {status === 'sold' && (
              <div className="sm:col-span-2 bg-emerald-50 border border-emerald-100 rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-emerald-800 border-b border-emerald-200/50 pb-2">Detalhes da Venda</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-1">Nome do Comprador</label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                      placeholder="Ex: João Silva"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-1">Telefone / WhatsApp <span className="font-normal text-xs">(Opcional)</span></label>
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-1">Valor Pago (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={salePricePaid}
                      onChange={(e) => setSalePricePaid(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-semibold text-emerald-700 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-1">Forma de Retirada/Entrega</label>
                    <input
                      type="text"
                      required
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-1">Data Combinada</label>
                    <input
                      type="date"
                      required
                      value={agreedDate}
                      onChange={(e) => setAgreedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-emerald-100/50 p-3 rounded-lg border border-emerald-200/50">
                      <input
                        type="checkbox"
                        checked={hasPaid}
                        onChange={(e) => setHasPaid(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-emerald-900">Pagamento já recebido</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fotos (Até 8)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Fotos Existentes */}
              {existingImages.map((imgUrl, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-lg bg-slate-100 border border-slate-200 overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt="Foto cadastrada" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    title="Remover foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-slate-900/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Salva
                  </span>
                </div>
              ))}

              {/* Novas Fotos a Fazer Upload */}
              {newFiles.map((file, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-lg bg-slate-100 border border-amber-300 overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(file)} alt="Preview nova foto" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeNewFile(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Nova
                  </span>
                </div>
              ))}
              
              {existingImages.length + newFiles.length < 8 && (
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

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-br-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditItemPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Carregando formulário...</div>}>
      <EditItemContent />
    </Suspense>
  );
}
