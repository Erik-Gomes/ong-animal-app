"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { Save, CheckCircle2, AlertCircle, ImagePlus, X } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import BackBttn from "@/components/BackBttn";

export default function EditarAnimalPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const animalId = params.id as string;

  // Estados: Tabela 'animais'
  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("Cachorro");
  const [genero, setGenero] = useState("Macho");
  const [idade, setIdade] = useState(""); 
  const [dataNascimento, setDataNascimento] = useState("");
  const [microChip, setMicroChip] = useState("");
  const [enderecoResgate, setEnderecoResgate] = useState("");
  const [castrado, setCastrado] = useState("Não"); 
  const [condicaoChegada, setCondicaoChegada] = useState("");
  const [detalhamentoResgate, setDetalhamentoResgate] = useState("");

  // Estados: Tabela 'perfil_comportamental_pet' (Mapeados para int4)
  const [porte, setPorte] = useState("");
  const [idadePerfil, setIdadePerfil] = useState("");
  const [nivelEnergia, setNivelEnergia] = useState("");
  const [sociabilidadeCriancas, setSociabilidadeCriancas] = useState("");
  const [sociabilidadeAnimais, setSociabilidadeAnimais] = useState("");
  const [necessidadeEspaco, setNecessidadeEspaco] = useState("");
  const [independencia, setIndependencia] = useState("");

  // Estados: Imagens
  const [fotosExistentes, setFotosExistentes] = useState<string[]>([]); 
  const [novosArquivos, setNovosArquivos] = useState<File[]>([]); 
  const [previews, setPreviews] = useState<string[]>([]); 

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      if (!animalId) return;

      // 1. Busca os dados principais
      const { data: animalData, error: animalError } = await supabase
        .from("animais")
        .select("nome, especie, genero, idade, data_nascimento, micro_chip, endereco_resgate, castrado, condicao_chegada, detalhamento_resgate, fotos")
        .eq("id", animalId)
        .single();

      if (animalError || !animalData) {
        setErro("Animal não encontrado.");
        setLoading(false);
        return;
      }

      setNome(animalData.nome || "");
      setEspecie(animalData.especie || "Cachorro");
      setGenero(animalData.genero || "Macho");
      setIdade(animalData.idade || "");
      setDataNascimento(animalData.data_nascimento || "");
      setMicroChip(animalData.micro_chip || "");
      setEnderecoResgate(animalData.endereco_resgate || "");
      setCastrado(animalData.castrado ? "Sim" : "Não");
      setCondicaoChegada(animalData.condicao_chegada || "");
      setDetalhamentoResgate(animalData.detalhamento_resgate || "");
      setFotosExistentes(animalData.fotos || []);

      // 2. Busca o vetor comportamental completo
      const { data: perfilData } = await supabase
        .from("perfil_comportamental_pet")
        .select("porte, idade_perfil, nivel_energia, sociabilidade_criancas, sociabilidade_animais, necessidade_espaco, independencia")
        .eq("id_animal", animalId)
        .single();

      if (perfilData) {
        setPorte(perfilData.porte ? String(perfilData.porte) : "");
        setIdadePerfil(perfilData.idade_perfil ? String(perfilData.idade_perfil) : "");
        setNivelEnergia(perfilData.nivel_energia ? String(perfilData.nivel_energia) : "");
        setSociabilidadeCriancas(perfilData.sociabilidade_criancas ? String(perfilData.sociabilidade_criancas) : "");
        setSociabilidadeAnimais(perfilData.sociabilidade_animais ? String(perfilData.sociabilidade_animais) : "");
        setNecessidadeEspaco(perfilData.necessidade_espaco ? String(perfilData.necessidade_espaco) : "");
        setIndependencia(perfilData.independencia ? String(perfilData.independencia) : "");
      }

      setLoading(false);
    }
    carregarDados();
  }, [animalId, supabase]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    setNovosArquivos((prev) => [...prev, ...files]);
    const novasPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...novasPreviews]);
  };

  const removerFotoExistente = (urlParaRemover: string) => {
    setFotosExistentes(fotosExistentes.filter(url => url !== urlParaRemover));
  };

  const removerNovaFoto = (indexToRemove: number) => {
    setNovosArquivos(novosArquivos.filter((_, idx) => idx !== indexToRemove));
    setPreviews(previews.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");

    let urlsFinais = [...fotosExistentes];

    // Upload das fotos
    if (novosArquivos.length > 0) {
      for (const arquivo of novosArquivos) {
        const fileExt = arquivo.name.split('.').pop();
        const fileName = `${animalId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `animais/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("fotos-animais")
          .upload(filePath, arquivo);

        if (uploadError) {
          setErro("Falha ao fazer upload das imagens.");
          setSalvando(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("fotos-animais")
          .getPublicUrl(filePath);

        urlsFinais.push(publicUrlData.publicUrl);
      }
    }

    // Atualiza tabela principal
    const { error: animalUpdateError } = await supabase
      .from("animais")
      .update({
        nome,
        especie,
        genero,
        idade,
        data_nascimento: dataNascimento,
        micro_chip: microChip,
        endereco_resgate: enderecoResgate,
        castrado: castrado === "Sim",
        condicao_chegada: condicaoChegada,
        detalhamento_resgate: detalhamentoResgate,
        fotos: urlsFinais,
      })
      .eq("id", animalId);

    if (animalUpdateError) {
      setErro("Falha ao salvar as informações básicas.");
      setSalvando(false);
      return;
    }

    // Prepara o vetor para a tabela comportamental
    const dadosPerfil = {
      id_animal: animalId,
      porte: porte ? parseInt(porte) : null,
      idade_perfil: idadePerfil ? parseInt(idadePerfil) : null,
      nivel_energia: nivelEnergia ? parseInt(nivelEnergia) : null,
      sociabilidade_criancas: sociabilidadeCriancas ? parseInt(sociabilidadeCriancas) : null,
      sociabilidade_animais: sociabilidadeAnimais ? parseInt(sociabilidadeAnimais) : null,
      necessidade_espaco: necessidadeEspaco ? parseInt(necessidadeEspaco) : null,
      independencia: independencia ? parseInt(independencia) : null,
    };

    const { data: checkPerfil } = await supabase
      .from("perfil_comportamental_pet")
      .select("id")
      .eq("id_animal", animalId)
      .single();

    if (checkPerfil) {
      await supabase
        .from("perfil_comportamental_pet")
        .update(dadosPerfil)
        .eq("id_animal", animalId);
    } else {
      await supabase
        .from("perfil_comportamental_pet")
        .insert([dadosPerfil]);
    }

    setSucesso(true);
    setTimeout(() => {
      router.push("/gerenciar-animais");
    }, 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-(--color-secondary)">Carregando dados...</div>;

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <div className="flex flex-col items-center text-center p-8">
          <CheckCircle2 size={80} className="text-green-500 mb-6" />
          <h2 className="text-3xl font-black text-(--color-secondary)">Alterações Salvas!</h2>
          <p className="text-(--color-secondary)/60 mt-2 font-medium">Os dados do {nome} foram atualizados com sucesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-background) pb-20">
      <div className="max-w-4xl mx-auto pt-10 px-6">
        
        <div className="mb-8">
          <BackBttn />
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-(--color-secondary)/10">
          <h1 className="text-2xl font-black text-(--color-secondary) mb-6">Editando: {nome}</h1>

          <form onSubmit={handleSalvar} className="flex flex-col gap-6">
            {erro && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3"><AlertCircle size={20}/>{erro}</div>}

            {/* --- INFORMAÇÕES BÁSICAS --- */}
            <h3 className="text-lg font-bold text-(--color-secondary) border-b pb-2">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-(--color-secondary) ml-1">Nome do Pet</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-(--color-secondary) ml-1">Idade (Texto Descritivo)</label>
                <input type="text" value={idade} onChange={(e) => setIdade(e.target.value)} placeholder="Ex: 2 anos e meio" className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomSelect label="Espécie" value={especie} onChange={setEspecie} options={[{ value: "Cachorro", label: "Cachorro" }, { value: "Gato", label: "Gato" }]} />
              <CustomSelect label="Gênero" value={genero} onChange={setGenero} options={[{ value: "Macho", label: "Macho" }, { value: "Fêmea", label: "Fêmea" }]} />
              <CustomSelect label="Castrado" value={castrado} onChange={setCastrado} options={[{ value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }]} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-(--color-secondary) ml-1">Data de Nascimento</label>
                <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-(--color-secondary) ml-1">Microchip</label>
                <input type="text" value={microChip} onChange={(e) => setMicroChip(e.target.value)} placeholder="Código" className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none" />
              </div>
            </div>

            {/* --- VETOR COMPORTAMENTAL (Recomendação) --- */}
            <h3 className="text-lg font-bold text-(--color-secondary) border-b pb-2 mt-4">Vetor Comportamental (Recomendação)</h3>
            <p className="text-sm text-(--color-secondary)/60 -mt-3 mb-2">Respostas padronizadas para cálculo de similaridade com o adotante.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CustomSelect 
                label="Porte (Tamanho)" 
                value={porte} 
                onChange={setPorte} 
                options={[
                  { value: "1", label: "1 - Pequeno (Até 10kg)" }, 
                  { value: "2", label: "2 - Médio (11kg - 25kg)" }, 
                  { value: "3", label: "3 - Grande (+25kg)" }
                ]} 
              />
              <CustomSelect 
                label="Faixa Etária" 
                value={idadePerfil} 
                onChange={setIdadePerfil} 
                options={[
                  { value: "1", label: "1 - Filhote" }, 
                  { value: "2", label: "2 - Adulto" }, 
                  { value: "3", label: "3 - Idoso" }
                ]} 
              />
              <CustomSelect 
                label="Nível de Energia" 
                value={nivelEnergia} 
                onChange={setNivelEnergia} 
                options={[
                  { value: "1", label: "1 - Baixa (Caseiro)" }, 
                  { value: "2", label: "2 - Média (Passeios)" }, 
                  { value: "3", label: "3 - Alta (Atleta)" }
                ]} 
              />
              <CustomSelect 
                label="Com Crianças" 
                value={sociabilidadeCriancas} 
                onChange={setSociabilidadeCriancas} 
                options={[
                  { value: "1", label: "1 - Não tolera" }, 
                  { value: "2", label: "2 - Indiferente" }, 
                  { value: "3", label: "3 - Muito Sociável" }
                ]} 
              />
              <CustomSelect 
                label="Com Outros Animais" 
                value={sociabilidadeAnimais} 
                onChange={setSociabilidadeAnimais} 
                options={[
                  { value: "1", label: "1 - Reativo" }, 
                  { value: "2", label: "2 - Indiferente" }, 
                  { value: "3", label: "3 - Muito Sociável" }
                ]} 
              />
              <CustomSelect 
                label="Espaço Necessário" 
                value={necessidadeEspaco} 
                onChange={setNecessidadeEspaco} 
                options={[
                  { value: "1", label: "1 - Apartamento" }, 
                  { value: "2", label: "2 - Quintal Pequeno" }, 
                  { value: "3", label: "3 - Quintal Grande" }
                ]} 
              />
              <CustomSelect 
                label="Tempo Sozinho" 
                value={independencia} 
                onChange={setIndependencia} 
                options={[
                  { value: "1", label: "1 - Precisa de Companhia" }, 
                  { value: "2", label: "2 - Fica algumas horas" }, 
                  { value: "3", label: "3 - Independente (+8h)" }
                ]} 
              />
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
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {fotosExistentes.map((url, idx) => (
                  <div key={`existente-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border border-(--color-secondary)/10">
                    <img src={url} alt="Foto existente" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removerFotoExistente(url)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </div>
                ))}
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

            <button type="submit" disabled={salvando} className="mt-6 w-full bg-(--color-primary) text-white font-bold py-4 rounded-xl hover:bg-(--color-primary)/90 transition-all flex justify-center items-center gap-2">
              <Save size={20} />
              {salvando ? "Salvando informações..." : "Salvar Alterações"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}