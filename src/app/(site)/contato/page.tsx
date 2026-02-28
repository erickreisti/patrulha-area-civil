"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  RiMailSendLine,
  RiWhatsappLine,
  RiTimeLine,
  RiInstagramLine,
  RiTwitterXLine,
  RiFacebookCircleLine,
  RiExternalLinkLine,
  RiArrowRightLine,
} from "react-icons/ri";
import Link from "next/link";

// --- DADOS DOS CANAIS ---
const CANAIS = [
  {
    icon: RiWhatsappLine,
    title: "WhatsApp",
    description: "(21) 98185-3463",
    sub: "Atendimento rápido",
    link: "https://wa.me/5521981853463",
    color: "text-emerald-600",
    bgHover: "group-hover:bg-emerald-600",
  },
  {
    icon: RiMailSendLine,
    title: "E-mail Oficial",
    description: "contato@pac.org.br",
    sub: "Dúvidas e parcerias",
    link: "mailto:contato@pac.org.br",
    color: "text-blue-600",
    bgHover: "group-hover:bg-blue-600",
  },
  {
    icon: RiTimeLine,
    title: "Horário de Atendimento",
    description: "08:00 às 18:00",
    sub: "Segunda a Sexta-feira",
    link: null,
    color: "text-slate-600",
    bgHover: "group-hover:bg-slate-800",
  },
];

// --- VARIANTES DE ANIMAÇÃO ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-white pt-32 pb-20 lg:pt-40 lg:pb-24 border-b border-slate-100 overflow-hidden">
        {/* Pattern Background Sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Elementos Decorativos (Blobs suaves) */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pac-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge Técnico */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
              <span className="text-pac-primary font-bold uppercase tracking-[0.2em] text-xs sm:text-sm">
                Fale Conosco
              </span>
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-none">
              NOSSOS <span className="text-pac-primary">CANAIS</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Nossa equipe está pronta para atender você. Escolha a melhor forma
              de contato ou faça-nos uma visita presencial em nossa base.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- CANAIS DE ATENDIMENTO (Grid Cards) --- */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">
              Como podemos ajudar?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Selecione o canal de sua preferência para um atendimento ágil.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {CANAIS.map((canal, index) => {
              const ContentWrapper = canal.link ? "a" : "div";
              const wrapperProps = canal.link
                ? {
                    href: canal.link,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }
                : {};

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="h-full"
                >
                  <ContentWrapper
                    {...wrapperProps}
                    className={`block h-full ${canal.link ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {/* Bordinha removida. Deixamos apenas o efeito sutil na borda inteira e sombra */}
                    <Card className="h-full border border-slate-200 hover:border-pac-primary/30 hover:shadow-lg transition-all duration-300 bg-white group relative overflow-hidden">
                      <CardHeader>
                        <div
                          className={`w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300 ${canal.bgHover}`}
                        >
                          <canal.icon
                            className={`w-6 h-6 transition-colors duration-300 ${canal.color} group-hover:text-white`}
                          />
                        </div>
                        <CardTitle className="text-xl font-black text-slate-800">
                          {canal.description}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {canal.title}
                        </p>
                        <CardDescription className="text-slate-500 font-medium">
                          {canal.sub}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </ContentWrapper>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* --- LOCALIZAÇÃO E REDES SOCIAIS --- */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Texto e Redes (Esquerda) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-[2px] bg-pac-primary" />
                <span className="text-pac-primary font-bold uppercase tracking-widest text-sm">
                  Onde Estamos
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight uppercase">
                NOSSA BASE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pac-primary to-blue-600">
                  OPERACIONAL
                </span>
              </h2>
              <div className="space-y-4 text-slate-600 text-lg leading-relaxed mb-10">
                <p>
                  <strong>Rio de Janeiro, RJ - Brasil</strong>
                </p>
                <p>
                  Nossa sede está localizada em ponto estratégico para rápida
                  mobilização. Lembramos que o atendimento presencial é
                  realizado{" "}
                  <strong>exclusivamente mediante agendamento prévio</strong>.
                </p>
              </div>

              {/* Redes Sociais */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">
                  Conecte-se Conosco
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    asChild
                    variant="outline"
                    className="border-2 border-slate-200 hover:border-pink-400 hover:text-pink-600 rounded-full font-bold h-12 px-6"
                  >
                    <a
                      href="https://instagram.com/suaconta"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <RiInstagramLine className="mr-2 w-5 h-5" /> Instagram
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-2 border-slate-200 hover:border-slate-900 hover:text-slate-900 rounded-full font-bold h-12 px-6"
                  >
                    <a
                      href="https://x.com/suaconta"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <RiTwitterXLine className="mr-2 w-5 h-5" /> X (Twitter)
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 rounded-full font-bold h-12 px-6"
                  >
                    <a
                      href="https://facebook.com/suaconta"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <RiFacebookCircleLine className="mr-2 w-5 h-5" /> Facebook
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Mapa (Direita) */}
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white h-[400px] lg:h-[500px] group bg-slate-100"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* O IFRAME CORRIGIDO PARA O FORMATO EMBED DO GOOGLE */}
              <iframe
                src="https://maps.google.com/maps?width=100%25&height=600&hl=pt-BR&q=Rio%20de%20Janeiro,%20RJ,%20Brasil&t=&z=12&ie=UTF8&iwloc=B&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[0.3] contrast-[1.05] group-hover:grayscale-0 transition-all duration-700"
              ></iframe>

              {/* Botão Flutuante sobre o mapa (Mantido com o seu link original) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm">
                <Button
                  asChild
                  className="w-full bg-slate-900 hover:bg-pac-primary text-white font-bold rounded-xl shadow-lg h-14 transition-all duration-300"
                >
                  <a
                    href="https://www.google.com/maps/place/R.+Itaua,+18+-+Campo+Grande,+Rio+de+Janeiro+-+RJ,+23040-250/@-22.9217421,-43.5409355,3a,75y,53.17h,81.16t/data=!3m7!1e1!3m5!1sqGsut9ZZxX_2zGabqcbmcg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D8.83515682313859%26panoid%3DqGsut9ZZxX_2zGabqcbmcg%26yaw%3D53.1747235064173!7i16384!8i8192!4m15!1m8!3m7!1s0x9be6c9f7865919:0x908ddd6fddccbf36!2sR.+Itaua,+18+-+Campo+Grande,+Rio+de+Janeiro+-+RJ,+23040-250!3b1!8m2!3d-22.921707!4d-43.5407264!16s%2Fg%2F11csg359w3!3m5!1s0x9be6c9f7865919:0x908ddd6fddccbf36!8m2!3d-22.921707!4d-43.5407264!16s%2Fg%2F11csg359w3?entry=ttu&g_ep=EgoyMDI2MDIyNS4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <RiExternalLinkLine className="mr-2 w-5 h-5" /> Abrir no
                    Google Maps
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        {/* Blob Decorativo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pac-primary/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 uppercase">
              Quer fazer parte?
            </h2>
            <p className="text-slate-300 mb-10 text-lg">
              Conheça nossa história, nossos valores e descubra como você pode
              contribuir com a Patrulha Aérea Civil.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-pac-primary hover:bg-pac-primary-dark text-white font-bold rounded-full px-10 h-14 shadow-lg hover:-translate-y-1 transition-all"
            >
              <Link href="/sobre">
                Conheça a Nossa História{" "}
                <RiArrowRightLine className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
