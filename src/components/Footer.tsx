export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-sm text-slate-500">
            Ajudando na nossa transição do Brasil 🇧🇷 para a Polônia 🇵🇱
          </p>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Nosso Bazar. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
