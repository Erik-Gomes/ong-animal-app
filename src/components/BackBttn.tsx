'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string; // Opcional: Se passar um link, ele usa o Link do Next.js
  label?: string; // Opcional: O texto do botão (padrão é "Voltar")
  className?: string; // Opcional: Para passar margens ou estilos extras se precisar
}

export default function BackButton({ href, label = '' }: BackButtonProps) {
  const router = useRouter();

  // Se você passou um "href", ele funciona como um Link de navegação direta
  if (href) {
    return (
      <Link
        href={href}
        className="absolute top-8 left-8 text-[#FFFCF9] bg-(--color-primary) p-1.5 rounded-full hover:bg-(--color-secondary) transition-all shadow-sm hover:shadow-md flex items-center justify-center transform hover:-translate-x-1"
        title="Voltar para o Início"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
      </Link>
    );
  }

  // Se não passou "href", ele funciona como o botão "Voltar" do navegador
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="absolute top-8 left-8 text-[#FFFCF9] bg-(--color-primary) p-1.5 rounded-full hover:bg-(--color-secondary) transition-all shadow-sm hover:shadow-md flex items-center justify-center transform hover:-translate-x-1"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
      {label}
    </button>
  );
}
