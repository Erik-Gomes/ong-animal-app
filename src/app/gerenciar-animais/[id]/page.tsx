"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

export default function EditarAnimalPage() {
  const params = useParams(); // Pega o ID da URL!
  const router = useRouter();
  const supabase = createClient();
  const animalId = params.id as string;

  // Estados dos inputs
  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("Cachorro");
  const [genero, setGenero] = useState("Macho");
  const [dataNascimento, setDataNascimento] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  // Carrega os dados atuais do animal quando a tela abre
  useEffect(() => {
    async function carregarAnimal() {
      if (!animalId) return;

      const { data, error } = await supabase
        .from("animais")
        .select("*")
        .eq("id", animalId)
        .single();

      if (error || !data) {
        setErro("Animal não encontrado.");
        setLoading(false);
        return;
      }

      setNome(data.nome);
      setEspecie(data.especie);
      setGenero(data.genero);
      setDataNascimento(data.data_nascimento || "");
      setImagemUrl(data.imagem_url || "");
      
      // Lendo do JSONB do histórico médico
      if (data.historico_medico && data.historico_medico.anotacoes_gerais) {
        setObservacoes(data.historico_medico.anotacoes_gerais);
      }

      setLoading(false);
    }
    carregarAnimal();
  }, [animalId, supabase]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");

    const { error } = await supabase
      .from("animais")
      .update({
        nome,
        especie,
        genero,
        data_nascimento: dataNascimento,
        imagem_url: imagemUrl || null,
        historico_medico: { anotacoes_gerais: observacoes, atualizado_em: new Date().toISOString() }
      })
      .eq("id", animalId);

    if (error) {
      console.error("Erro ao atualizar:", error);
      setErro("Falha ao salvar as alterações.");
      setSalvando(false);
      return;
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
      <div className="max-w-2xl mx-auto pt-10 px-6">
        <Link href="/gerenciar-animais" className="inline-flex items-center gap-2 text-(--color-secondary)/60 hover:text-(--color-primary) font-bold mb-8 transition-colors">
          <ArrowLeft size={20} /> Voltar para a lista
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-(--color-secondary)/10">
          <h1 className="text-2xl font-black text-(--color-secondary) mb-6">Editando: {nome}</h1>

          <form onSubmit={handleSalvar} className="flex flex-col gap-6">
            {erro && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3"><AlertCircle size={20}/>{erro}</div>}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-(--color-secondary) ml-1">Nome do Pet</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CustomSelect label="Espécie" value={especie} onChange={setEspecie} options={[{ value: "Cachorro", label: "Cachorro" }, { value: "Gato", label: "Gato" }]} />
              <CustomSelect label="Gênero" value={genero} onChange={setGenero} options={[{ value: "Macho", label: "Macho" }, { value: "Fêmea", label: "Fêmea" }]} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-(--color-secondary) ml-1">Data de Nascimento (Aproximada)</label>
              <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-(--color-secondary) ml-1">URL da Foto</label>
              <input type="url" value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-(--color-secondary) ml-1">Observações (JSONB)</label>
              <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className="px-4 py-3 rounded-xl border border-(--color-secondary)/20 focus:border-(--color-primary) outline-none resize-none" />
            </div>

            <button type="submit" disabled={salvando} className="mt-4 w-full bg-(--color-primary) text-white font-bold py-4 rounded-xl hover:bg-(--color-primary)/90 transition-all flex justify-center items-center gap-2">
              <Save size={20} />
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}