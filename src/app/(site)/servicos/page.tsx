"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";
import {
  RiTreeLine,
  RiMapPinLine,
  RiPlaneLine,
  RiShipLine,
  RiHeartLine,
  RiTeamLine,
  RiShieldCheckLine,
  RiFileTextLine,
  RiArrowRightLine,
  RiCloseLine,
  RiCheckDoubleLine,
} from "react-icons/ri";

import Link from "next/link";

// ============================================================================
// 1. DADOS UNIFICADOS (Resumo + Detalhes)
// ============================================================================

const SERVICES_DATA = [
  {
    id: "ambientais",
    icon: RiTreeLine,
    title: "Operações Ambientais",
    description: "Busca, resgate e salvamento em ambientes naturais.",
    detailsTitle: "Competências",
    details: [
      "Combate a Incêndios Florestais",
      "Resgate em Matas Fechadas",
      "Orientação com Bússola e GPS",
      "Ofidismo e Primeiros Socorros",
      "Sobrevivência na Selva",
      "Técnicas de Rappel",
    ],
  },
  {
    id: "terrestres",
    icon: RiMapPinLine,
    title: "Operações Terrestres",
    description:
      "Busca, resgate e salvamento em ambientes terrestres diversos.",
    detailsTitle: "Atuações",
    details: [
      "Busca e Salvamento Urbano",
      "Resgate em Áreas de Deslizamento",
      "Operações em Montanhas",
      "Apoio a Defesa Civil",
      "Logística de Emergência",
      "Operações Táticas",
    ],
  },
  {
    id: "aereas",
    icon: RiPlaneLine,
    title: "Operações Aéreas",
    description: "Operações de resgate envolvendo aeronaves.",
    detailsTitle: "Capacidades",
    details: [
      "Busca e Salvamento Aéreo",
      "Operações Helitransportadas",
      "Técnica de Fast Rope",
      "Embarque/Desembarque Tático",
      "Socorro Pré-Hospitalar Aéreo",
      "Combate a Incêndio Aéreo",
    ],
  },
  {
    id: "maritimas",
    icon: RiShipLine,
    title: "Operações Marítimas",
    description: "Busca, resgate e salvamento em ambientes aquáticos.",
    detailsTitle: "Especialidades",
    details: [
      "Salvamento Aquático",
      "Condução de Embarcações",
      "Mergulho de Resgate",
      "Recuperação Subaquática",
      "Primeiros Socorros (Afogamento)",
      "Operações Costeiras",
    ],
  },
  {
    id: "capelania",
    icon: RiHeartLine,
    title: "Capelania",
    description: "Assistência religiosa e apoio espiritual.",
    detailsTitle: "Serviços Prestados",
    details: [
      "Atendimento Leito a Leito",
      "Aconselhamento Familiar",
      "Apoio Psicológico",
      "Cultos e Celebrações",
      "Suporte a Pacientes Terminais",
      "Acolhimento Espiritual",
    ],
  },
  {
    id: "mirim",
    icon: RiTeamLine,
    title: "Patrulheiro Mirim",
    description: "Projeto educativo e disciplinar para jovens.",
    detailsTitle: "Atividades",
    details: [
      "Educação Cívica e Moral",
      "Hierarquia e Disciplina",
      "Primeiros Socorros Básicos",
      "Preservação Ambiental",
      "Atividades Esportivas",
      "Apoio Pedagógico",
    ],
  },
  {
    id: "folared",
    icon: RiShieldCheckLine,
    title: "FOLARED",
    description: "Federação Latino Americana de Resposta a Emergências.",
    detailsTitle: "Benefícios",
    details: [
      "Cooperação Internacional",
      "Intercâmbio de Experiências",
      "Padronização de Protocolos",
      "Treinamentos Conjuntos",
      "Ajuda Humanitária Mútua",
      "Certificação Regional",
    ],
  },
  {
    id: "legislacao",
    icon: RiFileTextLine,
    title: "Legislação",
    description: "Base legal e normativa que rege nossas operações.",
    detailsTitle: "Base Legal",
    details: [
      "Lei do Voluntariado",
      "Constituição Federal",
      "Normas da Defesa Civil",
      "Regulamento Interno PAC",
      "Código de Ética",
      "Portarias Ministeriais",
    ],
  },
];

// ============================================================================
// 2. COMPONENTE DO CARTÃO COM EFEITO FLIP
// ============================================================================

function ServiceFlipCard({ service }: { service: (typeof SERVICES_DATA)[0] }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const IconComponent = service.icon;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="h-[420px] w-full perspective-1000 group">
      <motion.div
        className="relative w-full h-full transition-all duration-700 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        {/* --- FRENTE DO CARTÃO --- */}
        <Card
          onClick={handleFlip}
          className="absolute inset-0 w-full h-full backface-hidden cursor-pointer border-slate-200 shadow-sm hover:shadow-xl hover:border-pac-primary/30 transition-all flex flex-col items-center justify-center text-center p-6 bg-white"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pac-primary/10 transition-colors duration-300">
            <IconComponent className="w-8 h-8 text-slate-500 group-hover:text-pac-primary transition-colors duration-300" />
          </div>

          <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-pac-primary transition-colors">
            {service.title}
          </h3>

          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {service.description}
          </p>

          <Button
            variant="outline"
            className="mt-auto border-pac-primary text-pac-primary hover:bg-pac-primary hover:text-white"
          >
            {/* ALTERAÇÃO 1: Texto alterado */}
            Clique no card <RiArrowRightLine className="ml-2 w-4 h-4" />
          </Button>
        </Card>

        {/* --- VERSO DO CARTÃO (GIRADO 180 GRAUS) --- */}
        <Card
          className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-xl overflow-hidden flex flex-col"
          style={{ transform: "rotateY(180deg)" }}
        >
          {/* Header do Verso */}
          <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20">
            <h4 className="font-bebas text-xl tracking-wide text-blue-200">
              {service.detailsTitle.toUpperCase()}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFlip();
              }}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <RiCloseLine className="w-6 h-6 text-white/70 hover:text-white" />
            </button>
          </div>

          {/* Conteúdo do Verso (Lista) */}
          {/* ALTERAÇÃO 2: Removido overflow-y-auto e custom-scrollbar, adicionado overflow-hidden */}
          <CardContent className="p-5 flex-grow overflow-hidden">
            <ul className="space-y-3">
              {service.details.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isFlipped ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="flex items-start text-sm text-slate-300"
                >
                  <RiCheckDoubleLine className="w-4 h-4 text-pac-primary mr-2 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>

          {/* Footer do Verso */}
          <div className="p-5 pt-0 mt-auto">
            <Button
              asChild
              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
            >
              <Link href="/contato">Solicitar Serviço</Link>
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ============================================================================
// 3. PÁGINA PRINCIPAL
// ============================================================================

export default function ServicosPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* CSS para garantir o efeito 3D */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>

      {/* HERO PRINCIPAL */}
      <section className="relative bg-white pt-32 pb-20 lg:pt-40 lg:pb-24 border-b border-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pac-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
              <span className="text-pac-primary font-bold uppercase tracking-[0.2em] text-xs sm:text-sm">
                Áreas de Atuação
              </span>
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-none">
              NOSSOS <span className="text-pac-primary">SERVIÇOS</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Conheça todos os serviços especializados oferecidos pela Patrulha
              Aérea Civil. Clique nos cartões para ver os detalhes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* GRID DE FLIP CARDS */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {SERVICES_DATA.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ServiceFlipCard service={service} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
