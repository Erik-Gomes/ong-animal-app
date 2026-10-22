export function calcularIdade(dataNascimento: string | null): string {
  if (!dataNascimento) return "Idade desconhecida";
  
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  let meses = hoje.getMonth() - nascimento.getMonth();

  // Ajusta se o mês atual for anterior ao mês de nascimento
  // ou se for o mesmo mês, mas o dia atual for anterior ao dia do nascimento
  if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) {
    anos--;
    meses += 12;
  }

  if (anos > 0) {
    return anos === 1 ? "1 ano" : `${anos} anos`;
  } else if (meses > 0) {
    return meses === 1 ? "1 mês" : `${meses} meses`;
  } else {
    return "Menos de 1 mês";
  }
}

export interface PerfilAnimal {
  porte?: number | string | null;
  idade_perfil?: number | string | null;
  nivel_energia?: number | string | null;
  sociabilidade_crianca?: number | string | null;
  sociabilidade_animais?: number | string | null;
  necessidade_espaco?: number | string | null;
  independencia?: number | string | null;
  [key: string]: unknown; // Permite outras propriedades adicionais do banco
}

// Define a estrutura esperada para o perfil do adotante
export interface PerfilAdotante {
  porte_escolhido?: number | string | null;
  faixa_etaria?: number | string | null;
  disposicao_passeios?: number | string | null;
  sociabilidade_crianca?: number | string | null;
  sociabilidade_animais?: number | string | null;
  tamanho_residencia?: number | string | null;
  tempo_sozinho?: number | string | null;
  [key: string]: unknown; // Permite outras propriedades adicionais do banco
}

export function calcularSimilaridadeCosseno(perfilAnimal: PerfilAnimal, perfilAdotante: PerfilAdotante): number {
  if (!perfilAnimal || !perfilAdotante) return 0;
  // 1. Monta o vetor do Animal 
  const vetorA = [
    Number(perfilAnimal.porte),
    Number(perfilAnimal.idade_perfil),
    Number(perfilAnimal.nivel_energia),
    Number(perfilAnimal.sociabilidade_crianca),
    Number(perfilAnimal.sociabilidade_animais),
    Number(perfilAnimal.necessidade_espaco),
    Number(perfilAnimal.independencia)
  ];

  // 2. Monta o vetor do Adotante mapeando as colunas equivalentes da tabela respostas_questionario
  const vetorB = [
    Number(perfilAdotante.porte_escolhido),
    Number(perfilAdotante.faixa_etaria),
    Number(perfilAdotante.disposicao_passeios),
    Number(perfilAdotante.sociabilidade_crianca),
    Number(perfilAdotante.sociabilidade_animais),
    Number(perfilAdotante.tamanho_residencia),
    Number(perfilAdotante.tempo_sozinho)
  ];

  // 3. Aplica a fórmula matemática da Similaridade de Cosseno
  let produtoEscalar = 0;
  let normaA = 0;
  let normaB = 0;

  for (let i = 0; i < vetorA.length; i++) {
    produtoEscalar += vetorA[i] * vetorB[i];
    normaA += vetorA[i] * vetorA[i];
    normaB += vetorB[i] * vetorB[i];
  }

  if (normaA === 0 || normaB === 0) return 0; // Evita divisão por zero

  const cosseno = produtoEscalar / (Math.sqrt(normaA) * Math.sqrt(normaB));
  
  // 4. Converte o resultado (que vai de -1 a 1) para uma escala de 0 a 100%
  const porcentagem = Math.round(cosseno * 100);
  
  // Limita o retorno entre 0 e 100 por segurança
  return Math.min(Math.max(porcentagem, 0), 100);
}