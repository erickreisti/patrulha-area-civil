"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaExclamationTriangle,
  FaPaperPlane,
} from "react-icons/fa";

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "",
    mensagem: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulário enviado:", formData);
    alert("Mensagem enviada com sucesso!");
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      assunto: "",
      mensagem: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: "Email",
      content: "contato@patrulhaaereacivil.org.br",
    },
    {
      icon: FaPhone,
      title: "Telefone",
      content: "(21) 99999-9999",
    },
    {
      icon: FaMapMarkerAlt,
      title: "Endereço",
      content: "Rio de Janeiro, Brasil",
    },
    {
      icon: FaClock,
      title: "Atendimento",
      content: "24 horas para emergências",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none text-sm py-2 px-4">
              <FaEnvelope className="w-4 h-4 mr-2" />
              Fale Conosco
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-bebas tracking-wide">
              ENTRE EM <span className="text-blue-400">CONTATO</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Estamos aqui para ajudar. Entre em contato conosco para mais
              informações sobre nossos serviços, parcerias ou emergências.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informações de Contato */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-gray-200 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                    INFORMAÇÕES DE CONTATO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300 border border-gray-200"
                    >
                      <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center">
                        <info.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {info.title}
                        </p>
                        <p className="text-gray-600 text-sm">{info.content}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Emergência */}
              <Card className="border-red-200 bg-red-50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-red-600 text-lg font-bebas tracking-wide flex items-center">
                    <FaExclamationTriangle className="w-5 h-5 mr-2" />
                    EMERGÊNCIA 24H
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Para situações de emergência que requerem ação imediata
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 transition-all duration-300 hover:scale-105 shadow-lg">
                    <FaPhone className="mr-2 h-4 w-4" />
                    Ligar para Emergência
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Formulário de Contato */}
            <div className="lg:col-span-2">
              <Card className="border-gray-200 shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="text-gray-800 text-xl font-bebas tracking-wide">
                    ENVIE UMA MENSAGEM
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Preencha o formulário abaixo e entraremos em contato o mais
                    breve possível
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="nome"
                          className="text-gray-800 font-medium"
                        >
                          Nome Completo *
                        </Label>
                        <Input
                          id="nome"
                          name="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          required
                          className="border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 py-3 px-4 rounded-lg transition-all duration-300"
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-gray-800 font-medium"
                        >
                          Email *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 py-3 px-4 rounded-lg transition-all duration-300"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="telefone"
                          className="text-gray-800 font-medium"
                        >
                          Telefone
                        </Label>
                        <Input
                          id="telefone"
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleChange}
                          className="border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 py-3 px-4 rounded-lg transition-all duration-300"
                          placeholder="(21) 99999-9999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="assunto"
                          className="text-gray-800 font-medium"
                        >
                          Assunto *
                        </Label>
                        <Input
                          id="assunto"
                          name="assunto"
                          value={formData.assunto}
                          onChange={handleChange}
                          required
                          className="border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 py-3 px-4 rounded-lg transition-all duration-300"
                          placeholder="Assunto da mensagem"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="mensagem"
                        className="text-gray-800 font-medium"
                      >
                        Mensagem *
                      </Label>
                      <Textarea
                        id="mensagem"
                        name="mensagem"
                        value={formData.mensagem}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 py-3 px-4 rounded-lg resize-none transition-all duration-300"
                        placeholder="Descreva sua mensagem aqui..."
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <FaPaperPlane className="mr-2 h-4 w-4" />
                      Enviar Mensagem
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa e Localização */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-bebas tracking-wide">
              NOSSA LOCALIZAÇÃO
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Estamos localizados no Rio de Janeiro, prontos para atender em
              toda a região
            </p>
          </div>

          <Card className="border-gray-200 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Mapa de Localização</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Rio de Janeiro, Brasil
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
