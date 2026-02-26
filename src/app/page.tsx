import Header from "@/components/Header";
import { MatchBanner } from "@/components/MatchBanner";
import { Events } from "@/components/Events";
import { AdoptionGrid } from "@/components/AdoptionGrid";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col pb-20 overflow-x-hidden">
      <Header />
      
      {/* O resto do conteúdo da tela vai entrar aqui */}
      <main className="flex-1 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-14 mt-4">
        
        <MatchBanner/>

        <Events />

        <AdoptionGrid />
      </main>
    </div>
  );
}