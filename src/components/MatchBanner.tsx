"use client";

import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export function MatchBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function checkVisibility() {
      // 1. Verifica se tem alguém logado
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Se não estiver logado, não mostra o banner
        setIsVisible(false);
        setLoading(false);
        return;
      }

      // 2. Se estiver logado, procura se ele já respondeu o questionário
      const { data, error } = await supabase
        .from("respostas_questionario")
        .select("id") // Pede só o ID para ser mais rápido
        .eq("id_usuario", session.user.id)
        .single();

      if (data) {
        // Já tem respostas salvas -> Esconde o banner
        setIsVisible(false);
      } else {
        // Logado, mas sem respostas -> Mostra o banner!
        setIsVisible(true);
      }
      
      setLoading(false);
    }

    checkVisibility();
  }, []);

  // Se estiver carregando a verificação ou se a regra disse para esconder, não renderiza nada (null)
  if (loading || !isVisible) {
    return null;
  }

  return (
    
    <div className="w-full bg-[var(--color-secondary)] rounded-[var(--radius-4xl)] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-[var(--color-secondary)]/10">
      
      {/* Área de Texto */}
      <div className="flex-1 text-center md:text-left">
        <p className="text-[var(--color-background)]/80 text-md md:text-lg">
          Ainda não encontrou seu match! Preencha o formulário de compatibilidade e veja quais animais combinam perfeitamente com o seu estilo de vida!
        </p>
      </div>

      {/* Botão de Ação (Transformado em Link para ir direto pro questionário) */}
      <Link 
        href="/questionario" 
        className="group flex items-center gap-3 bg-[var(--color-background)] text-[var(--color-secondary)] px-8 py-4 rounded-full font-bold text-md hover:bg-[var(--color-primary)] hover:text-[var(--color-background)] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 whitespace-nowrap"
      >
        <ClipboardList size={16} className="group-hover:scale-110 transition-transform" />
        Preencher Agora
      </Link>

    </div>
  );
}