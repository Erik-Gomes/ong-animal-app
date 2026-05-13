'use client';

// 1. Criamos uma Interface para as propriedades (Props).
// Isso deixa o código mais limpo do que tipar direto nos parênteses.
interface SelectorBarProps {
  value: number;
  setter: (v: number) => void;
  labels: string[]; // Idealmente, um array com exatamente 3 posições
}

// 2. Usamos export function (padrão mais comum em componentes React modernos)
export function SelectorBar({ value, setter, labels }: SelectorBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between w-full gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setter(num)}
            className={`flex-1 py-2 rounded-xl font-black text-md transition-all ${
              value === num
                ? 'bg-(--color-primary) text-white shadow-md scale-105'
                : 'bg-(--color-secondary)/5 text-(--color-secondary)/50 hover:bg-(--color-secondary)/10'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Container das labels */}
      <div className="flex justify-between text-xs font-bold text-(--color-secondary)/50 px-1">
        <span className="w-1/3 text-left">{labels[0]}</span>
        <span className="w-1/3 text-center">{labels[1]}</span>
        <span className="w-1/3 text-right">{labels[2]}</span>
      </div>
    </div>
  );
}
