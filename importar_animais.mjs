import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';

// Substitua pelas suas chaves (pegue no painel do Supabase > Project Settings > API)
// USE A SERVICE ROLE KEY para ter permissão de ignorar as políticas (RLS) na importação
const SUPABASE_URL = '';
const SUPABASE_KEY = ''; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const resultados = [];

// Função para limpar o nome (remove o "[ID: 12345] " do início)
const limparNome = (nomeBruto) => {
  if (!nomeBruto) return '';
  return nomeBruto.replace(/\[ID: \d+\]\s*/g, '').trim();
};

// Função para converter Espécie
const mapearEspecie = (especieBruta) => {
  if (especieBruta?.toLowerCase().includes('canina')) return 'Cachorro';
  if (especieBruta?.toLowerCase().includes('felina')) return 'Gato';
  return 'Cachorro'; // Default
};

// Função para converter Porte
const mapearPorte = (porteBruto) => {
  const p = porteBruto?.toUpperCase().trim();
  if (p === 'P') return 1;
  if (p === 'M') return 2;
  if (p === 'G') return 3;
  return null;
};

console.log('Lendo arquivo animais.csv...');

fs.createReadStream('animais.csv')
  .pipe(csv())
  .on('data', (data) => resultados.push(data))
  .on('end', async () => {
    console.log(`Foram encontrados ${resultados.length} animais na planilha. Iniciando migração...`);

    let sucesso = 0;
    let erro = 0;

    for (const linha of resultados) {
      // Pula linhas vazias
      if (!linha['Nome_Animal']) continue;

      const nomeLimpo = limparNome(linha['Nome_Animal']);
      
      const animalPayload = {
        nome: nomeLimpo,
        especie: mapearEspecie(linha['Espécie']),
        genero: linha['Sexo Animal'] === 'Fêmea' ? 'Fêmea' : 'Macho',
        idade: linha['Idade Animal'] || '',
        //raca: linha['Raça'] || 'SRD',
        castrado: linha['Castrado']?.trim().toLowerCase() === 'sim',
        // Outros campos ficam em branco/null até serem editados no sistema
      };

      try {
        // 1. Insere o Animal
        const { data: novoAnimal, error: erroAnimal } = await supabase
          .from('animais')
          .insert([animalPayload])
          .select()
          .single();

        if (erroAnimal) throw erroAnimal;

        // 2. Insere o Perfil Comportamental (com o Porte)
        const porteConvertido = mapearPorte(linha['Porte']);
        
        const perfilPayload = {
          id_animal: novoAnimal.id,
          porte: porteConvertido,
          // Os outros campos comportamentais iniciarão como null e a ONG preenche depois
        };

        const { error: erroPerfil } = await supabase
          .from('perfil_comportamental_pet')
          .insert([perfilPayload]);

        if (erroPerfil) throw erroPerfil;

        sucesso++;
        console.log(`✅ [${sucesso}] ${nomeLimpo} migrado com sucesso!`);

      } catch (e) {
        erro++;
        console.error(`❌ Erro ao migrar ${nomeLimpo}:`, e.message);
      }
    }

    console.log('--- RESUMO DA MIGRAÇÃO ---');
    console.log(`Animais migrados: ${sucesso}`);
    console.log(`Falhas: ${erro}`);
  });