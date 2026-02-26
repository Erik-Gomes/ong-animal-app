"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Importamos a nossa conexão com o banco!

const allMonths = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", 
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];

// Definimos o formato do nosso Evento baseado no banco de dados
interface Evento {
  id: string;
  titulo: string;
  dia: string;
  mes: string;
}

export function Events() {
  const [activeMonth, setActiveMonth] = useState("MAR"); // Mudei o padrão para MAR para vermos o teste
  const [eventosDoBanco, setEventosDoBanco] = useState<Evento[]>([]); // Estado que vai guardar os dados reais
  const carouselRef = useRef<HTMLDivElement>(null);

  // O useEffect roda uma vez assim que o componente aparece na tela
  useEffect(() => {
    async function carregarEventos() {
      // Pedimos para o Supabase: "Traga todos (*) os eventos e ordene pela data_completa"
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_completa', { ascending: true });

      if (error) {
        console.error("Erro ao buscar eventos:", error);
      } else if (data) {
        console.log("EVENTOS CHEGANDO DO SUPABASE:", data);
        setEventosDoBanco(data); // Salvamos os dados reais no estado do React
      }
    }

    carregarEventos();
  }, []);

  // Agora filtramos os eventos que vieram do banco, não mais os de mentirinha
  const filteredEvents = eventosDoBanco.filter(event => event.mes === activeMonth);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 200;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <h3 className="text-2xl font-bold text-[var(--color-secondary)] flex items-center gap-2 shrink-0">
          <Calendar size={28} className="text-[var(--color-primary)]" />
          Calendário de Eventos
        </h3>
        
        <div className="flex gap-2 overflow-x-auto py-2 pl-1 pr-6 xl:pr-0 [&::-webkit-scrollbar]:hidden snap-x min-w-0">
          {allMonths.map((month) => (
            <button
              key={month}
              onClick={() => setActiveMonth(month)}
              className={`snap-start shrink-0 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeMonth === month
                  ? "bg-[var(--color-primary)] text-[var(--color-background)] shadow-md transform scale-105"
                  : "bg-[var(--color-background)] text-[var(--color-secondary)] border border-[var(--color-secondary)]/10 hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)]"
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group flex items-center">
        <button 
          onClick={() => scroll("left")}
          className="absolute -left-4 md:-left-12 z-10 p-2 text-[var(--color-secondary)]/50 hover:text-[var(--color-primary)] transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
        >
          <ChevronLeft size={32} />
        </button>

        <div 
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-2 pr-8 [&::-webkit-scrollbar]:hidden w-full scroll-smooth min-h-[160px]"
        >
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div 
                key={event.id}
                className="snap-start shrink-0 w-40 md:w-48 bg-[var(--color-background)] rounded-2xl p-5 shadow-sm shadow-[var(--color-secondary)]/10 flex flex-col items-center justify-center text-center gap-1 border border-[var(--color-secondary)]/5 hover:-translate-y-1 hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all cursor-pointer group/card"
              >
                <div className="text-3xl font-black text-[var(--color-primary)] leading-none group-hover/card:scale-110 transition-transform">
                  {event.dia}
                </div>
                <div className="text-sm font-bold text-[var(--color-secondary)] mb-1">
                  {event.mes}
                </div>
                <div className="text-sm font-medium text-[var(--color-secondary)] leading-tight">
                  {event.titulo}
                </div>
              </div>
            ))
          ) : (
            <div className="w-full flex flex-col items-center justify-center text-[var(--color-secondary)]/50 py-8">
              <Calendar size={48} className="mb-2 opacity-20" />
              <p>Nenhum evento programado para {activeMonth}.</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => scroll("right")}
          className="absolute -right-4 md:-right-12 z-10 p-2 text-[var(--color-secondary)]/50 hover:text-[var(--color-primary)] transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
}