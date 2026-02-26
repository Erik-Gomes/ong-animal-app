"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

// Nossa base de dados falsa (Mock) com fotos de pets
const animals = [
  {
    id: 1,
    name: "Thor",
    species: "Cachorro",
    gender: "Macho",
    age: "2 anos",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400&h=400",
    match: true, // Indica se faz parte da "Minha seleção" (Match do usuário)
  },
  {
    id: 2,
    name: "Mia",
    species: "Gato",
    gender: "Fêmea",
    age: "3 anos",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400&h=400",
    match: false,
  },
  {
    id: 3,
    name: "Bidu",
    species: "Cachorro",
    gender: "Macho",
    age: "8 meses",
    image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400&h=400",
    match: true,
  },
  {
    id: 4,
    name: "Luna",
    species: "Cachorro",
    gender: "Fêmea",
    age: "4 anos",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400&h=400",
    match: false,
  },
  {
    id: 5,
    name: "Simba",
    species: "Gato",
    gender: "Macho",
    age: "1 ano",
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=400&h=400",
    match: true,
  },
  {
    id: 6,
    name: "Amora",
    species: "Cachorro",
    gender: "Fêmea",
    age: "2 anos",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=400&h=400",
    match: false,
  }
];

export function AdoptionGrid() {
  // Controle de qual aba está ativa ("all" ou "match")
  const [activeTab, setActiveTab] = useState<"all" | "match">("match");

  // Filtra os animais dependendo da aba selecionada
  const displayedAnimals = activeTab === "all" 
    ? animals 
    : animals.filter(animal => animal.match);

  return (
    <div className="w-full flex flex-col gap-8">
      
      {/* Botões de Toggle (Filtro Principal) */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 ${
            activeTab === "all"
              ? "bg-[var(--color-secondary)] text-[var(--color-background)] shadow-md"
              : "bg-transparent text-[var(--color-secondary)] border-2 border-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10"
          }`}
        >
          Todos os animais
        </button>
        
        <button
          onClick={() => setActiveTab("match")}
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 ${
            activeTab === "match"
              ? "bg-[var(--color-secondary)] text-[var(--color-background)] shadow-md"
              : "bg-transparent text-[var(--color-secondary)] border-2 border-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10"
          }`}
        >
          <Heart size={20} className={activeTab === "match" ? "fill-[var(--color-primary)] text-[var(--color-primary)]" : ""} />
          Minha seleção
        </button>
      </div>

      {/* Grid de Animais */}
      {/* sm, md, lg, xl controlam a quantidade de colunas em diferentes telas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedAnimals.map((animal) => (
          <div 
            key={animal.id}
            className="bg-[var(--color-background)] rounded-[var(--radius-4xl)] p-4 flex flex-col gap-4 shadow-sm shadow-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            {/* Imagem do Animal */}
            <div className="w-full aspect-square rounded-[var(--radius-4xl)] overflow-hidden relative bg-gray-100">
              {/* Usando tag img padrão para evitar necessidade de configurar domínios no Next.js agora */}
              <img 
                src={animal.image} 
                alt={`Foto do(a) ${animal.name}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Informações */}
            <div className="flex flex-col px-2">
              <h4 className="text-2xl font-black text-[var(--color-primary)]">
                {animal.name}
              </h4>
              <p className="text-[var(--color-secondary)]/80 font-medium text-sm">
                {animal.gender} | {animal.age}
              </p>
            </div>

            {/* Botão de Adotar */}
            <button className="mt-auto w-full bg-[var(--color-secondary)] text-[var(--color-background)] py-3 rounded-full font-bold hover:bg-[var(--color-primary)] transition-colors duration-300">
              Quero Adotar!
            </button>
          </div>
        ))}
      </div>

      {/* Mensagem se não houver animais na seleção */}
      {displayedAnimals.length === 0 && (
        <div className="text-center py-12 text-[var(--color-secondary)]/60 font-medium">
          Nenhum animal encontrado para esta seleção no momento.
        </div>
      )}

    </div>
  );
}