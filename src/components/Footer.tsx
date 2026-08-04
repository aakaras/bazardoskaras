export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <p className="text-sm text-slate-600 font-medium">
            Muito obrigado por ajudar em nossa transição do Brasil 🇧🇷 para a Polônia 🇵🇱
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span>Desenvolvido por <strong>Alison Karas</strong></span>
            <span className="text-slate-300">•</span>
            <a
              href="https://www.linkedin.com/in/alisonkaras/?locale=en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-1.3.7-1.95 1.76-1.95 1.15 0 1.5.85 1.5 2v4.88h2.78M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>LinkedIn</span>
            </a>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Nosso Bazar. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
