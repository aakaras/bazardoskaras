"use client";

import { useEffect, useState, Suspense } from "react";
import { getItem, Item, createReservation } from "@/services/items";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShareModal } from "@/components/ShareModal";

function ItemDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (id) {
      loadItem(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadItem = async (itemId: string) => {
    try {
      const data = await getItem(itemId);
      setItem(data);
    } catch (error) {
      console.error("Error loading item", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !id) return;

    setReserving(true);
    try {
      await createReservation({
        itemId: item.id || id,
        buyerName,
        buyerPhone
      });

      // Redirect to WhatsApp
      const adminPhone = "5541984542018"; 
      const message = `Olá! Meu nome é ${buyerName} e acabei de solicitar a reserva do item: *${item.title}* no valor de R$ ${item.price.toFixed(2).replace('.', ',')}. Meu WhatsApp é ${buyerPhone}.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, "_blank");
      
      setShowModal(false);
      loadItem(id); // Reload to show updated status
    } catch (error) {
      console.error("Error reserving", error);
      alert("Ocorreu um erro ao reservar.");
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-br-green"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Item não encontrado.</p>
        <Link href="/" className="text-br-green font-medium hover:underline">Voltar para o início</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Imagens */}
          <div className="p-4 sm:p-6 bg-slate-50 border-r border-slate-100 flex flex-col gap-4">
            <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
              {item.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={item.images[activeImage]} 
                  alt={item.title} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">Sem Imagem</div>
              )}
            </div>
            {item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {item.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-br-green' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div className="p-6 sm:p-8 flex flex-col">
            <div className="mb-4">
              {item.status === 'negotiating' && (
                <span className="inline-block bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  Em negociação
                </span>
              )}
              {item.status === 'sold' && (
                <span className="inline-block bg-pl-red text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  Vendido
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">{item.title}</h1>
              <p className="text-3xl font-bold text-br-green">
                R$ {item.price.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div className="prose prose-slate prose-sm sm:prose-base mb-8 flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Descrição</h3>
              <p className="whitespace-pre-wrap text-slate-600">{item.description}</p>
            </div>

            <div className="flex gap-3">
              {item.status === 'available' ? (
                <button 
                  onClick={() => setShowModal(true)}
                  className="flex-1 bg-slate-800 text-white py-3.5 rounded-xl font-medium hover:bg-slate-900 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Solicitar Reserva
                </button>
              ) : (
                <div className="flex-1 bg-slate-100 text-slate-500 py-3.5 rounded-xl font-medium text-center border border-slate-200">
                  Item indisponível no momento
                </div>
              )}

              <ShareModal 
                variant="icon" 
                title={`Confira: ${item.title} no Bazar da Mudança`}
                text={`Olha esse item no Bazar da Mudança: *${item.title}* por R$ ${item.price.toFixed(2).replace('.', ',')}! Confira:`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Reserva */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Reservar Item</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleReserve} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-6 text-sm text-slate-600">
                Ao solicitar a reserva, o item ficará com status de <strong>"Em negociação"</strong> e você será redirecionado para o WhatsApp para combinarmos os detalhes.
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Seu Nome</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-br-green/50 focus:border-br-green"
                  placeholder="Como gostaria de ser chamado?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Seu WhatsApp</label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-br-green/50 focus:border-br-green"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reserving}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {reserving ? "Processando..." : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      Continuar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ItemDetails() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-br-green"></div>
      </div>
    }>
      <ItemDetailsContent />
    </Suspense>
  );
}
