"use client";

import { useState, useEffect } from "react";
import { PawIcon } from "@/components/icons/PawIcon";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  X, 
  User, 
  CalendarHeart, 
  HandHeart, 
  CircleDollarSign, 
  Package, 
  LogOut 
} from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogado, setIsLogado] = useState(false);
  const [primeiroNome, setPrimeiroNome] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  // Busca o usuário logado assim que o Header aparece na tela
  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsLogado(true);
        // Pega o nome completo que salvamos no cadastro e corta no primeiro espaço
        const nomeCompleto = session.user.user_metadata?.nome || "Adotante";
        const nome = nomeCompleto.split(" ")[0]; 
        setPrimeiroNome(nome);
      }
    }

    getUser();

    // Isso faz o Header se atualizar automaticamente caso o usuário faça login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLogado(true);
        const nomeCompleto = session.user.user_metadata?.nome || "Adotante";
        setPrimeiroNome(nomeCompleto.split(" ")[0]);
      } else {
        setIsLogado(false);
        setPrimeiroNome("");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Função para deslogar do sistema
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/login"); // Manda de volta pra tela de login
  };

  return (
    <>
      {/* Barra Superior */}
      <header className="flex justify-end py-6 px-8 relative z-30">
        <button
          onClick={() => setIsOpen(true)}
          className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:scale-110 transition-all duration-200"
          aria-label="Abrir menu"
        >
          <PawIcon size={42} />
        </button>
      </header>

      {/* Fundo escuro desfocado quando o menu abre */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar (Menu Lateral) */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-[var(--color-background)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabeçalho do Sidebar */}
        <div className="flex justify-end p-6">
          <button 
            onClick={() => setIsOpen(false)}
            className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Conteúdo do Menu */}
        <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-8">
          
          {/* Perfil Condicional (Logado vs Visitante) */}
          {isLogado ? (
            <div className="flex flex-col items-center gap-3 pb-6 border-b border-[var(--color-secondary)]/10">
              <div className="w-20 h-20 bg-[var(--color-secondary)]/20 rounded-full flex items-center justify-center text-[var(--color-secondary)]">
                <User size={40} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-[var(--color-secondary)]">Olá, {primeiroNome}</h3>
                {/* Já deixei o link pronto para a página do Questionário! */}
                <Link href="/questionario" onClick={() => setIsOpen(false)} className="text-sm text-[var(--color-primary)] hover:underline mt-1 block">
                  Fazer teste de perfil
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 pb-6 border-b border-[var(--color-secondary)]/10">
              <div className="w-20 h-20 bg-[var(--color-secondary)]/10 rounded-full flex items-center justify-center text-[var(--color-secondary)]/40">
                <User size={40} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-[var(--color-secondary)]">Olá, Visitante</h3>
                <Link href="/login" onClick={() => setIsOpen(false)} className="text-sm font-bold text-[var(--color-primary)] hover:underline mt-1 block">
                  Faça login ou cadastre-se
                </Link>
              </div>
            </div>
          )}

          {/* Ações da ONG */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)]/50">Envolva-se</h4>
            <button className="flex items-center gap-3 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
              <CalendarHeart size={20} /> Agendar Visita
            </button>
            <button className="flex items-center gap-3 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
              <HandHeart size={20} /> Seja um Voluntário
            </button>
          </div>

          {/* Doações */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)]/50">Apoie a Causa</h4>
            <button className="flex items-center gap-3 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
              <CircleDollarSign size={20} /> Contribuição em Dinheiro
            </button>
            <button className="flex items-center gap-3 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
              <Package size={20} /> Doar Produtos/Ração
            </button>
          </div>
        </div>

        {/* Rodapé do Menu (Logout) - Só aparece se estiver logado! */}
        {isLogado && (
          <div className="p-6 border-t border-[var(--color-secondary)]/10">
            <button 
              onClick={handleLogout}
              className="group flex items-center gap-3 w-full p-3 rounded-2xl text-[var(--color-secondary)] hover:bg-[var(--color-primary)]/10 transition-colors"
            >
              <LogOut size={20} className="group-hover:text-[var(--color-primary)] transition-colors" /> 
              <span className="font-medium group-hover:text-[var(--color-primary)] transition-colors">Sair da conta</span>
            </button>
          </div>
        )}

      </div>
    </>
  );
}