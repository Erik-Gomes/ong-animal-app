"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { PawPrint } from "lucide-react";
import { PawIcon } from "@/components/icons/PawIcon";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Usamos o nosso cliente configurado com App Frameworks!
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErro("Email ou senha incorretos.");
      setLoading(false);
    } else {
      // Deu certo! Redireciona para a tela inicial
      router.push("/");
      router.refresh(); // Força a página inicial a ver que estamos logados
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-[var(--color-secondary)]/10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[var(--color-primary)]/10 p-4 rounded-full mb-4 text-[var(--color-primary)]">
            <PawIcon size={40} />
          </div>
          <h1 className="text-3xl font-black text-[var(--color-secondary)]">Bem-vindo(a)</h1>
          <p className="text-sm font-medium text-[var(--color-secondary)]/60 text-center mt-2">
            Faça login e conheça mais sobre a UPAR.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {erro && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold text-center border border-red-100">
              {erro}
            </div>
          )}

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
              className="px-4 py-3 rounded-xl border border-[var(--color-secondary)]/20 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-[var(--color-secondary)]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-xl hover:bg-[var(--color-primary)]/90 transition-all shadow-md flex justify-center items-center disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}