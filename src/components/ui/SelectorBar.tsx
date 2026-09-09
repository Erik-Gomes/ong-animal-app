'use client';

interface SelectorBarProps {
  value: number;
  setter: (v: number) => void;
  labels: string[]; // Um array com exatamente 3 posições
}

export function SelectorBar({ value, setter, labels }: SelectorBarProps) {
  return (
    // Removido o max-w-md. Agora ele acompanha a largura do formulário graciosamente
    <div className="flex w-full gap-4 sm:gap-6">
      {[1, 2, 3].map((num, index) => (
        // Cada opção agora é um bloquinho isolado (botão + texto)
        <div key={num} className="flex flex-col flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => setter(num)}
            className={`w-full py-3 rounded-xl font-black text-lg transition-all ${
              value === num
                ? 'bg-(--color-primary) text-white shadow-md scale-105'
                : 'bg-(--color-secondary)/5 text-(--color-secondary)/50 hover:bg-(--color-secondary)/10'
            }`}
          >
            {num}
          </button>
          
          {/* O texto agora é garantido de ficar exatamente no centro do botão */}
          <span className="text-xs sm:text-sm font-bold text-(--color-secondary)/50 text-center leading-tight">
            {labels[index]}
          </span>
        </div>
      ))}
    </div>
  );
}