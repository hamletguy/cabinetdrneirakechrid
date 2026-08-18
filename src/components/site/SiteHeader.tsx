import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clinic, images } from "@/lib/clinic";

const links = [
  { href: "#services", label: "Soins" },
  { href: "#cabinet", label: "Le cabinet" },
  { href: "#infos", label: "Infos pratiques" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <a href="#top" className="flex items-center gap-3">
          <img
            src={images.logo}
            alt={`Logo ${clinic.shortName}`}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="hidden text-sm font-semibold leading-tight sm:block">
            Dr Neïra Kechrid Allani
            <span className="block text-xs font-normal text-muted-foreground">Médecin dentiste</span>
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground">
              {l.label}
            </a>
          ))}
          <Link to="/admin/login" className="text-muted-foreground hover:text-foreground">
            Espace staff
          </Link>
        </nav>
        <Button asChild size="sm">
          <a href="#rendez-vous">
            <Phone className="h-4 w-4" />
            Rendez-vous
          </a>
        </Button>
      </div>
    </header>
  );
}
