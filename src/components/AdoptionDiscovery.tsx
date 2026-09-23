'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PlusCircle, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { AdoptionGridUI, Animal } from './AdoptionGridUI';
import { AdoptionSwipe } from './AdoptionSwipe';

// Função matemática pura (Cérebro do algoritmo)
function calcularSimilaridadeCosseno(vetorA: number[], vetorB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vetorA.length; i++) {
    if (vetorA[i] === undefined || vetorB[i] === undefined) continue;

    dotProduct += vetorA[i] * vetorB[i];
    normA += Math.pow(vetorA[i], 2);
    normB += Math.pow(vetorB[i], 2);
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function AdoptionDiscovery() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function carregarDados() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: perfil } = await supabase
            .from('perfis')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

          if (perfil?.is_admin) {
            setIsAdmin(true);
            return;
          }
        }

        const { data: animaisData, error: animaisError } = await supabase.from('animais').select(`
            *,
            perfil_comportamental_pet (*)
          `);

        if (animaisError) {
          console.error('Erro ao buscar animais:', animaisError);
          return;
        }

        let animaisProcessados = (animaisData || []) as Animal[];

        if (session?.user && animaisProcessados.length > 0) {
          const { data: respostasData } = await supabase
            .from('respostas_questionario')
            .select('*')
            .eq('id_usuario', session.user.id)
            .single();

          if (respostasData) {
            setHasProfile(true);

            const vetorAdotante = [
              respostasData.porte_escolhido || 0,
              respostasData.faixa_etaria || 0,
              respostasData.disposicao_passeios || 0,
              respostasData.sociabilidade_crianca || 0,
              respostasData.sociabilidade_animais || 0,
              respostasData.tamanho_residencia || 0,
              respostasData.tempo_sozinho || 0
            ];

            animaisProcessados = animaisProcessados.map((animal) => {
              const perfilRaw = animal.perfil_comportamental_pet;
              const perfil = Array.isArray(perfilRaw) ? perfilRaw[0] : perfilRaw;

              if (!perfil) return animal;

              const vetorAnimal = [
                perfil.porte || 0,
                perfil.idade_perfil || 0,
                perfil.nivel_energia || 0,
                perfil.sociabilidade_crianca || 0,
                perfil.sociabilidade_animais || 0,
                perfil.necessidade_espaco || 0,
                perfil.independencia || 0
              ];

              const similaridade = calcularSimilaridadeCosseno(vetorAdotante, vetorAnimal);

              return {
                ...animal,
                matchScore: Math.max(0, Math.round(similaridade * 100)),
              };
            });

            animaisProcessados.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
          }
        }

        setAnimais(animaisProcessados);

      } catch (error) {
        // Se houver qualquer quebra no código, será apanhada aqui e registada
        console.error("Erro inesperado ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  // ==========================================
  // RENDERIZAÇÃO CONDICIONAL
  // ==========================================

  if (loading) {
    return (
      <div className="w-full text-center py-10 text-(--color-secondary)/50">
        Calculando os melhores matches para si...
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-(--color-secondary)/10 pb-4">
          <LayoutDashboard className="text-(--color-primary)" size={32} />
          <h3 className="text-2xl font-bold text-(--color-secondary)">
            Painel de Gerenciamento da ONG
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/gerenciar-animais"
            className="bg-white p-6 rounded-3xl shadow-sm border border-(--color-secondary)/10 flex flex-col items-center text-center gap-3 hover:shadow-md hover:border-(--color-primary)/50 hover:-translate-y-1 transition-all group cursor-pointer"
          >
            <div className="bg-(--color-primary)/10 p-4 rounded-full text-(--color-primary) group-hover:scale-110 transition-transform duration-300">
              <PlusCircle size={32} />
            </div>
            <h4 className="font-bold text-lg text-(--color-secondary) group-hover:text-(--color-primary) transition-colors">
              Animais
            </h4>
            <p className="text-sm text-(--color-secondary)/60">
              Adicione um novo pet ao sistema para adoção.
            </p>
          </Link>

          <Link
            href="/gerenciar-eventos"
            className="bg-white p-6 rounded-3xl shadow-sm border border-(--color-secondary)/10 flex flex-col items-center text-center gap-3 hover:shadow-md hover:border-(--color-primary)/50 hover:-translate-y-1 transition-all group cursor-pointer"
          >
            <div className="bg-(--color-primary)/10 p-4 rounded-full text-(--color-primary) group-hover:scale-110 transition-transform duration-300">
              <PlusCircle size={32} />
            </div>
            <h4 className="font-bold text-lg text-(--color-secondary) group-hover:text-(--color-primary) transition-colors">
              Eventos
            </h4>
            <p className="text-sm text-(--color-secondary)/60">
              Crie ou edite eventos no calendário UPAR.
            </p>
          </Link>
        </div>
      </div>
    );
  }

  if (hasProfile) {
    return (
      <div className="w-full flex flex-col gap-6 items-center">
        <div className="mb-2 text-center">
          <h3 className="text-2xl font-bold text-(--color-secondary)">
            Os Seus Melhores Matches
          </h3>
          <p className="text-sm text-(--color-secondary)/60">
            Arraste para a direita para gostar ou para a esquerda para passar.
          </p>
        </div>

        <div className="w-full">
          <AdoptionSwipe animais={animais} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="mb-2">
        <h3 className="text-2xl font-bold text-(--color-secondary)">
          Encontre o seu novo amigo
        </h3>
        <p className="text-sm text-(--color-secondary)/60">
          Responda ao questionário de adoção para ativar o nosso algoritmo de match!
        </p>
      </div>
      <AdoptionGridUI animais={animais} />
    </div>
  );
}