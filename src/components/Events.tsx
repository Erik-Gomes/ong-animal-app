'use client';

import { createClient } from '@/utils/supabase/client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X, MapPin, Clock, CalendarX2 } from 'lucide-react';

const BASE_MONTHS = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
];

interface Evento {
  id: string;
  titulo: string;
  data_completa: string; 
  descricao?: string;
  horario?: string;
  local?: string;
}

export function Events() {
  const currentMonthIndex = new Date().getMonth();

  // Cria a lista rotacionada APENAS para o telemóvel (ex: SET, OUT, NOV... FEV, MAR)
  const displayMonthsMobile = useMemo(() => {
    return [
      ...BASE_MONTHS.slice(currentMonthIndex),
      ...BASE_MONTHS.slice(0, currentMonthIndex)
    ];
  }, [currentMonthIndex]);

  const [activeMonth, setActiveMonth] = useState(BASE_MONTHS[currentMonthIndex]);
  const [eventosDoBanco, setEventosDoBanco] = useState<Evento[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function carregarEventos() {
      const { data, error } = await supabase.from('eventos').select('*');

      if (error) {
        console.error('Erro ao buscar eventos:', error.message);
      } else if (data) {
        setEventosDoBanco(data);
      }
    }

    carregarEventos();
  }, [supabase]);

  const getMesNumero = (mesTexto: string) => {
    const index = BASE_MONTHS.indexOf(mesTexto); 
    const numero = index + 1; 
    return numero.toString().padStart(2, '0'); 
  };

  const mesAtivoNumero = getMesNumero(activeMonth); 

  const filteredEvents = eventosDoBanco.filter((event) => {
    if (!event.data_completa) return false;
    const pedacos = event.data_completa.split('-');
    const mesDoEvento = pedacos[1]; 
    return mesDoEvento === mesAtivoNumero; 
  });

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 200;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const formatarData = (dataStr: string) => {
    return dataStr.split('-').reverse().join('/');
  };

  return (
    <>
      <div className="w-full flex flex-col gap-6 my-8">
        
        {/* --- CABEÇALHO E MESES --- */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6 w-full">
          
          <div className="flex items-center gap-3 shrink-0">
            <Calendar className="text-(--color-primary)" size={28} />
            <h3 className="text-2xl font-bold text-(--color-secondary) whitespace-nowrap">
              Calendário de Eventos
            </h3>
          </div>

          {/* 1. VISÃO DESKTOP: Linha única, preenchendo o espaço vazio */}
          {/* Aparece apenas em telas médias e grandes (md:flex). Removemos o overflow-x e usamos flex-1 nos botões */}
          <div className="hidden md:flex flex-1 w-full">
            <div className="flex w-full gap-1 lg:gap-2 justify-end">
              {BASE_MONTHS.map((month) => (
                <button
                  key={month}
                  onClick={() => setActiveMonth(month)}
                  className={`flex-1 max-w-[80px] py-2 px-1 rounded-full text-xs lg:text-sm font-bold transition-all text-center flex items-center justify-center ${
                    activeMonth === month
                      ? 'bg-(--color-primary) text-white shadow-md'
                      : 'bg-white text-(--color-secondary) border border-(--color-secondary)/20 hover:border-(--color-primary)'
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>

          {/* 2. VISÃO MOBILE: Carrossel, ordem rotacionada (Começa no mês atual) */}
          {/* Aparece apenas em telas pequenas (md:hidden) */}
          <div className="flex md:hidden w-full overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex flex-nowrap gap-2 w-max">
              {displayMonthsMobile.map((month) => (
                <button
                  key={month}
                  onClick={() => setActiveMonth(month)}
                  className={`snap-center shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                    activeMonth === month
                      ? 'bg-(--color-primary) text-white shadow-md'
                      : 'bg-white text-(--color-secondary) border border-(--color-secondary)/20 hover:border-(--color-primary)'
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* --- LISTAGEM DE EVENTOS --- */}
        <div className="relative group flex items-center mt-2">
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 md:-left-12 z-10 p-2 text-(--color-secondary)/50 hover:text-(--color-primary) transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronLeft size={32} />
          </button>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-2 pr-8 [&::-webkit-scrollbar]:hidden w-full scroll-smooth min-h-[160px]"
          >
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const diaDisplay = event.data_completa.split('-')[2].substring(0, 2); 

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="snap-start shrink-0 w-40 md:w-48 bg-(--color-background) rounded-2xl p-5 shadow-sm shadow-(--color-secondary)/10 flex flex-col items-center justify-center text-center gap-1 border border-(--color-secondary)/5 hover:-translate-y-1 hover:shadow-md hover:border-(--color-primary)/30 transition-all cursor-pointer group/card"
                  >
                    <div className="text-3xl font-black text-(--color-primary) leading-none group-hover/card:scale-110 transition-transform">
                      {diaDisplay}
                    </div>
                    <div className="text-sm font-bold text-(--color-secondary) mb-1">
                      {activeMonth}
                    </div>
                    <div className="text-sm font-medium text-(--color-secondary) leading-tight">
                      {event.titulo}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full min-h-[160px] flex flex-col items-center justify-center text-(--color-secondary)/50">
                <CalendarX2 size={48} className="mb-4 opacity-20" strokeWidth={1.5} />
                <p className="font-medium text-center">Nenhum evento programado para {activeMonth}.</p>
              </div>
            )}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 md:-right-12 z-10 p-2 text-(--color-secondary)/50 hover:text-(--color-primary) transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      {/* --- MODAL DO EVENTO --- */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative flex flex-col gap-5 border border-(--color-secondary)/10 transform scale-100 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-2 text-(--color-secondary)/40 hover:text-(--color-primary) bg-(--color-secondary)/5 hover:bg-(--color-primary)/10 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col gap-1 pr-8">
              <h2 className="text-2xl font-black text-(--color-secondary) leading-tight">
                {selectedEvent.titulo}
              </h2>
            </div>

            <div className="flex flex-col gap-3 p-4 bg-(--color-secondary)/5 rounded-2xl">
              <div className="flex items-center gap-3 text-(--color-secondary)">
                <Calendar size={18} className="text-(--color-primary) shrink-0" />
                <span className="text-sm font-bold">{formatarData(selectedEvent.data_completa)}</span>
              </div>
              
              {selectedEvent.horario && (
                <div className="flex items-center gap-3 text-(--color-secondary)">
                  <Clock size={18} className="text-(--color-primary) shrink-0" />
                  <span className="text-sm font-medium">{selectedEvent.horario}</span>
                </div>
              )}

              {selectedEvent.local && (
                <div className="flex items-start gap-3 text-(--color-secondary)">
                  <MapPin size={18} className="text-(--color-primary) shrink-0 mt-0.5" />
                  <span className="text-sm font-medium leading-tight">{selectedEvent.local}</span>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-(--color-secondary)/50 uppercase tracking-wider mb-2">Detalhes</h4>
              {selectedEvent.descricao ? (
                <p className="text-sm text-(--color-secondary) leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.descricao}
                </p>
              ) : (
                <p className="text-sm text-(--color-secondary)/50 italic">
                  Nenhuma descrição adicional informada para este evento.
                </p>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}