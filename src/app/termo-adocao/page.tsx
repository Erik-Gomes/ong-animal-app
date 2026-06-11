"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, FileText, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/BackBttn"; // Usando o botão que criamos!
import { CustomSelect } from "@/components/ui/CustomSelect";

export default function TermoAdocaoPage() {
  // --- 1. DADOS PESSOAIS ---
  const [rg, setRg] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [celular, setCelular] = useState("");
  const [endereco, setEndereco] = useState("");

  // --- 2. QUESTIONÁRIO DE RESPONSABILIDADE (Mapeando o PDF) ---
  const [respostas, setRespostas] = useState<Record<string, string>>({
    tipoResidencia: "Própria",
  });

  // Função auxiliar para atualizar as respostas dinâmicas
  const handleResposta = (chave: string, valor: string) => {
    setRespostas((prev) => ({ ...prev, [chave]: valor }));
  };

  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleAssinarTermo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Aqui no futuro você fará o INSERT na tabela "termos_adocao" no Supabase!
    // Simulando tempo de rede:
    setTimeout(() => {
      setLoading(false);
      setSucesso(true);
    }, 2000);
  };

  // --- COMPONENTE AUXILIAR PARA PERGUNTAS DE SIM/NÃO/CIENTE ---
  const PerguntaTermo = ({ 
    chave, 
    pergunta, 
    opcoes = ["Sim", "Não"], 
    extraLabel, 
    extraValue, 
    setExtraValue 
  }: { 
    chave: string, 
    pergunta: string, 
    opcoes?: string[],
    extraLabel?: string,
    extraValue?: string,
    setExtraValue?: (v: string) => void
  }) => (
    <div className="flex flex-col gap-3 p-4 bg-[var(--color-secondary)]/5 rounded-xl border border-[var(--color-secondary)]/10">
      <label className="text-sm font-bold text-[var(--color-secondary)] leading-relaxed">
        {pergunta}
      </label>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((opcao) => (
          <button
            key={opcao}
            type="button"
            onClick={() => handleResposta(chave, opcao)}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all border ${
              respostas[chave] === opcao
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md scale-105"
                : "bg-white text-[var(--color-secondary)]/70 border-[var(--color-secondary)]/20 hover:border-[var(--color-primary)]/50"
            }`}
          >
            {opcao}
          </button>
        ))}
      </div>
      
      {/* Campo de texto extra (ex: "Quantas crianças?" se marcar SIM) */}
      {extraLabel && respostas[chave] === "Sim" && setExtraValue && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-2">
          <input
            type="text"
            value={extraValue || ""}
            onChange={(e) => setExtraValue(e.target.value)}
            placeholder={extraLabel}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:outline-none focus:border-[var(--color-primary)] text-sm"
          />
        </div>
      )}
    </div>
  );

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center text-center p-8 max-w-md">
          <CheckCircle size={80} className="text-green-500 mb-6" />
          <h2 className="text-3xl font-black text-[var(--color-secondary)]">Termo Assinado!</h2>
          <p className="text-[var(--color-secondary)]/60 mt-2 font-medium">
            Sua solicitação de adoção foi registrada com validade jurídica. A UPAR entrará em contato em breve!
          </p>
          <Link href="/" className="mt-8 px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20">
      <div className="max-w-3xl mx-auto pt-10 px-6">
        <BackButton href="/" label="Voltar" className="mb-6" />

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-[var(--color-secondary)]/10">
          
          {/* CABEÇALHO DO DOCUMENTO JURÍDICO */}
          <div className="flex flex-col items-center text-center gap-2 mb-10 pb-8 border-b border-[var(--color-secondary)]/10">
            <FileText size={40} className="text-[var(--color-primary)] mb-2" />
            <h1 className="text-2xl md:text-3xl font-black text-[var(--color-secondary)] uppercase">
              Termo de Responsabilidade de Adoção
            </h1>
            <p className="text-sm font-bold text-[var(--color-secondary)]/60">
              UPAR - UNIÃO PROTETORA DOS ANIMAIS DE RUA<br/>
              CNPJ: 05.384.687/0001-20
            </p>
          </div>

          <form onSubmit={handleAssinarTermo} className="flex flex-col gap-10">
            
            {/* BLOCO 1: IDENTIFICAÇÃO DO ADOTANTE */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-black text-[var(--color-secondary)] flex items-center gap-2">
                <span className="bg-[var(--color-primary)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                Seus Dados Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="RG" value={rg} onChange={e => setRg(e.target.value)} required className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:border-[var(--color-primary)] outline-none" />
                <input type="text" placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} required className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:border-[var(--color-primary)] outline-none" />
              </div>
              <input type="text" placeholder="Endereço Completo" value={endereco} onChange={e => setEndereco(e.target.value)} required className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:border-[var(--color-primary)] outline-none" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Data Nasc. (DD/MM/AAAA)" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} required className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:border-[var(--color-primary)] outline-none" />
                <input type="text" placeholder="Telefone Fixo" value={telefone} onChange={e => setTelefone(e.target.value)} className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:border-[var(--color-primary)] outline-none" />
                <input type="text" placeholder="Celular / WhatsApp" value={celular} onChange={e => setCelular(e.target.value)} required className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:border-[var(--color-primary)] outline-none" />
              </div>
            </div>

            {/* BLOCO 2: MORADIA E FAMÍLIA */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-black text-[var(--color-secondary)] flex items-center gap-2">
                <span className="bg-[var(--color-primary)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                Moradia e Família
              </h3>

              <div className="p-4 bg-[var(--color-secondary)]/5 rounded-xl border border-[var(--color-secondary)]/10">
                <CustomSelect
                  label="A sua residência é própria ou alugada?"
                  value={respostas.tipoResidencia}
                  onChange={(val) => handleResposta("tipoResidencia", val)}
                  options={[{ value: "Própria", label: "Própria" }, { value: "Alugada", label: "Alugada" }]}
                />
              </div>

              {respostas.tipoResidencia === "Alugada" && (
                <PerguntaTermo 
                  chave="autorizacaoLocador" 
                  pergunta="O proprietário está ciente e autoriza a posse do animal, sem impedimentos ou apontamentos?" 
                />
              )}

              <PerguntaTermo chave="apartamentoTelado" pergunta="Caso more em apartamento, o mesmo é telado?" />
              <PerguntaTermo chave="mudanca" pergunta="Em caso de eventual mudança de residência, você se compromete na escolha de local onde possa levar o animal?" />
              
              {/* Exemplo de pergunta com campo extra, como no PDF */}
              <PerguntaTermo 
                chave="criancas" 
                pergunta="Tem crianças na residência?" 
                extraLabel="Quantas crianças existem na casa e qual a idade delas?"
                extraValue={respostas.detalhesCriancas}
                setExtraValue={(val) => handleResposta("detalhesCriancas", val)}
              />
              
              <PerguntaTermo chave="supervisaoCriancas" pergunta="Você está ciente de que o convívio entre crianças e animais necessita de supervisão de um adulto, paciência e respeito?" />
              
              <PerguntaTermo 
                chave="alergia" 
                pergunta="Alguém na sua casa é ou pode ser alérgico a cães ou gatos?" 
                extraLabel="Se sim, quais medidas serão tomadas?"
                extraValue={respostas.detalhesAlergia}
                setExtraValue={(val) => handleResposta("detalhesAlergia", val)}
              />
            </div>

            {/* BLOCO 3: RESPONSABILIDADES DO PET (O Coração do Termo) */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-black text-[var(--color-secondary)] flex items-center gap-2">
                <span className="bg-[var(--color-primary)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                Cuidados, Saúde e Guarda
              </h3>

              <PerguntaTermo 
                chave="financeiro" 
                pergunta="Você tem condições financeiras para assumir TODOS os custos veterinários (vacinas importadas, vermífugos, ração, cirurgias), estando ciente que a falta de assistência é considerada negligência e maus tratos?" 
              />
              <PerguntaTermo 
                chave="mausTratos" 
                pergunta="Está ciente que o animal NÃO poderá ser deixado sem abrigo (sol/chuva/frio), acorrentado, ou sem comida/água?" 
              />
              <PerguntaTermo 
                chave="passeios" 
                pergunta="Está ciente de que NÃO É PERMITIDO passear sem coleira ou deixá-los soltos na rua sozinhos?" 
              />
              <PerguntaTermo 
                chave="viagem" 
                pergunta="Em caso de viagem, está ciente que o animal não pode ficar sozinho e deverá contratar um cuidador ou hotelzinho?" 
              />

              <PerguntaTermo 
                chave="outrosAnimais" 
                pergunta="Tem animais na residência atualmente?" 
                extraLabel="Quantos, espécie e idade?"
                extraValue={respostas.detalhesAnimais}
                setExtraValue={(val) => handleResposta("detalhesAnimais", val)}
              />

              {respostas.outrosAnimais === "Sim" && (
                <div className="flex flex-col gap-4 pl-4 border-l-2 border-[var(--color-primary)]">
                  <PerguntaTermo chave="vacinasDia" pergunta="As carteirinhas de vacina deles estão completas? (Deverá mostrar na visita)" />
                  <div className="p-4 bg-[var(--color-secondary)]/5 rounded-xl">
                    <input type="text" placeholder="Qual o veterinário que acompanha seus animais atuais?" value={respostas.vetAtual || ""} onChange={e => handleResposta("vetAtual", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:border-[var(--color-primary)] outline-none text-sm" />
                  </div>
                </div>
              )}
            </div>

            {/* BLOCO 4: COMPROMISSOS COM A ONG (Castração e Visitas) */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-black text-[var(--color-secondary)] flex items-center gap-2">
                <span className="bg-[var(--color-primary)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
                Compromisso com a UPAR
              </h3>

              <PerguntaTermo 
                chave="visitas" 
                pergunta="Após a adoção, você está ciente de que poderá receber visitas em sua casa ou pedidos de fotos/vídeos do animal?" 
              />
              <PerguntaTermo 
                chave="doacao" 
                pergunta="Está ciente de que NÃO poderá doar o animal para outra pessoa sem antes comunicar a ONG para nova entrevista?" 
              />
              <PerguntaTermo 
                chave="atualizacaoCadastro" 
                pergunta="No caso de mudar de casa ou telefone, a ONG deverá ser informada para atualizar o cadastro?" 
                opcoes={["Estou Ciente", "Não estou Ciente"]}
              />
              <PerguntaTermo 
                chave="castracaoOng" 
                pergunta="Você se compromete em levar o animal para castrar na vaga gratuita oferecida pela ONG (CRA/Canil) quando for contatado?" 
              />
              <PerguntaTermo 
                chave="fugas" 
                pergunta="Você se compromete a deixar o animal SEGURO contra fugas e comunicar a ONG imediatamente caso isso ocorra?" 
                opcoes={["Estou Ciente", "Não estou Ciente"]}
              />
              <PerguntaTermo 
                chave="falecimento" 
                pergunta="Você se compromete a avisar a ONG quando o animal vier a falecer?" 
              />
              <PerguntaTermo 
                chave="devolucao" 
                pergunta="Está ciente que, em caso de devolução, você se compromete com os custos (alimentação, hospedagem) até que o animal encontre novo lar?" 
              />
            </div>

            {/* AVISO LEGAL E ASSINATURA FINAL */}
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col gap-4 mt-6">
              <div className="flex items-center gap-3 text-red-700 font-black text-lg">
                <ShieldAlert size={28} /> Declaração Final
              </div>
              <p className="text-red-900/80 text-sm font-medium leading-relaxed">
                Estou ciente que poderei receber a visita de um fiscal da UPAR e caso este constate maus tratos, o fiscal tomará as medidas legais cabíveis baseado na <strong>LEI FEDERAL 9605/98</strong> (Pena de reclusão de 2 a 5 anos)[cite: 68]. O animal escolhido pode viver mais de 15 anos e a adoção é um ato de grande responsabilidade[cite: 70].
              </p>
              
              <label className="flex items-center gap-3 bg-white p-4 rounded-xl border border-red-200 cursor-pointer hover:border-red-400 transition-colors mt-2 shadow-sm">
                <input type="checkbox" required className="w-6 h-6 accent-red-600" />
                <span className="text-sm font-bold text-red-900">
                  Assumo que todas as respostas fornecidas neste documento são verdadeiras.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] text-white font-bold py-5 rounded-2xl hover:bg-[var(--color-primary)]/90 transition-all shadow-lg flex justify-center items-center disabled:opacity-70 text-xl"
            >
              {loading ? "Registrando Termo..." : "Assinar Digitalmente e Confirmar"}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
}