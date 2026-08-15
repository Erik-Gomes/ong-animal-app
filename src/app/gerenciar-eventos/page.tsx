"use client";

import React, { useState, useEffect } from "react";
// Importe seu cliente Supabase quando for integrar com o banco
// import { createClient } from '@/utils/supabase/client';

interface Evento {
  id: string;
  titulo: string;
  data_hora: string;
  local: string;
  descricao: string;
}

export default function GerenciarEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    titulo: "",
    data_hora: "",
    local: "",
    descricao: "",
  });

  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Aqui você buscaria os eventos do Supabase no futuro
  useEffect(() => {
    // mock inicial para visualização
    setEventos([
      {
        id: "1",
        titulo: "Feira de Adoção - Praça Central",
        data_hora: "2026-08-20T10:00",
        local: "Praça Dom Pedro II, Centro",
        descricao: "Feira mensal com cães e gatos disponíveis para adoção responsável.",
      }
    ]);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editandoId) {
        // Lógica de UPDATE no Supabase
        setEventos(eventos.map(ev => ev.id === editandoId ? { ...formData, id: editandoId } : ev));
        setEditandoId(null);
      } else {
        // Lógica de INSERT no Supabase
        const novoEvento = { ...formData, id: Math.random().toString() };
        setEventos([...eventos, novoEvento]);
      }
      
      // Limpa o formulário
      setFormData({ titulo: "", data_hora: "", local: "", descricao: "" });
    } catch (error) {
      console.error("Erro ao salvar evento", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evento: Evento) => {
    setFormData({
      titulo: evento.titulo,
      data_hora: evento.data_hora,
      local: evento.local,
      descricao: evento.descricao
    });
    setEditandoId(evento.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      // Lógica de DELETE no Supabase
      setEventos(eventos.filter((ev) => ev.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Eventos</h1>
        </div>

        {/* Formulário de Cadastro/Edição */}
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
                <label className="text-sm font-medium text-gray-600 mb-1">Data e Hora</label>
                <input
                  type="datetime-local"
                  name="data_hora"
                  value={formData.data_hora}
                  onChange={handleChange}
                  required
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Local</label>
              <input
                type="text"
                name="local"
                value={formData.local}
                onChange={handleChange}
                required
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Endereço ou local"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Descrição</label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={3}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                placeholder="Detalhes do evento..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              {editandoId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(null);
                    setFormData({ titulo: "", data_hora: "", local: "", descricao: "" });
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition disabled:opacity-50"
              >
                {loading ? "Salvando..." : editandoId ? "Atualizar Evento" : "Salvar Evento"}
              </button>
            </div>
          </form>
        </section>

        {/* Lista de Eventos */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Eventos Cadastrados</h2>
          
          {eventos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum evento cadastrado ainda.</p>
          ) : (
            <div className="space-y-4">
              {eventos.map((evento) => (
                <div key={evento.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{evento.titulo}</h3>
                    <div className="text-sm text-gray-500 mt-1 flex flex-col md:flex-row md:space-x-4">
                      <span>📅 {new Date(evento.data_hora).toLocaleString('pt-BR')}</span>
                      <span>📍 {evento.local}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3 md:mt-0">
                    <button
                      onClick={() => handleEdit(evento)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(evento.id)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
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