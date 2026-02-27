"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Heart } from "lucide-react";

// 1. Atualizamos a Interface para refletir a nova estrutura do banco
interface PerfilComportamental {
  nivel_energia: number;
  necessidade_espaco: number;
  sociabilidade: number;
}

interface Animal {
  id: string;
  nome: string;
  especie: string;
  genero: string;
  idade: string;
  imagem_url: string;
  // O perfil agora vem como um objeto separado (ou array, dependendo de como o Supabase entrega)
  perfil_comportamental_pet?: PerfilComportamental | PerfilComportamental[]; 
  matchScore?: number; 
}

function calcularSimilaridadeCosseno(vetorA: number[], vetorB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vetorA.length; i++) {
    dotProduct += vetorA[i] * vetorB[i];
    normA += Math.pow(vetorA[i], 2);
    normB += Math.pow(vetorB[i], 2);
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function AdoptionGrid() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function carregarDados() {
      // 2. A MÁGICA DO BANCO: Pede o animal E o perfil comportamental dele na mesma viagem!
      const { data: animaisData, error: animaisError } = await supabase
        .from("animais")
        .select(`
          *,
          perfil_comportamental_pet (*)
        `);

      if (animaisError) {
        console.error("Erro ao buscar animais:", animaisError);
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      let animaisProcessados = animaisData as Animal[];

      if (session?.user) {
        const { data: respostasData } = await supabase
          .from("respostas_questionario")
          .select("*")
          .eq("id_usuario", session.user.id)
          .single();

        if (respostasData) {
          const vetorAdotante = [
            respostasData.disposicao_passeios,
            respostasData.tamanho_residencia,
            respostasData.possui_outros_pets
          ];

          animaisProcessados = animaisData.map((animal) => {
            // Como o Supabase pode entregar como array ou objeto, nós extraímos com segurança
            const perfilRaw = animal.perfil_comportamental_pet;
            const perfil = Array.isArray(perfilRaw) ? perfilRaw[0] : perfilRaw;

            // Se o animal por algum motivo não tiver perfil, a gente pula o cálculo dele
            if (!perfil) return animal;

            // 3. Pegamos as notas do perfil separado
            const vetorAnimal = [
              perfil.nivel_energia,
              perfil.necessidade_espaco,
              perfil.sociabilidade
            ];

            const similaridade = calcularSimilaridadeCosseno(vetorAdotante, vetorAnimal);
            
            return {
              ...animal,
              matchScore: Math.round(similaridade * 100)
            };
          });

          // Ordena do maior Match para o menor
          animaisProcessados.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }
      }

      setAnimais(animaisProcessados);
      setLoading(false);
    }

    carregarDados();
  }, []);

  const animaisFiltrados = animais.filter((animal) => {
    if (filtroAtivo === "Todos") return true;
    return animal.especie.toLowerCase() === filtroAtivo.toLowerCase();
  });

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-2xl font-bold text-[var(--color-secondary)]">
          Encontre seu novo amigo
        </h3>

        <div className="flex gap-2">
          {["Todos", "Cachorro", "Gato"].map((filtro) => (
            <button
              key={filtro}
              onClick={() => setFiltroAtivo(filtro)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filtroAtivo === filtro
                  ? "bg-[var(--color-primary)] text-[var(--color-background)]"
                  : "bg-[var(--color-background)] text-[var(--color-secondary)] border border-[var(--color-secondary)]/20 hover:border-[var(--color-primary)]"
              }`}
            >
              {filtro}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="w-full text-center py-10 text-[var(--color-secondary)]/50">
          Carregando peludos...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {animaisFiltrados.map((animal) => (
            <div
              key={animal.id}
              className="bg-[var(--color-background)] border border-[var(--color-secondary)]/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col"
            >
              <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                {animal.imagem_url ? (
                  <img
                    src={animal.imagem_url}
                    alt={animal.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sem Foto
                  </div>
                )}
                
                {animal.matchScore !== undefined && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/20 z-10">
                    <Heart size={14} fill="var(--color-primary)" className="text-[var(--color-primary)]" />
                    <span className="text-sm font-black text-[var(--color-secondary)]">
                      {animal.matchScore}% Match
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-extrabold text-[var(--color-secondary)]">
                    {animal.nome}
                  </h4>
                  <span className="text-xs font-bold px-2 py-1 bg-[var(--color-secondary)]/5 text-[var(--color-secondary)]/70 rounded-md">
                    {animal.genero}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--color-secondary)]/60">
                  {animal.especie} • {animal.idade}
                </p>
              </div>
            </div>
          ))}

          {animaisFiltrados.length === 0 && (
            <div className="col-span-full text-center py-10 text-[var(--color-secondary)]/50">
              Nenhum {filtroAtivo.toLowerCase()} encontrado no momento.
            </div>
          )}
        </div>
      )}
    </div>
  );
}