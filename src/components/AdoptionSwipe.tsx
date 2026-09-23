'use client';

import { useState } from 'react';
import { Heart, X, Info, CheckCircle2 } from 'lucide-react';
import { calcularIdade } from '@/utils/utils';
import { Animal } from './AdoptionGridUI';

interface AdoptionSwipeProps {
  animais: Animal[];
}

export function AdoptionSwipe({ animais }: AdoptionSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Estados de controlo do Swipe
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleNext = () => {
    if (currentIndex < animais.length) {
      setCurrentIndex((prev) => prev + 1);
      setDragX(0); // Repõe a posição no centro para o próximo cartão
    }
  };

  const handleMatch = (animal: Animal) => {
    console.log('Interesse registado no animal:', animal.nome);
    handleNext();
  };

  // --- LÓGICA DE ARRASTE (SWIPE) ---
  const onPointerDown = (e: React.PointerEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diferenca = currentX - startX;
    setDragX(diferenca);
  };

  const onPointerUpOrLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const limiteAprovacao = 120; // Pixels necessários para validar a ação

    if (dragX > limiteAprovacao) {
      // Arrastou para a DIREITA (Match)
      handleMatch(animais[currentIndex]);
    } else if (dragX < -limiteAprovacao) {
      // Arrastou para a ESQUERDA (Passar)
      handleNext();
    } else {
      // Não arrastou o suficiente, o cartão volta ao centro
      setDragX(0);
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
      <div className="w-full flex flex-col items-center justify-center py-20 text-(--color-secondary)/50 text-center">
        <CheckCircle2 size={48} className="mb-4 text-(--color-primary)" />
        <h3 className="text-xl font-bold text-(--color-secondary) mb-2">Chegou ao fim!</h3>
        <p className="font-medium">Já visualizou todos os seus matches atuais.</p>
        <button 
          onClick={() => {
            setCurrentIndex(0);
            setDragX(0);
          }}
          className="mt-6 px-6 py-3 bg-(--color-primary) text-white rounded-full font-bold hover:bg-(--color-primary)/90 transition-colors shadow-md"
        >
          Ver recomendações novamente
        </button>
      </div>
    );
  }

  const animal = animais[currentIndex];

  // Cálculo da opacidade dos selos baseado na distância arrastada
  const likeOpacity = Math.min(Math.max(dragX / 100, 0), 1);
  const nopeOpacity = Math.min(Math.max(-dragX / 100, 0), 1);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center relative overflow-hidden px-4 md:px-0">
      
      {/* Cartão Interativo */}
      <div 
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUpOrLeave}
        onPointerLeave={onPointerUpOrLeave}
        onPointerCancel={onPointerUpOrLeave}
        className="relative w-full h-[60vh] max-h-[550px] min-h-[400px] bg-white rounded-3xl overflow-hidden shadow-xl border border-(--color-secondary)/10 touch-pan-y cursor-grab active:cursor-grabbing z-20 select-none"
        style={{
          // Move o eixo X e aplica uma leve rotação de acordo com a distância
          transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
          // Se estiver a arrastar, tira a transição para seguir o dedo instantaneamente. Se largar, anima o retorno.
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        
        <div className="absolute inset-0 bg-gray-200 pointer-events-none">
          {animal.fotos && animal.fotos.length > 0 ? (
            <img
              src={animal.fotos[0]}
              alt={animal.nome}
              className="w-full h-full object-cover pointer-events-none"
              draggable="false"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sem Foto
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Selo LIKE (Aparece ao arrastar para a direita) */}
        <div 
          className="absolute top-8 left-8 border-4 border-(--color-primary) text-(--color-primary) font-black text-4xl px-4 py-1 rounded-lg uppercase tracking-widest rotate-[-15deg] pointer-events-none"
          style={{ opacity: likeOpacity }}
        >
          Gostei
        </div>

        {/* Selo NOPE (Aparece ao arrastar para a esquerda) */}
        <div 
          className="absolute top-8 right-8 border-4 border-red-500 text-red-500 font-black text-4xl px-4 py-1 rounded-lg uppercase tracking-widest rotate-[15deg] pointer-events-none"
          style={{ opacity: nopeOpacity }}
        >
          Passar
        </div>

        {animal.matchScore !== undefined && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg border border-white/20 z-10 pointer-events-none">
            <Heart size={16} fill="var(--color-primary)" className="text-(--color-primary)" />
            <span className="text-sm font-black text-(--color-secondary)">
              {animal.matchScore}% Match
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-2 z-10 text-white pointer-events-none">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black leading-tight drop-shadow-md">
                {animal.nome}
              </h2>
              <p className="text-lg font-medium opacity-90 drop-shadow-sm flex items-center gap-2">
                <span className="capitalize">{animal.especie}</span>
                <span>•</span>
                <span>{calcularIdade(animal.data_nascimento)}</span>
              </p>
            </div>
            <button className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors pointer-events-auto">
              <Info size={24} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Controlos Físicos (Para quem prefere clicar em vez de arrastar) */}
      <div className="flex items-center justify-center gap-6 mt-8 z-10">
        <button
          onClick={() => {
            setDragX(-200); // Simula o arraste antes de saltar
            setTimeout(handleNext, 200);
          }}
          className="w-16 h-16 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md text-red-500 hover:bg-red-50 hover:scale-110 transition-all duration-200"
        >
          <X size={32} strokeWidth={3} />
        </button>

        <button
          onClick={() => {
            setDragX(200);
            setTimeout(() => handleMatch(animal), 200);
          }}
          className="w-20 h-20 flex items-center justify-center bg-(--color-primary) rounded-full shadow-lg text-white hover:bg-(--color-primary)/90 hover:scale-110 transition-all duration-200"
        >
          <Heart size={40} fill="currentColor" />
        </button>
      </div>
      
      <div className="mt-4 text-xs font-bold text-(--color-secondary)/40">
        {currentIndex + 1} de {animais.length}
      </div>
    </div>
  );
}