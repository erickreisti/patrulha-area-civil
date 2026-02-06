import {
  RiDashboardLine,
  RiGroupLine,
  RiTimeLine,
  RiArticleLine,
  RiImageLine,
} from "react-icons/ri";

export const adminNavigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: RiDashboardLine,
  },
  {
    name: "Agentes",
    href: "/admin/agentes",
    icon: RiGroupLine,
  },
  {
    name: "Atividades",
    href: "/admin/atividades",
    icon: RiTimeLine,
  },
  {
    name: "Notícias",
    href: "/admin/noticias",
    icon: RiArticleLine,
  },
  {
    name: "Galeria",
    href: "/admin/galeria",
    icon: RiImageLine,
  },
];
