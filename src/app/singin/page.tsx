"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { PawPrint, UserPlus } from "lucide-react";
import Link from "next/link";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const supabase = createClient();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    // 1. Cria o usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: nome, // Salva o nome junto com o usuário
        }
      }
    });

    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Insere o usuário na nossa tabela 'perfis' como Adotante (is_admin = false)
      const { error: perfilError } = await supabase
        .from('perfis')
        .insert([
          { 
            id: data.user.id, 
            is_admin: false 
          }
        ]);

      if (perfilError) {
        console.error("Erro ao criar perfil:", perfilError);
        // Mesmo com erro no perfil, o Auth foi criado, então vamos seguir
      }

      setSucesso(true);
      setLoading(false);
      
      // Redireciona para o login após 2 segundos
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-[var(--color-secondary)]/10">
        
        {sucesso ? (
          <div className="flex flex-col items-center text-center py-10">
            <div className="bg-green-100 p-4 rounded-full mb-4 text-green-600">
              <UserPlus size={40} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Conta Criada!</h2>
            <p className="text-[var(--color-secondary)]/60 mt-2">
              Você já pode adotar seu novo melhor amigo. Redirecionando para o login...
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="bg-[var(--color-primary)]/10 p-4 rounded-full mb-4 text-[var(--color-primary)]">
                <PawPrint size={40} />
              </div>
              <h1 className="text-3xl font-black text-[var(--color-secondary)]">Criar Conta</h1>
              <p className="text-sm font-medium text-[var(--color-secondary)]/60 text-center mt-2">
                Junte-se a nós e encontre o seu pet ideal.
              </p>
            </div>

            <form onSubmit={handleCadastro} className="flex flex-col gap-4">
              {erro && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold text-center border border-red-100">
                  {erro}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-[var(--color-secondary)] ml-1">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-[var(--color-secondary)]"
                  placeholder="Seu nome"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-[var(--color-secondary)] ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-[var(--color-secondary)]"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-[var(--color-secondary)] ml-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-[var(--color-secondary)]"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-xl hover:bg-[var(--color-primary)]/90 transition-all shadow-md flex justify-center items-center disabled:opacity-70"
              >
                {loading ? "Criando conta..." : "Cadastrar"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm font-medium text-[var(--color-secondary)]/60">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-[var(--color-primary)] font-bold">
                Faça login aqui
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}