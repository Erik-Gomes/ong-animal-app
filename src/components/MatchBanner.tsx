import { ClipboardList } from "lucide-react";

export function MatchBanner() {
  return (
    <div className="w-full h-1 bg-[var(--color-secondary)] rounded-[var(--radius-4xl)] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-[var(--color-secondary)]/10">
      
      {/* Área de Texto */}
      <div className="flex-1 text-center md:text-left">
        <p className="text-[var(--color-background)]/80 text-md md:text-lg">
          Ainda não encontrou seu <span className="text-[var(--color-primary)]">match</span>? Preencha o formulário de compatibilidade e veja quais animais combinam perfeitamente com o seu estilo de vida!
        </p>
      </div>

      {/* Botão de Ação */}
      <button className="group flex items-center gap-3 bg-[var(--color-background)] text-[var(--color-secondary)] px-8 py-4 rounded-full font-bold text-md hover:bg-[var(--color-primary)] hover:text-[var(--color-background)] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 whitespace-nowrap">
        <ClipboardList size={16} className="group-hover:scale-110 transition-transform" />
        Preencher Agora
      </button>

    </div>
  );
}