"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Heart, PlusCircle, LayoutDashboard } from "lucide-react";
import { calcularIdade } from "@/utils/utils";

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
  data_nascimento: string | null;
  imagem_url: string;
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
  const [isAdmin, setIsAdmin] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function carregarDados() {
      const { data: { session } } = await supabase.auth.getSession();

      // 1. Verifica se tem alguém logado e se é ADMIN
      if (session?.user) {
        const { data: perfil } = await supabase
          .from("perfis")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();

        if (perfil?.is_admin) {
          setIsAdmin(true);
          setLoading(false);
          return; // Se é admin, encerramos a busca aqui para economizar processamento, pois ele não verá o grid!
        }
      }

      // 2. Se não for admin, segue o jogo normal e carrega os animais!
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

      let animaisProcessados = animaisData as Animal[];

      // 3. Calcula o Match do Adotante (só chega aqui se não for admin)
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
            const perfilRaw = animal.perfil_comportamental_pet;
            const perfil = Array.isArray(perfilRaw) ? perfilRaw[0] : perfilRaw;

            if (!perfil) return animal;

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

          animaisProcessados.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }
      }

      setAnimais(animaisProcessados);
      setLoading(false);
    }

    carregarDados();
  }, [supabase]);

  const animaisFiltrados = animais.filter((animal) => {
    if (filtroAtivo === "Todos") return true;
    return animal.especie.toLowerCase() === filtroAtivo.toLowerCase();
  });

  if (loading) {
    return (
      <div className="w-full text-center py-10 text-[var(--color-secondary)]/50">
        Carregando informações...
      </div>
    );
  }

  // ==========================================
  // VISÃO DO ADMINISTRADOR
  // ==========================================
  if (isAdmin) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-[var(--color-secondary)]/10 pb-4">
          <LayoutDashboard className="text-[var(--color-primary)]" size={32} />
          <h3 className="text-2xl font-bold text-[var(--color-secondary)]">
            Painel da ONG
          </h3>
        </div>

        {/* Aqui você pode adicionar cards de estatísticas, botões rápidos, etc. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[var(--color-secondary)]/10 flex flex-col items-center text-center gap-3">
            <div className="bg-[var(--color-primary)]/10 p-4 rounded-full text-[var(--color-primary)]">
              <PlusCircle size={32} />
            </div>
            <h4 className="font-bold text-lg text-[var(--color-secondary)]">Cadastrar Animal</h4>
            <p className="text-sm text-[var(--color-secondary)]/60">Adicione um novo pet ao sistema para adoção.</p>
            <button className="mt-2 text-sm font-bold text-[var(--color-primary)] ">
              Acessar formulário
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[var(--color-secondary)]/10 flex flex-col items-center text-center gap-3 opacity-50">
            <h4 className="font-bold text-lg text-[var(--color-secondary)]">Estatística 1</h4>
            <p className="text-sm text-[var(--color-secondary)]/60">Em breve</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[var(--color-secondary)]/10 flex flex-col items-center text-center gap-3 opacity-50">
            <h4 className="font-bold text-lg text-[var(--color-secondary)]">Estatística 2</h4>
            <p className="text-sm text-[var(--color-secondary)]/60">Em breve</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISÃO DO ADOTANTE (GRID DE ANIMAIS NORMAL)
  // ==========================================
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
                {animal.especie} • {calcularIdade(animal.data_nascimento)}
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
    </div>
  );
}