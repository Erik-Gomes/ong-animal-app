'use client';

import { useState } from 'react';
import { Heart, X, Info, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { calcularIdade } from '@/utils/utils';
import { Animal } from './AdoptionGridUI'; 

interface AdoptionSwipeProps {
  animais: Animal[];
}

// Função para traduzir o porte numérico que vem da tabela perfil_comportamental_pet
  const getPorteString = (animal: Animal) => {
    const perfilRaw = animal.perfil_comportamental_pet;
    // O Supabase pode retornar o join como array ou objeto único, garantimos que pegamos o objeto
    const perfil = Array.isArray(perfilRaw) ? perfilRaw[0] : perfilRaw;
    
    const valorPorte = perfil?.porte;

    switch (valorPorte) {
      case 1: return 'Pequeno';
      case 2: return 'Médio';
      case 3: return 'Grande';
      default: return 'Não informado';
    }
  };

export function AdoptionSwipe({ animais }: AdoptionSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // NOVO: Estado para controlar qual foto do animal está a ser exibida
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Estados do Swipe
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  // Estado do Modal de Informação (Apenas Mobile)
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleNext = () => {
    if (currentIndex < animais.length) {
      setCurrentIndex((prev) => prev + 1);
      setDragX(0);
      setCurrentPhotoIndex(0); // Zera a foto ao trocar de animal
    }
  };

  const handleMatch = (animal: Animal) => {
    console.log('Interesse registado no animal:', animal.nome);
    handleNext();
  };

  // --- LÓGICA DE ARRASTE E TOQUE (SWIPE & TAP) ---
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setStartX(e.clientX);
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diferenca = currentX - startX;
    setDragX(diferenca);
  };

  const onPointerUpOrLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const limiteAprovacao = 120;

    if (dragX > limiteAprovacao) {
      handleMatch(animais[currentIndex]);
    } else if (dragX < -limiteAprovacao) {
      handleNext();
    } else {
      // SE ARRASTOU MUITO POUCO (< 10px), CONSIDERAMOS UM "CLIQUE" (TAP)
      if (Math.abs(dragX) < 10) {
        const cardRect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - cardRect.left;
        const cardWidth = cardRect.width;
        const animalAtual = animais[currentIndex];
        
        if (animalAtual.fotos && animalAtual.fotos.length > 1) {
          if (clickX > cardWidth / 2) {
            // Clicou na metade DIREITA: avança foto
            if (currentPhotoIndex < animalAtual.fotos.length - 1) {
              setCurrentPhotoIndex(prev => prev + 1);
            }
          } else {
            // Clicou na metade ESQUERDA: volta foto
            if (currentPhotoIndex > 0) {
              setCurrentPhotoIndex(prev => prev - 1);
            }
          }
        }
      }
      setDragX(0); // Devolve o cartão ao centro
    }
  };

  if (!animais || animais.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-(--color-secondary)/50 text-center">
        <Heart size={48} className="mb-4 opacity-20" />
        <p className="font-medium">Nenhum animal encontrado no momento.</p>
      </div>
    );
  }

  if (currentIndex >= animais.length) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-(--color-secondary)/50 text-center animate-in fade-in zoom-in duration-500">
        <CheckCircle2 size={64} className="mb-4 text-(--color-primary)" />
        <h3 className="text-2xl font-black text-(--color-secondary) mb-2">Chegou ao fim!</h3>
        <p className="font-medium max-w-md">Você já visualizou todas as suas recomendações atuais. Volte mais tarde para conhecer novos animais.</p>
        <button 
          onClick={() => {
            setCurrentIndex(0);
            setDragX(0);
            setCurrentPhotoIndex(0);
          }}
          className="mt-8 px-8 py-3.5 bg-(--color-primary) text-white rounded-full font-bold hover:bg-(--color-primary)/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          Ver recomendações novamente
        </button>
      </div>
    );
  }

  const animal = animais[currentIndex];
  const likeOpacity = Math.min(Math.max(dragX / 100, 0), 1);
  const nopeOpacity = Math.min(Math.max(-dragX / 100, 0), 1);

  return (
    <>
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start justify-center px-4 md:px-0 my-8">
        
        {/* COLUNA ESQUERDA: Cartão */}
        <div className="w-full max-w-sm flex flex-col items-center relative shrink-0">
          
          <div 
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUpOrLeave}
            onPointerLeave={onPointerUpOrLeave}
            onPointerCancel={onPointerUpOrLeave}
            className="relative w-full h-[60vh] max-h-[550px] min-h-[400px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-(--color-secondary)/10 touch-pan-y cursor-grab active:cursor-grabbing z-20 select-none group"
            style={{
              transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            
            {/* INDICADOR DE FOTOS (Barrinhas estilo Instagram) */}
            {animal.fotos && animal.fotos.length > 1 && (
              <div className="absolute top-3 left-0 w-full px-3 flex gap-1 z-30 pointer-events-none">
                {animal.fotos.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      idx === currentPhotoIndex ? 'bg-white shadow-sm' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="absolute inset-0 bg-gray-200 pointer-events-none">
              {animal.fotos && animal.fotos.length > 0 ? (
                <img
                  src={animal.fotos[currentPhotoIndex]} // Puxa a foto do índice atual
                  alt={`${animal.nome} - Foto ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover pointer-events-none transition-opacity duration-300"
                  draggable="false"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                  Sem Foto
                </div>
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            <div className="absolute top-10 left-8 border-4 border-(--color-primary) text-(--color-primary) font-black text-4xl px-4 py-1 rounded-lg uppercase tracking-widest rotate-[-15deg] pointer-events-none" style={{ opacity: likeOpacity }}>Gostei</div>
            <div className="absolute top-10 right-8 border-4 border-red-500 text-red-500 font-black text-4xl px-4 py-1 rounded-lg uppercase tracking-widest rotate-[15deg] pointer-events-none" style={{ opacity: nopeOpacity }}>Passar</div>

            <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-2 z-10 text-white pointer-events-none">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black leading-tight drop-shadow-md">
                    {animal.nome}
                  </h2>
                  <p className="text-lg font-medium opacity-90 drop-shadow-sm flex items-center gap-2">
                    <span>{calcularIdade(animal.data_nascimento)}</span>
                    <span>•</span>
                    <span className="font-medium text-lg capitalize">{animal.castrado ? 'Castrado' : 'Não castrado'}</span>
                  </p>
                </div>
                
                <button 
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setShowInfoModal(true)}
                  className="md:hidden p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors pointer-events-auto shadow-sm"
                >
                  <Info size={24} className="text-white" />
                </button>
              </div>
            </div>

            {animal.fotos && animal.fotos.length > 1 && (
              <div className="absolute inset-y-0 left-0 w-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-start pl-2">
                <div className="bg-black/20 backdrop-blur-sm rounded-full p-1 text-white/70 hidden md:block">
                  <ChevronLeft size={24} />
                </div>
              </div>
            )}
            {animal.fotos && animal.fotos.length > 1 && (
              <div className="absolute inset-y-0 right-0 w-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-end pr-2">
                <div className="bg-black/20 backdrop-blur-sm rounded-full p-1 text-white/70 hidden md:block">
                  <ChevronRight size={24} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 z-10">
            <button onClick={() => { setDragX(-200); setTimeout(handleNext, 200); }} className="w-16 h-16 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md text-red-500 hover:bg-red-50 hover:scale-110 transition-all duration-200">
              <X size={32} strokeWidth={3} />
            </button>
            <button onClick={() => { setDragX(200); setTimeout(() => handleMatch(animal), 200); }} className="w-20 h-20 flex items-center justify-center bg-(--color-primary) rounded-full shadow-lg text-white hover:bg-(--color-primary)/90 hover:scale-110 transition-all duration-200">
              <Heart size={40} fill="currentColor" />
            </button>
          </div>
          
          <div className="mt-4 text-xs font-bold text-(--color-secondary)/40">
            {currentIndex + 1} de {animais.length}
          </div>
        </div>

        {/* COLUNA DIREITA: Detalhes do Animal (Desktop) */}
        <div className="hidden md:flex flex-col w-full bg-white rounded-3xl p-8 shadow-xl border border-(--color-secondary)/10 min-h-[550px]">
          
          <div className="flex justify-between items-start border-b border-(--color-secondary)/10 pb-6 mb-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-4xl font-black text-(--color-secondary)">
                {animal.nome}
              </h2>
            </div>
            
            {animal.matchScore !== undefined && (
              <div className="bg-(--color-primary)/10 px-4 py-2 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-(--color-primary) uppercase tracking-wider mb-0.5">Match</span>
                <span className="text-2xl font-black text-(--color-primary) leading-none">{animal.matchScore}%</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 flex-1">
            <div>
              <h4 className="text-sm font-bold text-(--color-secondary)/50 uppercase tracking-wider mb-3">A história de {animal.nome}</h4>
              <p className="text-(--color-secondary) leading-relaxed">
                Com base no seu questionário de compatibilidade comportamental, o nosso algoritmo identificou uma forte ligação entre o seu estilo de vida e o perfil do(a) {animal.nome}. Ele(a) aguarda ansiosamente por um lar seguro e amoroso.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto">
              <div className="bg-(--color-secondary)/5 p-4 rounded-2xl flex flex-col">
                <span className="text-xs font-bold text-(--color-secondary)/50 uppercase mb-1">Idade</span>
                <span className="font-black text-(--color-secondary) text-lg">{calcularIdade(animal.data_nascimento)}</span>
              </div>
              <div className="bg-(--color-secondary)/5 p-4 rounded-2xl flex flex-col">
                <span className="text-xs font-bold text-(--color-secondary)/50 uppercase mb-1">Gênero</span>
                <span className="font-black text-(--color-secondary) text-lg capitalize">{animal.genero}</span>
              </div>
              <div className="bg-(--color-secondary)/5 p-4 rounded-2xl flex flex-col">
                <span className="text-xs font-bold text-(--color-secondary)/50 uppercase mb-1">Porte</span>
                <span className="font-black text-(--color-secondary) text-lg capitalize">{getPorteString(animal)}</span>
              </div>
              <div className="bg-(--color-secondary)/5 p-4 rounded-2xl flex flex-col">
                <span className="text-xs font-bold text-(--color-secondary)/50 uppercase mb-1">Castrado(a)</span>
                <span className="font-black text-(--color-secondary) text-lg">{animal.castrado ? 'Sim' : 'Não'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- MODAL DE DETALHES (Mobile) --- */}
      {showInfoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:p-4 md:hidden"
          onClick={() => setShowInfoModal(false)}
        >
          <div 
            className="bg-white rounded-t-3xl p-8 w-full shadow-2xl relative flex flex-col gap-6 animate-in slide-in-from-bottom-10 duration-300 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowInfoModal(false)}
              className="absolute top-6 right-6 p-2 text-(--color-secondary)/40 hover:text-(--color-primary) bg-(--color-secondary)/5 hover:bg-(--color-primary)/10 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col gap-1 pr-10 border-b border-(--color-secondary)/10 pb-4">
              <h2 className="text-3xl font-black text-(--color-secondary)">
                {animal.nome}
              </h2>
              {animal.matchScore !== undefined && (
                <span className="text-sm font-bold text-(--color-primary) uppercase tracking-wider">
                  {animal.matchScore}% de Compatibilidade
                </span>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-(--color-secondary)/50 uppercase tracking-wider">A história de {animal.nome}</h4>
              <p className="text-(--color-secondary) leading-relaxed">
                Com base no seu questionário de compatibilidade comportamental, o algoritmo identificou uma forte ligação entre o vosso estilo de vida.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-(--color-secondary)/5 p-3 rounded-xl flex flex-col">
                  <span className="text-xs font-bold text-(--color-secondary)/50 uppercase mb-1">Porte</span>
                  <span className="font-bold text-(--color-secondary) text-lg capitalize">{getPorteString(animal)}</span>
                </div>
                <div className="bg-(--color-secondary)/5 p-3 rounded-xl flex flex-col">
                  <span className="text-xs font-bold text-(--color-secondary)/50 uppercase mb-1">Gênero</span>
                  <span className="font-bold text-(--color-secondary) text-lg capitalize">{animal.genero}</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}