"use client";

import { useEffect, useState } from "react";
import { getPublicItems, Item } from "@/services/items";
import Link from "next/link";
import { ShareModal } from "@/components/ShareModal";
import { Tag } from "lucide-react";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await getPublicItems();
      setItems(data);
    } catch (error) {
      console.error("Error loading items", error);
    } finally {
      setLoading(false);
    }
  };

  // Regra: As categorias do filtro aparecem SOMENTE para itens que ainda NÃO foram vendidos ou rascunho
  const activeNonSoldItems = items.filter(item => item.status !== "sold" && item.status !== "draft");
  const availableCategories = Array.from(
    new Set(activeNonSoldItems.map(item => item.category).filter(Boolean))
  ) as string[];

  // Filtragem dos itens exibidos com base na categoria selecionada
  const filteredItems = selectedCategory === "all"
    ? items
    : items.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-br-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner de Boas-Vindas */}
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

      {/* Barra de Filtro de Categorias (Aparecem apenas categorias de itens não vendidos) */}
      {availableCategories.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Tag className="w-3.5 h-3.5" />
            <span>Filtrar por Categoria:</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Todos os Itens ({items.length})
            </button>
            {availableCategories.map((cat) => {
              const count = items.filter(item => item.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-br-green text-white shadow-sm font-semibold"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Itens */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500">Nenhum item encontrado para a categoria selecionada.</p>
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="mt-3 text-sm text-br-green font-medium hover:underline"
            >
              Ver todos os itens
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Link 
              href={`/item?id=${item.id}`} 
              key={item.id}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-br-green/30 transition-all overflow-hidden flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                {/* Botão de Compartilhar Item no Card */}
                <div className="absolute top-3 left-3 z-10">
                  <ShareModal 
                    variant="card-icon"
                    url={typeof window !== "undefined" ? `${window.location.origin}/item?id=${item.id}` : `https://bazardoskaras.web.app/item?id=${item.id}`}
                    title={`Confira: ${item.title} no Bazar da Mudança`}
                    text={`Olha esse item no Bazar da Mudança: *${item.title}* por R$ ${item.price.toFixed(2).replace('.', ',')}! Confira:`}
                  />
                </div>

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
                      Em negociação ({item.interestedCount && item.interestedCount > 0 ? item.interestedCount : 1})
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
                {item.category && (
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {item.category}
                  </span>
                )}
                <h3 className="font-semibold text-lg text-slate-800 line-clamp-1 mb-1">{item.title}</h3>
                <div className="mb-3">
                  {item.originalPrice && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400 line-through">
                        Novo: R$ {item.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}
                  <p className="text-br-green font-bold text-xl">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between">
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
