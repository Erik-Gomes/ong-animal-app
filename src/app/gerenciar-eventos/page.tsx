"use client";

import React, { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client';
import BackBttn from "@/components/BackBttn";
import { CustomSelect } from "@/components/ui/CustomSelect"; 

interface Evento {
  id: string;
  titulo: string;
  data_completa: string;
  local: string;
}

export default function GerenciarEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [isOutroLocal, setIsOutroLocal] = useState(false);

  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    titulo: "",
    data_completa: "",
    local: "",
  });

  const [editandoId, setEditandoId] = useState<string | null>(null);

  const opcoesLocal = [
    { value: "Canil da UPAR", label: "Canil da UPAR" },
    { value: "Praça Dom Pedro II", label: "Praça Dom Pedro II" },
    { value: "Quadra da ABID", label: "Quadra da ABID" },
    { value: "Outro", label: "Outro (digitar local...)" }
  ];

  const fetchEventosFuturos = async () => {
    setLoading(true);
    try {
      const hoje = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .gte('data_completa', hoje)
        .order('data_completa', { ascending: true });

      if (error) {
        console.error("Erro ao buscar eventos:", error);
        return;
      }

      if (data) {
        setEventos(data);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventosFuturos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (value: string) => {
    if (value === "Outro") {
      setIsOutroLocal(true);
      setFormData({ ...formData, local: "" });
    } else {
      setIsOutroLocal(false);
      setFormData({ ...formData, local: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      if (editandoId) {
        const { error } = await supabase
          .from('eventos')
          .update({
            titulo: formData.titulo,
            data_completa: formData.data_completa,
            local: formData.local,
          })
          .eq('id', editandoId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('eventos')
          .insert([{
            titulo: formData.titulo,
            data_completa: formData.data_completa,
            local: formData.local,
          }]);

        if (error) throw error;
      }
      
      setFormData({ titulo: "", data_completa: "", local: ""});
      setEditandoId(null);
      setIsOutroLocal(false);
      fetchEventosFuturos();
      
    } catch (error) {
      console.error("Erro ao salvar evento", error);
      alert("Ocorreu um erro ao salvar o evento.");
    } finally {
      setSalvando(false);
    }
  };

  const handleEdit = (evento: Evento) => {
    const locaisPadrao = ["Canil da UPAR", "Praça Dom Pedro II", "Quadra da ABID"];
    const isOutro = !locaisPadrao.includes(evento.local);

    setIsOutroLocal(isOutro);

    setFormData({
      titulo: evento.titulo,
      data_completa: evento.data_completa, 
      local: evento.local
    });
    setEditandoId(evento.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      try {
        const { error } = await supabase
          .from('eventos')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchEventosFuturos();
      } catch (error) {
        console.error("Erro ao excluir evento:", error);
        alert("Ocorreu um erro ao excluir o evento.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center space-x-4">
          <BackBttn />
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Eventos</h1>
        </div>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            {editandoId ? "Editar Evento" : "Novo Evento"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Título do Evento</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Ex: Feira de Adoção"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Data do Evento</label>
                <input
                  type="date"
                  name="data_completa"
                  value={formData.data_completa}
                  onChange={handleChange}
                  required
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col">
              {!isOutroLocal ? (
                <CustomSelect
                  label="Local do Evento"
                  value={formData.local}
                  onChange={handleLocationChange}
                  options={opcoesLocal}
                  placeholder="Selecione um local..."
                />
              ) : (
                <>
                  <label className="text-sm font-bold text-(--color-secondary) ml-1 mb-1">
                    Local do Evento
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="local"
                      value={formData.local}
                      onChange={handleChange}
                      required
                      className="p-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none flex-1"
                      placeholder="Digite o novo local"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsOutroLocal(false);
                        setFormData({ ...formData, local: "" });
                      }}
                      className="px-4 py-3 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition"
                    >
                      Voltar à lista
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              {editandoId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(null);
                    setFormData({ titulo: "", data_completa: "", local: ""});
                    setIsOutroLocal(false);
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={salvando}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition disabled:opacity-50"
              >
                {salvando ? "Salvando..." : editandoId ? "Atualizar Evento" : "Salvar Evento"}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Eventos Futuros</h2>
          
          {loading ? (
            <p className="text-gray-500 text-center py-4">Carregando...</p>
          ) : eventos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum evento futuro cadastrado.</p>
          ) : (
            <div className="space-y-4">
              {eventos.map((evento) => (
                <div key={evento.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition shadow-sm bg-white">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{evento.titulo}</h3>
                    <div className="text-sm text-gray-500 mt-1 flex flex-col md:flex-row md:space-x-4">
                      <span>📅 {evento.data_completa ? new Date(evento.data_completa).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}</span>
                      <span>📍 {evento.local}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-4 md:mt-0">
                    <button
                      onClick={() => handleEdit(evento)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg shadow-sm transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(evento.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg shadow-sm transition"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}