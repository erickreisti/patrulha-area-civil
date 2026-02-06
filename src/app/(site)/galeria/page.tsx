import { GaleriaContent } from "./components/GaleriaContent";

export const metadata = {
  title: "Galeria - Patrulha Aérea Civil",
  description: "Acervo visual de operações e treinamentos da PAC.",
};

export default function GaleriaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <GaleriaContent />
    </div>
  );
}
