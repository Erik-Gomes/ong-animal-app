import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* O resto do conteúdo da tela vai entrar aqui */}
      <main className="flex-1 px-8">
        {/* Espaço reservado para o Banner e os Eventos */}
      </main>
    </div>
  );
}