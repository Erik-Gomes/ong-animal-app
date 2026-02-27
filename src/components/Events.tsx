"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";


// O índice + 1 nos dá o número do mês (JAN = 0 + 1 = 1)
const allMonths = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", 
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];

interface Evento {
  id: string;
  titulo: string;
  data_completa: string; // Ex: "2026-02-28"
}

export function Events() {
  const [activeMonth, setActiveMonth] = useState("FEV");
  const [eventosDoBanco, setEventosDoBanco] = useState<Evento[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

    // 1. Busca os dados do Supabase
    useEffect(() => {
        async function carregarEventos() {
        const { data, error } = await supabase
            .from('eventos')
            .select('*');

        if (error) {
            console.error("Erro ao buscar eventos:", error.message);
        } else if (data) {
            setEventosDoBanco(data);
        }
        }

        carregarEventos();
    }, [supabase]);

    // 2. Lógica de Filtro e Conversão
    // Transforma "FEV" em "02", "MAR" em "03", etc.
    const getMesNumero = (mesTexto: string) => {
        const index = allMonths.indexOf(mesTexto); // FEV é index 1
        const numero = index + 1; // 1 + 1 = 2
        return numero.toString().padStart(2, '0'); // Garante que fique "02" e não "2"
    };

    const mesAtivoNumero = getMesNumero(activeMonth); // Se for "FEV", vira "02"

    // 3. Filtramos os eventos verificando se o "02" está dentro do "2026-02-28"
    const filteredEvents = eventosDoBanco.filter(event => {
        if (!event.data_completa) return false;
    
        // Divide "2026-02-28" em ["2026", "02", "28"]
        const pedacos = event.data_completa.split('-'); 
        const mesDoEvento = pedacos[1]; // Pega o "02"

        return mesDoEvento === mesAtivoNumero; // "02" === "02"? Se sim, mostra!
    });

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
            filteredEvents.map((event) => {
              // Extraímos o dia só na hora de desenhar na tela
              const diaDisplay = event.data_completa.split('-')[2].substring(0, 2); // substring garante que pega só "28" e ignora "28T00:00" se houver

              return (
                <div 
                  key={event.id}
                  className="snap-start shrink-0 w-40 md:w-48 bg-[var(--color-background)] rounded-2xl p-5 shadow-sm shadow-[var(--color-secondary)]/10 flex flex-col items-center justify-center text-center gap-1 border border-[var(--color-secondary)]/5 hover:-translate-y-1 hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all cursor-pointer group/card"
                >
                  <div className="text-3xl font-black text-[var(--color-primary)] leading-none group-hover/card:scale-110 transition-transform">
                    {diaDisplay}
                  </div>
                  <div className="text-sm font-bold text-[var(--color-secondary)] mb-1">
                    {activeMonth} {/* Usamos a própria variável do botão (ex: FEV) */}
                  </div>
                  <div className="text-sm font-medium text-[var(--color-secondary)] leading-tight">
                    {event.titulo}
                  </div>
                </div>
              );
            })
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