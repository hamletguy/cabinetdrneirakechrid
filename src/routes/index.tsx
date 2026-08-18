import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, Phone, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BookingForm } from "@/components/site/BookingForm";
import { SiteHeader } from "@/components/site/SiteHeader";
import { clinic, images } from "@/lib/clinic";
import { fetchServices } from "@/lib/booking";

const title = "Cabinet Dentaire Dr Neïra Kechrid Allani — Prendre rendez-vous";
const description =
  "Cabinet dentaire du Dr Neïra Kechrid Allani : consultation, détartrage, soins, blanchiment et facettes. Prenez rendez-vous en ligne en quelques secondes.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });

  return (
    <div id="top" className="min-h-screen bg-soft">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-hero text-primary-foreground">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" /> {clinic.tagline}
              </span>
              <h1 className="mt-5 text-4xl leading-tight md:text-5xl">
                Cabinet Dentaire
                <span className="block">Dr Neïra Kechrid Allani</span>
              </h1>
              <p className="mt-5 max-w-md text-primary-foreground/85">
                Des soins dentaires doux et modernes pour toute la famille, au complexe médical Ibn
                Rochd. Demandez votre rendez-vous en ligne, sans créer de compte.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" variant="secondary">
                  <a href="#rendez-vous">Prendre rendez-vous</a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <a href={clinic.phoneHref}>
                    <Phone className="h-4 w-4" /> {clinic.phone}
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={images.room}
                alt="Salle de soins moderne du cabinet dentaire"
                className="w-full rounded-3xl object-cover shadow-lift"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* About */}
        <section id="cabinet" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <img
              src={images.reception}
              alt="Accueil du cabinet dentaire Dr Neïra Kechrid Allani"
              className="w-full rounded-3xl object-cover shadow-soft"
              loading="lazy"
            />
            <div>
              <h2 className="text-3xl">Un cabinet pensé pour votre confort</h2>
              {clinic.about.map((p) => (
                <p key={p} className="mt-4 text-muted-foreground">
                  {p}
                </p>
              ))}
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: ShieldCheck, label: "Stérilisation rigoureuse" },
                  { icon: Stethoscope, label: "Équipements récents" },
                  { icon: Clock, label: "Rendez-vous rapides" },
                  { icon: Sparkles, label: "Soins esthétiques" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="bg-brand-soft/60 py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl">Nos soins</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Chaque soin est réalisé sur rendez-vous, avec une durée estimée pour organiser votre
              journée sereinement.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <article key={s.id} className="rounded-2xl border bg-card p-6 shadow-soft">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {s.duration_minutes} min
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h2 className="text-3xl">Le cabinet et nos résultats</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {images.gallery.map((img) => (
              <img
                key={img.url}
                src={img.url}
                alt={img.alt}
                loading="lazy"
                className="aspect-square w-full rounded-2xl object-cover shadow-soft"
              />
            ))}
          </div>
        </section>

        {/* Booking */}
        <section id="rendez-vous" className="bg-brand-soft/60 py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-3xl">Demander un rendez-vous</h2>
            <p className="mt-3 text-muted-foreground">
              Choisissez un créneau disponible : nous vous confirmons par téléphone ou WhatsApp.
            </p>
            <div className="mt-8">
              <BookingForm />
            </div>
          </div>
        </section>

        {/* Infos */}
        <section id="infos" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <MapPin className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold">Adresse</h3>
              <p className="mt-2 text-sm text-muted-foreground">{clinic.address}</p>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <Clock className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold">Horaires</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {clinic.hours.map((h) => (
                  <li key={h.label} className="flex justify-between gap-3">
                    <span>{h.label}</span>
                    <span className="font-medium text-foreground">{h.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <Phone className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold">Contact</h3>
              <a href={clinic.phoneHref} className="mt-2 block text-sm text-primary underline">
                {clinic.phone}
              </a>
              <Button asChild className="mt-4 w-full">
                <a href="#rendez-vous">Prendre rendez-vous</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
          <img src={images.logo} alt="" className="h-10 w-10 rounded-full object-cover" />
          <p>{clinic.name}</p>
          <p>{clinic.address}</p>
        </div>
      </footer>
    </div>
  );
}
