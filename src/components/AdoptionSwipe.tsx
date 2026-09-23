'use client';

import { useState } from 'react';
import { Heart, X, Info, CheckCircle2 } from 'lucide-react';
import { calcularIdade } from '@/utils/utils';
import { Animal } from './AdoptionGridUI'; // Importamos a interface do Grid para manter o padrão

interface AdoptionSwipeProps {
  animais: Animal[];
}

export function AdoptionSwipe({ animais }: AdoptionSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < animais.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleMatch = (animal: Animal) => {
    // Futuramente, esta função poderá guardar o animal numa tabela de "favoritos" ou "matches_interagidos"
    console.log('Interesse registado no animal:', animal.nome);
    handleNext();
  };

  if (!animais || animais.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-(--color-secondary)/50 text-center">
        <Heart size={48} className="mb-4 opacity-20" />
        <p className="font-medium">Nenhum animal encontrado no momento.</p>
      </div>
    );
  }

  // Ecrã final quando o utilizador já visualizou todos os cartões
  if (currentIndex >= animais.length) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-(--color-secondary)/50 text-center">
        <CheckCircle2 size={48} className="mb-4 text-(--color-primary)" />
        <h3 className="text-xl font-bold text-(--color-secondary) mb-2">Chegou ao fim!</h3>
        <p className="font-medium">Já visualizou todos os seus matches atuais.</p>
        <button 
          onClick={() => setCurrentIndex(0)}
          className="mt-6 px-6 py-3 bg-(--color-primary) text-white rounded-full font-bold hover:bg-(--color-primary)/90 transition-colors shadow-md"
        >
          Ver recomendações novamente
        </button>
      </div>
    );
  }

  const animal = animais[currentIndex];

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center relative perspective-1000">
      
      {/* Cartão Principal do Animal */}
      <div className="relative w-full h-[65vh] max-h-[600px] min-h-[450px] bg-white rounded-3xl overflow-hidden shadow-xl border border-(--color-secondary)/10 transform transition-all duration-300">
        
        {/* Imagem de Fundo */}
        <div className="absolute inset-0 bg-gray-200">
          {animal.fotos && animal.fotos.length > 0 ? (
            <img
              src={animal.fotos[0]}
              alt={animal.nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sem Foto
            </div>
          )}
        </div>

        {/* Gradiente inferior para garantir a legibilidade do texto sobre a foto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Badge de Match Score no topo do cartão */}
        {animal.matchScore !== undefined && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg border border-white/20 z-10">
            <Heart size={16} fill="var(--color-primary)" className="text-(--color-primary)" />
            <span className="text-sm font-black text-(--color-secondary)">
              {animal.matchScore}% Match
            </span>
          </div>
        )}

        {/* Informações do Animal (Rodapé do Cartão) */}
        <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-2 z-10 text-white">
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
            {/* Botão para ver mais detalhes do animal (abre modal no futuro) */}
            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors">
              <Info size={24} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Botões de Ação (Rejeitar / Aceitar) */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={handleNext}
          className="w-16 h-16 flex items-center justify-center bg-white border-2 border-gray-200 rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:border-red-500 hover:scale-110 transition-all duration-200"
          aria-label="Passar animal"
        >
          <X size={32} strokeWidth={3} />
        </button>

        <button
          onClick={() => handleMatch(animal)}
          className="w-20 h-20 flex items-center justify-center bg-(--color-primary) rounded-full shadow-lg text-white hover:bg-(--color-primary)/90 hover:scale-110 transition-all duration-200"
          aria-label="Gostar do animal"
        >
          <Heart size={40} fill="currentColor" />
        </button>
      </div>
      
      {/* Indicador Numérico de Progresso */}
      <div className="mt-6 text-xs font-bold text-(--color-secondary)/40">
        {currentIndex + 1} de {animais.length}
      </div>
    </div>
  );
}