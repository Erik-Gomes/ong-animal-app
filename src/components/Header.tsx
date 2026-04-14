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
  LogOut,
  Settings,
  PlusCircle,
  Users,
  CalendarDays
} from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogado, setIsLogado] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [primeiroNome, setPrimeiroNome] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsLogado(true);
        const nomeCompleto = session.user.user_metadata?.nome || "Usuário";
        setPrimeiroNome(nomeCompleto.split(" ")[0]);

        // Consulta a tabela perfis para descobrir se é Admin
        const { data: perfil } = await supabase
          .from("perfis")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();

        if (perfil?.is_admin) {
          setIsAdmin(true);
        }
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsLogado(true);
        const nomeCompleto = session.user.user_metadata?.nome || "Usuário";
        setPrimeiroNome(nomeCompleto.split(" ")[0]);

        const { data: perfil } = await supabase
          .from("perfis")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
          
        setIsAdmin(!!perfil?.is_admin);
      } else {
        setIsLogado(false);
        setIsAdmin(false);
        setPrimeiroNome("");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/login"); 
  };

  return (
    <>
      <header className="flex justify-end py-6 px-8 relative z-30">
        <button
          onClick={() => setIsOpen(true)}
          className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:scale-110 transition-all duration-200"
          aria-label="Abrir menu"
        >
          <PawIcon size={42} />
        </button>
      </header>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-[var(--color-background)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-6">
          <button 
            onClick={() => setIsOpen(false)}
            className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-8">
          
          {/* PERFIL DO USUÁRIO */}
          {isLogado ? (
            <div className="flex flex-col items-center gap-3 pb-6 border-b border-[var(--color-secondary)]/10">
              <div className="w-20 h-20 bg-[var(--color-secondary)]/20 rounded-full flex items-center justify-center text-[var(--color-secondary)]">
                {isAdmin ? <Settings size={40} /> : <User size={40} />}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-[var(--color-secondary)]">Olá, {primeiroNome}</h3>
                
                {/* Texto muda se for Admin ou Adotante */}
                {isAdmin ? (
                  <span className="text-sm font-bold text-[var(--color-primary)] mt-1 block">
                    Painel de Controle ONG
                  </span>
                ) : (
                  <Link href="/questionario" onClick={() => setIsOpen(false)} className="text-sm text-[var(--color-primary)] mt-1 block">
                    Fazer teste de perfil
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 pb-6 border-b border-[var(--color-secondary)]/10">
              <div className="w-20 h-20 bg-[var(--color-secondary)]/10 rounded-full flex items-center justify-center text-[var(--color-secondary)]/40">
                <User size={40} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-[var(--color-secondary)]">Olá, Visitante</h3>
                <Link href="/login" onClick={() => setIsOpen(false)} className="text-sm font-bold text-[var(--color-primary)] mt-1 block hover:scale-110 transition-all duration-200">
                  Faça login ou cadastre-se
                </Link>
              </div>
            </div>
          )}

          {/* MENUS ESPECÍFICOS */}
          {isAdmin ? (
            // --- MENU DO ADMINISTRADOR ---
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)]/50">Gerenciamento</h4>
              <Link href="/cadastro-animal" className="mt-2 text-sm font-bold text-[var(--color-primary)]">
                <button className="flex items-center gap-3 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
                  <PlusCircle size={20} /> Cadastrar Animal
                </button>
              </Link>
              <button className="flex items-center gap-3 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
                <CalendarDays size={20} /> Gerenciar Eventos
              </button>
              <button className="flex items-center gap-3 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
                <Users size={20} /> Ver Adotantes
              </button>
            </div>
          ) : (
            // --- MENU DO ADOTANTE / VISITANTE ---
            <>
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)]/50">Envolva-se</h4>
                <button className="flex items-center gap-3 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
                  <CalendarHeart size={20} /> Agendar Visita
                </button>
                <button className="flex items-center gap-3 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
                  <HandHeart size={20} /> Seja um Voluntário
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)]/50">Apoie a Causa</h4>
                <button className="flex items-center gap-3 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
                  <CircleDollarSign size={20} /> Contribuição em Dinheiro
                </button>
                <button className="flex items-center gap-3 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
                  <Package size={20} /> Doar Produtos/Ração
                </button>
              </div>
            </>
          )}

        </div>

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