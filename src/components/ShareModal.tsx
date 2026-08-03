"use client";

import { useState } from "react";
import { Share2, Copy, Check, X, Share } from "lucide-react";

interface ShareModalProps {
  title?: string;
  text?: string;
  url?: string;
  buttonText?: string;
  variant?: "primary" | "outline" | "icon" | "header";
  className?: string;
}

export function ShareModal({
  title = "Bazar da Mudança - Brasil para Polônia 🇵🇱🇧🇷",
  text = "Nossa família está vendendo itens com muito carinho antes da nossa viagem para a Polônia! Confira o nosso bazar:",
  url,
  buttonText = "Compartilhar",
  variant = "primary",
  className = "",
}: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "https://bazardoskaras.web.app";
  };

  const shareUrl = getShareUrl();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showToast("Não foi possível copiar o link.");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const canNativeShare = () => {
    return typeof navigator !== "undefined" && typeof (navigator as unknown as { share?: Function }).share === "function";
  };

  const handleNativeShare = async () => {
    if (canNativeShare()) {
      try {
        await navigator.share({
          title,
          text: `${text}\n`,
          url: shareUrl,
        });
        setIsOpen(false);
        return true;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Erro ao compartilhar nativamente:", err);
        }
      }
    }
    return false;
  };

  const handleOpenModal = async () => {
    // Tenta usar Web Share API em mobile primeiro se disponível
    if (typeof window !== "undefined" && window.innerWidth < 640 && canNativeShare()) {
      const shared = await handleNativeShare();
      if (shared) return;
    }
    setIsOpen(true);
  };

  const whatsappMessage = encodeURIComponent(`${text}\n${shareUrl}`);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const handleInstagramShare = async () => {
    await handleCopyLink();
    showToast("Link copiado! Abra o Instagram e cole nos seus Stories ou Direct 📸");
  };

  return (
    <>
      {/* Botão de Disparo */}
      {variant === "header" ? (
        <button
          onClick={handleOpenModal}
          className={`flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 border border-slate-200/60 ${className}`}
          title="Compartilhar site"
        >
          <Share2 className="w-4 h-4 text-br-green" />
          <span>{buttonText}</span>
        </button>
      ) : variant === "icon" ? (
        <button
          onClick={handleOpenModal}
          className={`p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all ${className}`}
          title="Compartilhar"
        >
          <Share2 className="w-5 h-5 text-slate-700" />
        </button>
      ) : variant === "outline" ? (
        <button
          onClick={handleOpenModal}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-all shadow-sm ${className}`}
        >
          <Share2 className="w-4 h-4 text-br-green" />
          <span>{buttonText}</span>
        </button>
      ) : (
        <button
          onClick={handleOpenModal}
          className={`flex items-center justify-center gap-2 px-5 py-3 bg-br-green text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-sm active:scale-[0.98] ${className}`}
        >
          <Share2 className="w-5 h-5" />
          <span>{buttonText}</span>
        </button>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2 border border-slate-800">
          <Check className="w-4 h-4 text-green-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal de Compartilhamento */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            {/* Header do Modal */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-br-green/10 text-br-green rounded-xl">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Compartilhar</h3>
                  <p className="text-xs text-slate-500">Ajude a divulgar nosso bazar!</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-5">
              {/* Opções de Redes Sociais */}
              <div className="grid grid-cols-3 gap-3">
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all border border-emerald-100 group"
                >
                  <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold">WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all border border-blue-100 group"
                >
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold">Facebook</span>
                </a>

                {/* Instagram */}
                <button
                  onClick={handleInstagramShare}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 transition-all border border-pink-100 group"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold">Instagram</span>
                </button>
              </div>

              {/* Botão de Compartilhamento Nativo se Suportado */}
              {canNativeShare() && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-2xl transition-colors text-sm"
                >
                  <Share className="w-4 h-4" />
                  <span>Mais opções do celular</span>
                </button>
              )}

              {/* Copiar Link Direto */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Link Direto
                </label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="bg-transparent text-xs text-slate-600 flex-1 px-2 focus:outline-none select-all truncate font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-slate-800 text-white hover:bg-slate-900"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
