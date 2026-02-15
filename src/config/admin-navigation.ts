import {
  RiDashboardLine,
  RiUserStarLine,
  RiNewspaperLine,
  RiImageLine,
  RiFileListLine,
  RiCalendarEventLine,
} from "react-icons/ri";
import { ROUTES } from "@/lib/constants/routes";
export const adminNavigation = [
  {
    title: "Dashboard",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: RiDashboardLine,
  },
  {
    title: "Agentes",
    href: ROUTES.ADMIN.AGENTS,
    icon: RiUserStarLine,
  },
  {
    title: "Eventos",
    href: ROUTES.ADMIN.EVENTS,
    icon: RiCalendarEventLine,
  },
  {
    title: "Notícias",
    href: ROUTES.ADMIN.NEWS,
    icon: RiNewspaperLine,
  },
  {
    title: "Galeria",
    href: ROUTES.ADMIN.GALLERY,
    icon: RiImageLine,
  },
  {
    title: "Atividades",
    href: ROUTES.ADMIN.ACTIVITIES,
    icon: RiFileListLine,
  },
];
