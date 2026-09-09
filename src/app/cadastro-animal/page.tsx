"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2, AlertCircle, ImagePlus, X, PlusCircle } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { SelectorBar } from "@/components/ui/SelectorBar";
import BackBttn from "@/components/BackBttn";
import Link from "next/link";

export default function CadastroAnimalPage() {
  const router = useRouter();
  const supabase = createClient();

  // --- Estados: Tabela 'animais' ---
  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("Cachorro");
  const [genero, setGenero] = useState("Macho");
  const [idade, setIdade] = useState(""); 
  const [dataNascimento, setDataNascimento] = useState("");
  const [microChip, setMicroChip] = useState("");
  const [enderecoResgate, setEnderecoResgate] = useState("");
  const [castrado, setCastrado] = useState(false); 
  const [condicaoChegada, setCondicaoChegada] = useState("");
  const [detalhamentoResgate, setDetalhamentoResgate] = useState("");

  // --- Estados: Tabela 'perfil_comportamental_pet' (Mapeados para int4 numéricos) ---
  const [porte, setPorte] = useState<number>(2);
  const [idadePerfil, setIdadePerfil] = useState<number>(2);
  const [nivelEnergia, setNivelEnergia] = useState<number>(2);
  const [sociabilidadeCriancas, setSociabilidadeCriancas] = useState<number>(2);
  const [sociabilidadeAnimais, setSociabilidadeAnimais] = useState<number>(2);
  const [necessidadeEspaco, setNecessidadeEspaco] = useState<number>(2);
  const [independencia, setIndependencia] = useState<number>(2);

  // --- Estados: Imagens ---
  const [novosArquivos, setNovosArquivos] = useState<File[]>([]); 
  const [previews, setPreviews] = useState<string[]>([]); 

  // --- Estados: Controle ---
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Proteção da Rota: Só Admin pode acessar
  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();

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

  // --- Funções de Imagem ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    setNovosArquivos((prev) => [...prev, ...files]);
    const novasPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...novasPreviews]);
  };

  const removerNovaFoto = (indexToRemove: number) => {
    setNovosArquivos(novosArquivos.filter((_, idx) => idx !== indexToRemove));
    setPreviews(previews.filter((_, idx) => idx !== indexToRemove));
  };

  // --- Envio do Formulário ---
  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const urlsFinais: string[] = [];

    // 1. Upload das fotos
    if (novosArquivos.length > 0) {
      for (const arquivo of novosArquivos) {
        const fileExt = arquivo.name.split('.').pop();
        const fileName = `novo-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `animais/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("fotos-animais")
          .upload(filePath, arquivo);

        if (uploadError) {
          console.error("Erro no upload:", uploadError);
          setErro("Falha ao fazer upload das imagens.");
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("fotos-animais")
          .getPublicUrl(filePath);

        urlsFinais.push(publicUrlData.publicUrl);
      }
    }

    // 2. Salvar na tabela 'animais'
    const { data: animalCriado, error: animalError } = await supabase
      .from("animais")
      .insert([
        {
          nome,
          especie,
          genero,
          idade,
          data_nascimento: dataNascimento || null,
          micro_chip: microChip || null,
          endereco_resgate: enderecoResgate || null,
          castrado: castrado, // Já é booleano
          condicao_chegada: condicaoChegada || null,
          detalhamento_resgate: detalhamentoResgate || null,
          fotos: urlsFinais,
        }
      ])
      .select()
      .single();

    if (animalError || !animalCriado) {
      console.error("Erro ao criar animal:", animalError);
      setErro("Falha ao cadastrar as informações básicas do animal.");
      setLoading(false);
      return;
    }

    // 3. Salvar na tabela 'perfil_comportamental_pet' (Enviando números diretos)
    const dadosPerfil = {
      id_animal: animalCriado.id,
      porte: porte,
      idade_perfil: idadePerfil,
      nivel_energia: nivelEnergia,
      sociabilidade_criancas: sociabilidadeCriancas,
      sociabilidade_animais: sociabilidadeAnimais,
      necessidade_espaco: necessidadeEspaco,
      independencia: independencia,
    };

    const { error: perfilError } = await supabase
      .from("perfil_comportamental_pet")
      .insert([dadosPerfil]);

    if (perfilError) {
      console.error("Erro ao criar perfil:", perfilError);
      setErro("Animal criado, mas falhou ao salvar o perfil comportamental.");
      setLoading(false);
      return;
    }

    // Sucesso
    setSucesso(true);
    setTimeout(() => {
      router.push("/gerenciar-animais");
    }, 2000);
  };

  
  if (isAdmin === null) return null;

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <div className="flex flex-col items-center text-center p-8">
          <CheckCircle2 size={80} className="text-green-500 mb-6" />
          <h2 className="text-3xl font-black text-(--color-secondary)">Pet Cadastrado!</h2>
          <p className="text-(--color-secondary)/60 mt-2 font-medium">O algoritmo já está pronto para recomendar o {nome} aos adotantes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-background) pb-20">
      <div className="max-w-2xl mx-auto pt-10 px-6">
        
        <div className="mb-8">
          <BackBttn />
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-(--color-secondary)/10">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-(--color-secondary)/10">
            <div className="bg-(--color-primary)/10 p-4 rounded-2xl text-(--color-primary)">
              <PlusCircle size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-(--color-secondary)">Cadastrar Animal</h1>
              <p className="text-sm font-medium text-(--color-secondary)/60 mt-1">
                Adicione as informações físicas e comportamentais do novo pet.
              </p>
            </div>
          </div>

          <form onSubmit={handleCadastrar} className="flex flex-col gap-6">
            {erro && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3"><AlertCircle size={20}/>{erro}</div>}

            {/* --- INFORMAÇÕES BÁSICAS --- */}
            <h3 className="text-lg font-bold text-(--color-secondary) border-b pb-2">Informações Básicas</h3>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-(--color-secondary) ml-1">Nome do Pet</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) outline-none" />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-(--color-secondary) ml-1">Idade (Texto Descritivo)</label>
              <input type="text" value={idade} onChange={(e) => setIdade(e.target.value)} placeholder="Ex: 2 anos e meio" className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CustomSelect label="Espécie" value={especie} onChange={setEspecie} options={[{ value: "Cachorro", label: "Cachorro" }, { value: "Gato", label: "Gato" }]} />
              <CustomSelect label="Gênero" value={genero} onChange={setGenero} options={[{ value: "Macho", label: "Macho" }, { value: "Fêmea", label: "Fêmea" }]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-(--color-secondary) ml-1">Data de Nascimento</label>
                <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-(--color-secondary) ml-1">Microchip</label>
                <input type="text" value={microChip} onChange={(e) => setMicroChip(e.target.value)} placeholder="Código" className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none" />
              </div>
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

            {/* --- VETOR COMPORTAMENTAL (Recomendação) --- */}
            <h3 className="text-lg font-bold text-(--color-secondary) border-b pb-2 mt-4">Perfil Comportamental (Algoritmo)</h3>
            <p className="text-sm text-(--color-secondary)/60 -mt-3 mb-2">Responda pensando em quem seria o adotante ideal (match perfeito) para este pet.</p>
            
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                <label className="text-lg font-bold text-(--color-secondary)">
                  1. Qual é o porte deste animal?
                </label>
                <SelectorBar
                  value={porte}
                  setter={setPorte}
                  labels={['Pequeno', 'Médio', 'Grande']}
                />
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-lg font-bold text-(--color-secondary)">
                  2. Qual a faixa etária deste animal?
                </label>
                <SelectorBar
                  value={idadePerfil}
                  setter={setIdadePerfil}
                  labels={['Filhote', 'Adulto', 'Idoso']}
                />
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-lg font-bold text-(--color-secondary)">
                  3. Como é o nível de energia e agitação?
                </label>
                <SelectorBar
                  value={nivelEnergia}
                  setter={setNivelEnergia}
                  labels={['Rotina caseira', 'Passeios regulares', 'Alta (Atleta)']}
                />
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-lg font-bold text-(--color-secondary)">
                  4. O animal convive bem com crianças?
                </label>
                <SelectorBar
                  value={sociabilidadeCriancas}
                  setter={setSociabilidadeCriancas}
                  labels={['Não tolera', 'Indiferente / Às vezes', 'Sim, ama crianças']}
                />
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-lg font-bold text-(--color-secondary)">
                  5. O animal convive bem com outros pets?
                </label>
                <SelectorBar
                  value={sociabilidadeAnimais}
                  setter={setSociabilidadeAnimais}
                  labels={['Prefere ser único', 'Com adaptação', 'Sim, convivem bem']}
                />
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-lg font-bold text-(--color-secondary)">
                  6. Qual o espaço ideal para este animal?
                </label>
                <SelectorBar
                  value={necessidadeEspaco}
                  setter={setNecessidadeEspaco}
                  labels={['Apartamento / S. Quintal', 'Quintal pequeno', 'Quintal grande']}
                />
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-lg font-bold text-(--color-secondary)">
                  7. Como o animal lida em ficar sozinho em casa?
                </label>
                <SelectorBar
                  value={independencia}
                  setter={setIndependencia}
                  labels={['Precisa de companhia', 'Até 8 horas', 'Mais de 8 horas']}
                />
              </div>
            </div>

            {/* --- HISTÓRICO DE RESGATE --- */}
            <h3 className="text-lg font-bold text-(--color-secondary) border-b pb-2 mt-4">Histórico de Resgate</h3>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-(--color-secondary) ml-1">Endereço do Resgate</label>
              <input type="text" value={enderecoResgate} onChange={(e) => setEnderecoResgate(e.target.value)} className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-(--color-secondary) ml-1">Condição de Chegada</label>
              <input type="text" value={condicaoChegada} onChange={(e) => setCondicaoChegada(e.target.value)} className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-(--color-secondary) ml-1">Detalhamento do Resgate</label>
              <textarea value={detalhamentoResgate} onChange={(e) => setDetalhamentoResgate(e.target.value)} rows={3} className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none resize-none" />
            </div>

            {/* --- FOTOS --- */}
            <h3 className="text-lg font-bold text-(--color-secondary) border-b pb-2 mt-4">Galeria de Fotos</h3>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-(--color-secondary) ml-1">Fotos do Perfil (Para o Slider)</label>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {previews.map((url, idx) => (
                  <div key={`nova-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-dashed border-(--color-primary)">
                    <img src={url} alt="Nova foto" className="w-full h-full object-cover opacity-70" />
                    <button type="button" onClick={() => removerNovaFoto(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <label className="aspect-square rounded-xl border-2 border-dashed border-(--color-secondary)/30 flex flex-col items-center justify-center text-(--color-secondary)/50 cursor-pointer hover:bg-(--color-secondary)/5 hover:border-(--color-primary) transition-all">
                  <ImagePlus size={24} className="mb-2" />
                  <span className="text-xs font-bold">Adicionar</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="mt-6 w-full bg-(--color-primary) text-white font-bold py-4 rounded-xl hover:bg-(--color-primary)/90 transition-all flex justify-center items-center gap-2 text-lg">
              <Save size={20} />
              {loading ? "Salvando informações..." : "Finalizar Cadastro"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}