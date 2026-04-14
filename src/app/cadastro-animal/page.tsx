"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Dog, Cat, PlusCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { CustomSelect } from "@/components/ui/CustomSelect";

export default function CadastroAnimalPage() {
  // Dados Básicos do Animal
  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("Cachorro");
  const [genero, setGenero] = useState("Macho");
  const [dataNascimento, setDataNascimento] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");

  // Perfil Comportamental (Para o Algoritmo de Match)
  const [energia, setEnergia] = useState(3);
  const [espaco, setEspaco] = useState(3);
  const [sociabilidade, setSociabilidade] = useState(3);

  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Proteção da Rota: Só Admin pode acessar
  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/");
        return;
      }
      const { data } = await supabase
        .from("perfis")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (!data?.is_admin) {
        router.push("/");
      } else {
        setIsAdmin(true);
      }
    }
    checkAdmin();
  }, [router, supabase]);

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    // 1. Salva na tabela 'animais'
    const { data: animalCriado, error: animalError } = await supabase
      .from("animais")
      .insert([
        {
          nome,
          especie,
          genero,
          data_nascimento: dataNascimento || null, // Se deixar vazio, salva como nulo
          imagem_url: imagemUrl || null, // Se deixar vazio, salva como nulo
        }
      ])
      .select() // Pede para o banco retornar a linha criada
      .single();

    if (animalError) {
      console.error("ERRO AO CRIAR ANIMAL:", animalError);
      setErro("Falha ao cadastrar os dados básicos do animal.");
      setLoading(false);
      return;
    }

    // 2. Com o ID do animal em mãos, salva na tabela 'perfil_comportamental_pet'
    const { error: perfilError } = await supabase
      .from("perfil_comportamental_pet")
      .insert([
        {
          id_animal: animalCriado.id,
          nivel_energia: energia,
          necessidade_espaco: espaco,
          sociabilidade: sociabilidade,
        }
      ]);

    if (perfilError) {
      console.error("ERRO AO CRIAR PERFIL:", perfilError);
      // Aqui, o ideal num sistema real seria desfazer a criação do animal, 
      // mas para testes vamos apenas exibir o erro.
      setErro("Animal criado, mas falhou ao salvar o perfil comportamental.");
      setLoading(false);
      return;
    }

    // Sucesso Total!
    setSucesso(true);
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  // Reutilizando o nosso componente de notas de 1 a 5
  const SelectorBar = ({ value, setter, labels }: { value: number, setter: (v: number) => void, labels: string[] }) => (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between w-full gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setter(num)}
            className={`flex-1 py-2 rounded-xl font-black text-md transition-all ${
              value === num 
                ? "bg-[var(--color-primary)] text-white shadow-md scale-105" 
                : "bg-[var(--color-secondary)]/5 text-[var(--color-secondary)]/50 hover:bg-[var(--color-secondary)]/10"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs font-bold text-[var(--color-secondary)]/50 px-1">
        <span className="w-1/3 text-left">{labels[0]}</span>
        <span className="w-1/3 text-center">{labels[1]}</span>
        <span className="w-1/3 text-right">{labels[2]}</span>
      </div>
    </div>
  );

  // Se ainda estiver validando o usuário, não mostra nada
  if (isAdmin === null) return null;

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center text-center p-8">
          <CheckCircle2 size={80} className="text-green-500 mb-6" />
          <h2 className="text-3xl font-black text-[var(--color-secondary)]">Pet Cadastrado!</h2>
          <p className="text-[var(--color-secondary)]/60 mt-2 font-medium">
            O algoritmo já está pronto para recomendar o {nome} aos adotantes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20">
      <div className="max-w-2xl mx-auto pt-10 px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-secondary)]/60 hover:text-[var(--color-primary)] font-bold mb-8 transition-colors">
          <ArrowLeft size={20} /> Voltar ao Painel
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--color-secondary)]/10">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--color-secondary)]/10">
            <div className="bg-[var(--color-primary)]/10 p-4 rounded-2xl text-[var(--color-primary)]">
              <PlusCircle size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[var(--color-secondary)]">Cadastrar Animal</h1>
              <p className="text-sm font-medium text-[var(--color-secondary)]/60 mt-1">
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

            {/* SEÇÃO 1: DADOS BÁSICOS */}
            <div className="flex flex-col gap-5">
              <h3 className="text-lg font-black text-[var(--color-secondary)] border-b border-[var(--color-secondary)]/10 pb-2">
                Dados Básicos
              </h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-[var(--color-secondary)] ml-1">Nome do Pet</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-[var(--color-secondary)]"
                  placeholder="Ex: Rex"
                />
              </div>

                <div className="grid grid-cols-2 gap-4">
                    <CustomSelect
                        label="Espécie"
                        value={especie}
                        onChange={setEspecie}
                        options={[
                        { value: "Cachorro", label: "Cachorro" },
                        { value: "Gato", label: "Gato" },
                        ]}
                    />
                    <CustomSelect
                        label="Gênero"
                        value={genero}
                        onChange={setGenero}
                        options={[
                        { value: "Macho", label: "Macho" },
                        { value: "Fêmea", label: "Fêmea" },
                        ]}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-[var(--color-secondary)] ml-1">Data de Nascimento (Aproximada)</label>
                    <input
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        required
                        className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-[var(--color-secondary)]"
                    />
                </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-[var(--color-secondary)] ml-1">URL da Foto (Opcional)</label>
                <input
                  type="url"
                  value={imagemUrl}
                  onChange={(e) => setImagemUrl(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-[var(--color-secondary)]"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* SEÇÃO 2: ALGORITMO DE MATCH */}
            <div className="flex flex-col gap-6 mt-4">
              <h3 className="text-lg font-black text-[var(--color-secondary)] border-b border-[var(--color-secondary)]/10 pb-2">
                Perfil Comportamental (Algoritmo)
              </h3>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-[var(--color-secondary)]">Nível de Energia</label>
                <SelectorBar 
                  value={energia} 
                  setter={setEnergia} 
                  labels={["Muito calmo", "Moderado", "Agitado/Atleta"]} 
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-[var(--color-secondary)]">Necessidade de Espaço</label>
                <SelectorBar 
                  value={espaco} 
                  setter={setEspaco} 
                  labels={["Ok em apartamento", "Precisa de quintal", "Sítio/Muito espaço"]} 
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-[var(--color-secondary)]">Sociabilidade (Outros pets/pessoas)</label>
                <SelectorBar 
                  value={sociabilidade} 
                  setter={setSociabilidade} 
                  labels={["Prefere ficar sozinho", "Tempo de adaptação", "Ama todos/Brincalhão"]} 
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-xl hover:bg-[var(--color-primary)]/90 transition-all shadow-md flex justify-center items-center disabled:opacity-70 text-lg"
            >
              {loading ? "Salvando no banco de dados..." : "Finalizar Cadastro"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}''