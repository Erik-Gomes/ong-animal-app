'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

export function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção...',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Fecha o menu se o usuário clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Encontra qual é a opção selecionada no momento para mostrar no botão
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="flex flex-col gap-1 relative w-full" ref={selectRef}>
      {/* Label Opcional */}
      {label && (
        <label className="text-sm font-bold text-(--color-secondary) ml-1">
          {label}
        </label>
      )}

      {/* Botão Principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left bg-white w-full focus:outline-none ${
          isOpen
            ? 'border-(--color-primary) ring-1 ring-(--color-primary) text-(--color-secondary)'
            : 'border-(--color-secondary)/20 text-(--color-secondary) hover:border-(--color-secondary)/40'
        }`}
      >
        <span
          className={`truncate ${!selectedOption ? 'text-(--color-secondary)/50 font-normal' : 'font-medium'}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-(--color-secondary)/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Lista Suspensa (Dropdown) */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-(--color-secondary)/10 rounded-xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 transition-colors text-sm ${
                  value === option.value
                    ? 'bg-(--color-primary)/10 text-(--color-primary) font-bold border-l-4 border-(--color-primary)'
                    : 'text-(--color-secondary) font-medium hover:bg-(--color-secondary)/5 border-l-4 border-transparent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
