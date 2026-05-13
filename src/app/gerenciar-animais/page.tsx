'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Edit, Search } from 'lucide-react';
import { calcularIdade } from '@/utils/utils'; // Importando a função que criamos!

interface Animal {
  id: string;
  nome: string;
  especie: string;
  genero: string;
  data_nascimento: string;
  imagem_url: string;
}

export default function GerenciarAnimaisPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function carregarDados() {
      // 1. Verifica se é Admin
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return router.push('/');

      const { data: perfil } = await supabase
        .from('perfis')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      if (!perfil?.is_admin) return router.push('/');
      // 2. Busca todos os animais
      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .order('nome', { ascending: true }); // Traz em ordem alfabética
      if (!error && data) {
        setAnimais(data);
      }
      setLoading(false);
    }
    carregarDados();
  }, [router, supabase]);

  // Filtro de busca por nome
  const animaisFiltrados = animais.filter((animal) =>
    animal.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-(--color-background) pb-20">
      <div className="max-w-6xl mx-auto pt-10 px-6">
        {/* Cabeçalho e Botões */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-(--color-secondary)/60 hover:text-(--color-primary) font-bold mb-4 transition-colors"
            >
              <ArrowLeft size={20} /> Voltar ao Painel
            </Link>
            <h1 className="text-3xl font-black text-(--color-secondary)">
              Gerenciar Animais
            </h1>
            <p className="text-sm font-medium text-(--color-secondary)/60 mt-1">
              Selecione um animal para editar ou cadastre um novo.
            </p>
          </div>

          <Link
            href="/cadastro-animal"
            className="flex items-center gap-2 bg-(--color-primary) text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-(--color-primary)/90 transition-all hover:-translate-y-1"
          >
            <PlusCircle size={20} />
            Cadastrar Novo Animal
          </Link>
        </div>

        {/* Barra de Busca */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-(--color-secondary)/10 mb-8 flex items-center gap-3">
          <Search size={20} className="text-(--color-secondary)/40" />
          <input
            type="text"
            placeholder="Buscar pet pelo nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-(--color-secondary) font-medium"
          />
        </div>

        {/* Grid de Animais */}
        {loading ? (
          <div className="text-center py-10 text-(--color-secondary)/50 font-bold">
            Carregando animais...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {animaisFiltrados.map((animal) => (
              <Link
                href={`/gerenciar-animais/${animal.id}`}
                key={animal.id}
                className="bg-white border border-(--color-secondary)/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-(--color-primary)/50 transition-all group flex flex-col relative"
              >
                {/* Ícone de Editar que aparece no Hover */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 text-(--color-primary)">
                  <Edit size={18} />
                </div>

                <div className="h-48 w-full bg-gray-200 overflow-hidden">
                  {animal.imagem_url ? (
                    <img
                      src={animal.imagem_url}
                      alt={animal.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                      Sem Foto
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col gap-1">
                  <h4 className="text-xl font-extrabold text-(--color-secondary) group-hover:text-(--color-primary) transition-colors">
                    {animal.nome}
                  </h4>
                  <p className="text-sm font-medium text-(--color-secondary)/60">
                    {animal.especie} • {animal.genero} •{' '}
                    {calcularIdade(animal.data_nascimento)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
