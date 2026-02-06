import Link from "next/link";
import Image from "next/image";

interface LogoHeaderProps {
  compact?: boolean;
}

export default function LogoHeader({ compact = false }: LogoHeaderProps) {
  return (
    <Link
      href="/admin/dashboard"
      className="flex items-center gap-2 transition-opacity hover:opacity-90"
    >
      <div className="relative">
        <Image
          src="/images/logos/logo.webp"
          alt="PAC Logo"
          width={0}
          height={0}
          sizes="100vw"
          priority
          style={{
            width: "auto",
            height: "auto",
            maxWidth: compact ? "48px" : "64px",
          }}
          className="object-contain"
        />
      </div>
      {!compact && (
        <div className="flex flex-col">
          <span className="font-black text-slate-800 text-lg leading-none tracking-tight">
            PAC ADMIN
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Painel de Controle
          </span>
        </div>
      )}
    </Link>
  );
}
