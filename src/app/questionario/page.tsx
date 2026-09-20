'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ClipboardList, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { SelectorBar } from '@/components/ui/SelectorBar';

export default function QuestionarioPage() {
  // 1. Estados ordenados seguindo estritamente a ordem das perguntas na tela
  const [porte, setPorte] = useState<number>(0);
  const [idadePreferencia, setIdadePreferencia] = useState<number>(0);
  const [energia, setEnergia] = useState<number>(0);
  const [criancas, setCriancas] = useState<number>(0);
  const [espaco, setEspaco] = useState<number>(0);
  const [tempoSozinho, setTempoSozinho] = useState<number>(0);
  const [outrosAnimais, setOutrosAnimais] = useState<number>(0);

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function carregarDados() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/login');
        return;
      }

      setUserId(session.user.id);

      // Busca se o usuário já tem respostas para preencher o formulário
      const { data } = await supabase
        .from('respostas_questionario')
        .select('*')
        .eq('id_usuario', session.user.id)
        .single();

      if (data) {
        setPorte(data.porte_escolhido || 0);
        setIdadePreferencia(data.faixa_etaria || 0);
        setEnergia(data.disposicao_passeios || 0);
        setCriancas(data.sociabilidade_crianca || 0);
        setEspaco(data.tamanho_residencia || 0);
        setTempoSozinho(data.tempo_sozinho || 0);
        setOutrosAnimais(data.sociabilidade_animais || 0);
      }
    }
    carregarDados();
  }, [router, supabase]);

  const salvarQuestionario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    // Validação opcional: garantir que todos os 7 campos foram respondidos
    if (!porte || !idadePreferencia || !energia || !criancas || !espaco || !tempoSozinho || !outrosAnimais) {
      alert("Por favor, responda a todas as 7 perguntas antes de salvar.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('respostas_questionario').upsert(
      {
        id_usuario: userId,
        porte_escolhido: porte,
        faixa_etaria: idadePreferencia,
        disposicao_passeios: energia,
        sociabilidade_crianca: criancas,
        tamanho_residencia: espaco,
        tempo_sozinho: tempoSozinho,
        sociabilidade_animais: outrosAnimais,
        criado_em: new Date().toISOString(),
      },
      { onConflict: 'id_usuario' }
    );

    if (!error) {
      setSucesso(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      console.error('Erro ao salvar:', error);
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <div className="flex flex-col items-center text-center p-8">
          <CheckCircle2 size={80} className="text-green-500 mb-6" />
          <h2 className="text-3xl font-black text-(--color-secondary)">
            Perfil Salvo!
          </h2>
          <p className="text-(--color-secondary)/60 mt-2 font-medium">
            Calculando seus matches perfeitos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-background) pb-20">
      <div className="max-w-2xl mx-auto pt-10 px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-(--color-secondary)/60 hover:text-(--color-primary) font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Voltar ao início
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-(--color-secondary)/10">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-(--color-secondary)/10">
            <div className="bg-(--color-primary)/10 p-4 rounded-2xl text-(--color-primary)">
              <ClipboardList size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-(--color-secondary)">
                Teste de Perfil
              </h1>
              <p className="text-sm font-medium text-(--color-secondary)/60 mt-1">
                Conte-nos sobre seu estilo de vida para encontrarmos o pet ideal.
              </p>
            </div>
          </div>

          <form onSubmit={salvarQuestionario} className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                1. Qual o porte de animal que você busca e que se adequa ao seu espaço?
              </label>
              <SelectorBar
                value={porte}
                setter={setPorte}
                labels={['Pequeno', 'Médio', 'Grande']}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                2. Qual a faixa etária do animal que você tem preferência em adotar?
              </label>
              <SelectorBar
                value={idadePreferencia}
                setter={setIdadePreferencia}
                labels={['Filhote', 'Adulto', 'Idoso']}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                3. Como é a rotina da casa em termos de agitação e passeios?
              </label>
              <SelectorBar
                value={energia}
                setter={setEnergia}
                labels={['Rotina caseira', 'Passeios regulares', 'Alta']}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                4. Há crianças morando na residência ou que visitam com frequência?
              </label>
              <SelectorBar
                value={criancas}
                setter={setCriancas}
                labels={['Não', 'Às vezes', 'Sim']}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                5. Qual é o tipo de residência e o espaço disponível para o animal?
              </label>
              <SelectorBar
                value={espaco}
                setter={setEspaco}
                labels={['Sem quintal', 'Quintal pequeno', 'Quintal Grande']}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                6. Em média, quantas horas por dia o animal ficará sozinho em casa?
              </label>
              <SelectorBar
                value={tempoSozinho}
                setter={setTempoSozinho}
                labels={['Até 4 horas', 'De 4 a 8 horas', 'Mais de 8 horas ']}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                7. Você já possui ou recebe outros animais em casa?
              </label>
              <SelectorBar
                value={outrosAnimais}
                setter={setOutrosAnimais}
                labels={['Não', 'Apenas visitam', 'Sim']}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-(--color-primary) text-white font-bold py-4 rounded-xl hover:bg-(--color-primary)/90 transition-all shadow-md flex justify-center items-center disabled:opacity-70 text-lg"
            >
              {loading ? 'Salvando perfil...' : 'Descobrir meus Matches'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}