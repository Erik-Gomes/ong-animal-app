/* eslint-disable react-hooks/static-components */
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ClipboardList, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function QuestionarioPage() {
  const [disposicao, setDisposicao] = useState<number>(3);
  const [espaco, setEspaco] = useState<number>(3);
  const [sociabilidade, setSociabilidade] = useState<number>(3);

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
        setDisposicao(data.disposicao_passeios);
        setEspaco(data.tamanho_residencia);
        setSociabilidade(data.possui_outros_pets);
      }
    }
    carregarDados();
  }, [router]);

  const salvarQuestionario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);

    const { error } = await supabase.from('respostas_questionario').upsert(
      {
        id_usuario: userId,
        disposicao_passeios: disposicao,
        tamanho_residencia: espaco,
        possui_outros_pets: sociabilidade,
        criado_em: new Date().toISOString(),
      },
      { onConflict: 'id_usuario' },
    ); // Upsert atualiza se o id_usuario já existir

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

  // Componente reutilizável para os botões de 1 a 5
  const SelectorBar = ({
    value,
    setter,
    labels,
  }: {
    value: number;
    setter: (v: number) => void;
    labels: string[];
  }) => (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between w-full gap-2">
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setter(num)}
            className={`flex-1 py-3 rounded-xl font-black text-lg transition-all ${
              value === num
                ? 'bg-(--color-primary) text-white shadow-md scale-105'
                : 'bg-(--color-secondary)/5 text-(--color-secondary)/50 hover:bg-(--color-secondary)/10'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs font-bold text-(--color-secondary)/50 px-1">
        <span className="w-1/3 text-center">{labels[0]}</span>
        <span className="w-1/3 text-center">{labels[1]}</span>
        <span className="w-1/3 text-center">{labels[2]}</span>
      </div>
    </div>
  );

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
                Conte-nos sobre seu estilo de vida para encontrarmos o pet
                ideal.
              </p>
            </div>
          </div>

          <form onSubmit={salvarQuestionario} className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                1. Qual o porte de animal que você busca e que se adequa ao seu espaço?
              </label>
              <SelectorBar
                value={disposicao}
                setter={setDisposicao}
                labels={[
                  'Pequeno',
                  'Médio',
                  'Grande',
                ]}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                2. Qual a faixa etária do animal que você tem preferência em adotar?
              </label>
              <SelectorBar
                value={espaco}
                setter={setEspaco}
                labels={[
                  'Filhote',
                  'Adulto',
                  'Idoso',
                ]}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                3. Como é a rotina da casa em termos de agitação e passeios?
              </label>
              <SelectorBar
                value={sociabilidade}
                setter={setSociabilidade}
                labels={[
                  'Rotina caseira',
                  'Passeios regulares',
                  'Alta',
                ]}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                4. Há crianças morando na residência ou que visitam com frequência?
              </label>
              <SelectorBar
                value={sociabilidade}
                setter={setSociabilidade}
                labels={[
                  'Não',
                  'As vezes',
                  'Sim',
                ]}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                5. Você já possui outros animais de estimação em casa?
              </label>
              <SelectorBar
                value={sociabilidade}
                setter={setSociabilidade}
                labels={[
                  'Não',
                  '',
                  'Sim',
                ]}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                6. Qual é o tipo de residência e o espaço disponível para o animal?
              </label>
              <SelectorBar
                value={sociabilidade}
                setter={setSociabilidade}
                labels={[
                  'Sem quintal',
                  'Quintal pequeno',
                  'Quintal Grande',
                ]}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-lg font-bold text-(--color-secondary)">
                7. Em média, quantas horas por dia o animal ficará sozinho em casa?
              </label>
              <SelectorBar
                value={sociabilidade}
                setter={setSociabilidade}
                labels={[
                  'Até 4 horas',
                  'De 4 a 8 horas',
                  'Mais de 8 horas ',
                ]}
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
