'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { calcularIdade } from '@/utils/utils';

export interface PerfilComportamental {
  porte: number;
  idade_perfil: number;
  nivel_energia: number;
  sociabilidade_crianca: number;
  sociabilidade_animais: number;
  necessidade_espaco: number;
  independencia: number;
}

export interface Animal {
  id: string;
  nome: string;
  especie: string;
  genero: string;
  data_nascimento: string | null;
  fotos: string[];
  perfil_comportamental_pet?: PerfilComportamental | PerfilComportamental[];
  matchScore?: number;
}

interface AdoptionGridUIProps {
  animais: Animal[];
}

export function AdoptionGridUI({ animais }: AdoptionGridUIProps) {
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');

  const animaisFiltrados = animais.filter((animal) => {
    if (filtroAtivo === 'Todos') return true;
    return animal.especie.toLowerCase() === filtroAtivo.toLowerCase();
  });

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2">
          {['Todos', 'Cachorro', 'Gato'].map((filtro) => (
            <button
              key={filtro}
              onClick={() => setFiltroAtivo(filtro)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filtroAtivo === filtro
                  ? 'bg-(--color-primary) text-(--color-background)'
                  : 'bg-(--color-background) text-(--color-secondary) border border-(--color-secondary)/20 hover:border-(--color-primary)'
              }`}
            >
              {filtro}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {animaisFiltrados.map((animal) => (
          <div
            key={animal.id}
            className="bg-(--color-background) border border-(--color-secondary)/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col"
          >
            <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
              {animal.fotos && animal.fotos.length > 0 ? (
                <img
                  src={animal.fotos[0]}
                  alt={animal.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Sem Foto
                </div>
              )}

              {/* Se o AdoptionDiscovery calculou o Match, ele aparece aqui */}
              {animal.matchScore !== undefined && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/20 z-10">
                  <Heart
                    size={14}
                    fill="var(--color-primary)"
                    className="text-(--color-primary)"
                  />
                  <span className="text-sm font-black text-(--color-secondary)">
                    {animal.matchScore}% Match
                  </span>
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-extrabold text-(--color-secondary)">
                  {animal.nome}
                </h4>
                <span className="text-xs font-bold px-2 py-1 bg-(--color-secondary)/5 text-(--color-secondary)/70 rounded-md">
                  {animal.genero}
                </span>
              </div>
              <p className="text-sm font-medium text-(--color-secondary)/60">
                {animal.especie} • {calcularIdade(animal.data_nascimento)}
              </p>
            </div>
          </div>
        ))}

        {animaisFiltrados.length === 0 && (
          <div className="col-span-full text-center py-10 text-(--color-secondary)/50">
            Nenhum {filtroAtivo.toLowerCase()} encontrado no momento.
          </div>
        )}
      </div>
    </div>
  );
}