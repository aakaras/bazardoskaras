"use client";

import { useEffect, useState } from "react";
import { getItems, Item } from "@/services/items";
import Link from "next/link";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error("Error loading items", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-br-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 max-w-3xl mx-auto py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
          Bazar da Mudança
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          Nossa família — Alison, Jeize, Samuel e Daniel, junto dos nossos gatos Lupita e Gandalf — estamos nos mudando para a Polônia! ✈️ Nossa viagem está marcada para o dia <strong>24/09/2026</strong>.
          Por isso, estamos vendendo alguns de nossos itens com muito carinho.
        </p>
        
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm sm:text-base border border-amber-100 shadow-sm mt-6 text-left">
          <strong>Atenção:</strong> Nenhuma venda ou pagamento é realizado diretamente por este site. 
          Todas as negociações, formas de pagamento, e combinações sobre retirada ou entrega serão feitas exclusivamente pelo <strong>WhatsApp</strong>. 
          <span className="block mt-1 text-amber-700/80 italic">
            *Em caso de entrega, as despesas de envio ficarão por conta do comprador.
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500">Nenhum item disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link 
              href={`/item?id=${item.id}`} 
              key={item.id}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-br-green/30 transition-all overflow-hidden flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                {item.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={item.images[0]} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    Sem Imagem
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {item.status === 'negotiating' && (
                    <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      Em negociação
                    </span>
                  )}
                  {item.status === 'sold' && (
                    <span className="bg-pl-red text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      Vendido
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-lg text-slate-800 line-clamp-1 mb-1">{item.title}</h3>
                <p className="text-br-green font-bold text-xl mb-3">
                  R$ {item.price.toFixed(2).replace('.', ',')}
                </p>
                <div className="mt-auto">
                  <span className="text-sm text-slate-500 font-medium group-hover:text-br-green transition-colors">
                    Ver detalhes →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
