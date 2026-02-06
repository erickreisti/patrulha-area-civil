"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  RiMailSendLine,
  RiPhoneLine,
  RiMapPinLine,
  RiTimeLine,
  RiAlertLine,
  RiSendPlaneFill,
  RiCustomerService2Line,
  RiWhatsappLine,
  RiMap2Line,
} from "react-icons/ri";

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "",
    mensagem: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulação de envio
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Formulário enviado:", formData);
    alert("Mensagem enviada com sucesso! Entraremos em contato em breve.");

    setFormData({
      nome: "",
      email: "",
      telefone: "",
      assunto: "",
      mensagem: "",
    });
    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactInfo = [
    {
      icon: RiMailSendLine,
      title: "Email Oficial",
      content: "contato@patrulhaaereacivil.org.br",
      action: "mailto:contato@patrulhaaereacivil.org.br",
    },
    {
      icon: RiPhoneLine,
      title: "Telefone",
      content: "(21) 99999-9999",
      action: "tel:+5521999999999",
    },
    {
      icon: RiMapPinLine,
      title: "Base Operacional",
      content: "Rio de Janeiro, RJ - Brasil",
      action: "#mapa",
    },
    {
      icon: RiTimeLine,
      title: "Horário de Atendimento",
      content: "Seg a Sex: 08h às 18h",
      action: null,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-white pt-32 pb-20 lg:pt-40 lg:pb-24 border-b border-slate-100 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pac-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
              <span className="text-pac-primary font-bold uppercase tracking-[0.2em] text-xs sm:text-sm flex items-center gap-2">
                <RiCustomerService2Line className="w-4 h-4" />
                Canais de Atendimento
              </span>
              <div className="w-8 sm:w-12 h-[2px] bg-pac-primary/20" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-none">
              ENTRE EM <span className="text-pac-primary">CONTATO</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Estamos prontos para atender você. Utilize o formulário abaixo ou
              nossos canais oficiais para dúvidas, parcerias ou emergências.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* COLUNA DA ESQUERDA: Informações */}
            <div className="lg:col-span-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      <RiMapPinLine className="text-pac-primary" />
                      Informações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {contactInfo.map((info, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="bg-pac-primary/10 rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover:bg-pac-primary transition-colors duration-300">
                            <info.icon className="h-5 w-5 text-pac-primary group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                              {info.title}
                            </p>
                            {info.action ? (
                              <a
                                href={info.action}
                                className="text-slate-700 font-medium hover:text-pac-primary transition-colors text-sm"
                              >
                                {info.content}
                              </a>
                            ) : (
                              <p className="text-slate-700 font-medium text-sm">
                                {info.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card de Emergência */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-red-100 bg-red-50/50 shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <RiAlertLine className="w-24 h-24 text-red-600" />
                  </div>

                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-red-700 text-lg font-black uppercase tracking-tight flex items-center gap-2">
                      <RiAlertLine className="w-5 h-5" />
                      Plantão 24h
                    </CardTitle>
                    <CardDescription className="text-red-600/80 text-xs font-medium">
                      Exclusivo para situações de emergência e desastres.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-4">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 shadow-md shadow-red-200 rounded-xl">
                      <RiPhoneLine className="mr-2 h-5 w-5" />
                      Ligar Agora
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* COLUNA DA DIREITA: Formulário */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border border-slate-200 shadow-lg bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-pac-primary/10 flex items-center justify-center">
                      <RiMailSendLine className="text-pac-primary w-5 h-5" />
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                      Envie uma Mensagem
                    </CardTitle>
                  </div>
                  <CardDescription className="text-slate-500 text-base ml-13 pl-13">
                    Preencha os campos abaixo para entrar em contato com nossa
                    equipe administrativa.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="nome"
                          className="text-slate-700 font-bold text-xs uppercase tracking-wide"
                        >
                          Nome Completo <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="nome"
                          name="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          required
                          className="h-12 border-slate-200 bg-slate-50 focus:bg-white focus:border-pac-primary focus:ring-pac-primary/20 rounded-xl transition-all"
                          placeholder="Digite seu nome"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-slate-700 font-bold text-xs uppercase tracking-wide"
                        >
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="h-12 border-slate-200 bg-slate-50 focus:bg-white focus:border-pac-primary focus:ring-pac-primary/20 rounded-xl transition-all"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="telefone"
                          className="text-slate-700 font-bold text-xs uppercase tracking-wide"
                        >
                          Telefone / WhatsApp
                        </Label>
                        <div className="relative">
                          <RiWhatsappLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="telefone"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleChange}
                            className="pl-10 h-12 border-slate-200 bg-slate-50 focus:bg-white focus:border-pac-primary focus:ring-pac-primary/20 rounded-xl transition-all"
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="assunto"
                          className="text-slate-700 font-bold text-xs uppercase tracking-wide"
                        >
                          Assunto <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="assunto"
                          name="assunto"
                          value={formData.assunto}
                          onChange={handleChange}
                          required
                          className="h-12 border-slate-200 bg-slate-50 focus:bg-white focus:border-pac-primary focus:ring-pac-primary/20 rounded-xl transition-all"
                          placeholder="Sobre o que deseja falar?"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="mensagem"
                        className="text-slate-700 font-bold text-xs uppercase tracking-wide"
                      >
                        Mensagem <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="mensagem"
                        name="mensagem"
                        value={formData.mensagem}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="border-slate-200 bg-slate-50 focus:bg-white focus:border-pac-primary focus:ring-pac-primary/20 rounded-xl resize-none transition-all p-4"
                        placeholder="Descreva detalhadamente sua solicitação..."
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto md:min-w-[200px] bg-pac-primary hover:bg-pac-primary-dark text-white font-bold h-12 rounded-xl shadow-lg shadow-pac-primary/25 transition-all hover:-translate-y-1"
                      >
                        {isSubmitting ? (
                          "Enviando..."
                        ) : (
                          <>
                            <RiSendPlaneFill className="mr-2 h-5 w-5" />
                            Enviar Mensagem
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- MAPA E LOCALIZAÇÃO --- */}
      <section className="py-16 bg-white border-t border-slate-100" id="mapa">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 border-pac-primary/30 text-pac-primary bg-pac-primary/5 uppercase tracking-widest text-[10px] font-bold px-3 py-1"
            >
              Onde Estamos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">
              Nossa Localização
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Sede Operacional no Rio de Janeiro.
            </p>
          </div>

          {/* Card do Mapa (Com Background CSS para evitar 404) */}
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 h-[400px] relative bg-slate-50 group">
            {/* Background Grid via CSS */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-100/80 to-transparent" />

            {/* Ícone de Mapa Decorativo Gigante */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <RiMap2Line className="w-96 h-96" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-center border border-white transform transition-transform group-hover:scale-105 relative z-10">
                <div className="w-16 h-16 bg-pac-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pac-primary/30">
                  <RiMapPinLine className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">
                  Rio de Janeiro
                </h3>
                <p className="text-slate-500 text-sm">Brasil</p>
                <Button
                  variant="link"
                  className="text-pac-primary font-bold mt-2 h-auto p-0 hover:text-pac-primary-dark"
                >
                  Ver no Google Maps
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
