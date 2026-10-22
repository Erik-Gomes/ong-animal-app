// Exemplo conceitual para src/app/api/match-retroativo/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calcularSimilaridadeCosseno } from '@/utils/utils'; // Sua função matemática

export async function POST(request: Request) {
  const { animalId, perfilAnimal } = await request.json();

  // Instancia o Supabase no backend
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // 1. Busca todos os adotantes que já responderam o questionário
  const { data: adotantes } = await supabase.from('respostas_questionario').select('*');

  if (!adotantes) return NextResponse.json({ success: true, matches: 0 });

  const novosMatches = [];

  // 2. Calcula a similaridade retroativa
  for (const adotante of adotantes) {
    const score = calcularSimilaridadeCosseno(perfilAnimal, adotante); // Sua função do TG
    
    // 3. Se a compatibilidade for alta (ex: maior que 75%), preparamos para salvar
    if (score >= 75) {
      novosMatches.push({
        id_usuario: adotante.id_usuario,
        id_animal: animalId,
        score: score,
        notificado: false
      });
    }
  }

  // 4. Salva os matches no banco
  if (novosMatches.length > 0) {
    await supabase.from('matches').insert(novosMatches);
    // (Opcional) Aqui você poderia disparar um envio de e-mail automático usando Resend/Nodemailer
  }

  return NextResponse.json({ success: true, totalMatches: novosMatches.length });
}