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