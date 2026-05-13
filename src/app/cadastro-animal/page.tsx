'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, PlusCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { SelectorBar } from '@/components/ui/SelectorBar';

export default function CadastroAnimalPage() {
  // --- Estados: Dados Básicos do Animal ---
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('Cachorro');
  const [genero, setGenero] = useState('Fêmea');
  const [dataNascimento, setDataNascimento] = useState('');
  const [corPelagem, setCorPelagem] = useState('');

  // --- Estados: Dados de Resgate ---
  const [enderecoResgate, setEnderecoResgate] = useState('');
  const [microchip, setMicrochip] = useState('');
  const [castrado, setCastrado] = useState(false);
  const [condicaoChegada, setCondicaoChegada] = useState('');
  const [observacoesResgate, setObservacoesResgate] = useState('');

  // --- Estados: Perfil Comportamental (Match) ---
  const [energia, setEnergia] = useState(3);
  const [espaco, setEspaco] = useState(3);
  const [sociabilidade, setSociabilidade] = useState(3);

  // --- Estados: Controle de UI e Autenticação ---
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Proteção da Rota: Só Admin pode acessar
  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/');
        return;
      }

      const { data } = await supabase
        .from('perfis')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!data?.is_admin) {
        router.push('/');
      } else {
        setIsAdmin(true);
      }
    }

    checkAdmin();
  }, [router, supabase]);

  // Envio do formulário
  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    // 1. Salva na tabela 'animais'
    const { data: animalCriado, error: animalError } = await supabase
      .from('animais')
      .insert([
        {
          nome,
          especie,
          genero,
          data_nascimento: dataNascimento || null,
          cor_pelagem: corPelagem || null,
          endereco_resgate: enderecoResgate || null,
          castrado,
          microchip: microchip || null,
          condicao_chegada: condicaoChegada || null, // Valide se o nome da coluna no banco está no singular
          observacoes_resgate: observacoesResgate || null, // Valide se o nome da coluna no banco é esse mesmo
        },
      ])
      .select()
      .single();

    if (animalError) {
      console.error('ERRO AO CRIAR ANIMAL:', animalError);
      setErro('Falha ao cadastrar os dados básicos do animal.');
      setLoading(false);
      return;
    }

    // 2. Salva na tabela 'perfil_comportamental_pet'
    const { error: perfilError } = await supabase
      .from('perfil_comportamental_pet')
      .insert([
        {
          id_animal: animalCriado.id,
          nivel_energia: energia,
          necessidade_espaco: espaco,
          sociabilidade: sociabilidade,
        },
      ]);

    if (perfilError) {
      console.error('ERRO AO CRIAR PERFIL:', perfilError);
      setErro('Animal criado, mas falhou ao salvar o perfil comportamental.');
      setLoading(false);
      return;
    }

    // Sucesso Total!
    setSucesso(true);
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  // Se ainda estiver validando o usuário, previne renderização fantasma
  if (isAdmin === null) return null;

  // Tela de Sucesso
  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <div className="flex flex-col items-center text-center p-8">
          <CheckCircle2 size={80} className="text-green-500 mb-6" />
          <h2 className="text-3xl font-black text-(--color-secondary)">
            Pet Cadastrado!
          </h2>
          <p className="text-(--color-secondary)/60 mt-2 font-medium">
            O algoritmo já está pronto para recomendar o {nome} aos adotantes.
          </p>
        </div>
      </div>
    );
  }

  // Tela Principal (Formulário)
  return (
    <div className="min-h-screen bg-(--color-background) pb-20">
      <div className="max-w-2xl mx-auto pt-10 px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-(--color-secondary)/60 hover:text-(--color-primary) font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Voltar ao Painel
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-(--color-secondary)/10">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-(--color-secondary)/10">
            <div className="bg-(--color-primary)/10 p-4 rounded-2xl text-(--color-primary)">
              <PlusCircle size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-(--color-secondary)">
                Cadastrar Animal
              </h1>
              <p className="text-sm font-medium text-(--color-secondary)/60 mt-1">
                Adicione as informações físicas e comportamentais do novo pet.
              </p>
            </div>
          </div>

          <form onSubmit={handleCadastrar} className="flex flex-col gap-8">
            {erro && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3 border border-red-100">
                <AlertCircle size={20} />
                {erro}
              </div>
            )}

            {/* --- SEÇÃO 1: DADOS BÁSICOS --- */}
            <div className="flex flex-col gap-5">
              <h3 className="text-lg font-black text-(--color-secondary) border-b border-(--color-secondary)/10 pb-2">
                1. Dados Básicos
              </h3>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-(--color-secondary) ml-1">
                  Nome do Animal
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all text-(--color-secondary)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CustomSelect
                  label="Espécie"
                  value={especie}
                  onChange={setEspecie}
                  options={[
                    { value: 'Cachorro', label: 'Cachorro' },
                    { value: 'Gato', label: 'Gato' },
                  ]}
                />
                <CustomSelect
                  label="Gênero"
                  value={genero}
                  onChange={setGenero}
                  options={[
                    { value: 'Macho', label: 'Macho' },
                    { value: 'Fêmea', label: 'Fêmea' },
                  ]}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-(--color-secondary) ml-1">
                  Data de Nascimento (Aproximada)
                </label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  required
                  className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all text-(--color-secondary)"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-(--color-secondary) ml-1">
                  Cor da Pelagem
                </label>
                <input
                  type="text"
                  value={corPelagem}
                  onChange={(e) => setCorPelagem(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all text-(--color-secondary)"
                  placeholder="Ex: Preto, Branco, Laranja"
                />
              </div>
            </div>

            {/* --- SEÇÃO 2: DADOS DO RESGATE --- */}
            <div className="flex flex-col gap-5">
              <h3 className="text-lg font-black text-(--color-secondary) border-t border-(--color-secondary)/10 pt-2">
                2. Dados do Resgate
              </h3>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-(--color-secondary) ml-1">
                  Endereço do Resgate
                </label>
                <input
                  type="text"
                  value={enderecoResgate}
                  onChange={(e) => setEnderecoResgate(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all text-(--color-secondary)"
                  placeholder="Ex: Jardim Morada do Sol"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-(--color-secondary) ml-1">
                    Número do Microchip
                  </label>
                  <input
                    type="text"
                    value={microchip}
                    onChange={(e) => setMicrochip(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all text-(--color-secondary)"
                    placeholder="Se possuir..."
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-(--color-secondary) ml-1">
                    Status de Castração
                  </label>
                  <label className="flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border border-(--color-secondary)/20 cursor-pointer hover:border-(--color-primary) transition-colors h-12.5">
                    <span className="text-sm font-medium text-(--color-secondary)">
                      O animal já é castrado?
                    </span>
                    <input
                      type="checkbox"
                      checked={castrado}
                      onChange={(e) => setCastrado(e.target.checked)}
                      className="w-5 h-5 accent-(--color-primary) cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-(--color-secondary) ml-1">
                  Condições de Chegada
                </label>
                <textarea
                  value={condicaoChegada}
                  onChange={(e) => setCondicaoChegada(e.target.value)}
                  rows={3}
                  className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all text-(--color-secondary) resize-none"
                  placeholder="Como o animal estava fisicamente quando chegou?"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-(--color-secondary) ml-1">
                  Detalhes de Maus-tratos (Se houver)
                </label>
                <textarea
                  value={observacoesResgate}
                  onChange={(e) => setObservacoesResgate(e.target.value)}
                  rows={3}
                  className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all text-(--color-secondary) resize-none"
                  placeholder="Apanhava, passava fome, ficava acorrentado..."
                />
              </div>
            </div>

            {/* --- SEÇÃO 3: ALGORITMO DE MATCH --- */}
            <div className="flex flex-col gap-6 mt-4">
              <h3 className="text-lg font-black text-(--color-secondary) border-b border-(--color-secondary)/10 pb-2">
                3. Perfil Comportamental (Algoritmo)
              </h3>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-(--color-secondary)">
                  Nível de Energia
                </label>
                <SelectorBar
                  value={energia}
                  setter={setEnergia}
                  labels={['Muito calmo', 'Moderado', 'Agitado/Atleta']}
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-(--color-secondary)">
                  Necessidade de Espaço
                </label>
                <SelectorBar
                  value={espaco}
                  setter={setEspaco}
                  labels={[
                    'Ok em apartamento',
                    'Precisa de quintal',
                    'Sítio/Muito espaço',
                  ]}
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-(--color-secondary)">
                  Sociabilidade (Outros pets/pessoas)
                </label>
                <SelectorBar
                  value={sociabilidade}
                  setter={setSociabilidade}
                  labels={[
                    'Prefere ficar sozinho',
                    'Tempo de adaptação',
                    'Ama todos/Brincalhão',
                  ]}
                />
              </div>
            </div>

            {/* --- BOTÃO SUBMIT --- */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-(--color-primary) text-white font-bold py-4 rounded-xl hover:bg-(--color-primary)/90 transition-all shadow-md flex justify-center items-center disabled:opacity-70 text-lg"
            >
              {loading ? 'Salvando no banco de dados...' : 'Finalizar Cadastro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
