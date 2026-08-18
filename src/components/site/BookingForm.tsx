import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchAvailableSlots,
  fetchServices,
  formatTime,
  isValidPhone,
  type Service,
} from "@/lib/booking";
import { cn } from "@/lib/utils";

type FieldErrors = {
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  date?: string;
  time?: string;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export function BookingForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const { data: slots = [], isFetching: loadingSlots } = useQuery({
    queryKey: ["slots", date],
    queryFn: () => fetchAvailableSlots(date),
    enabled: Boolean(date),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("bookings").insert({
        client_name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        service_id: serviceId,
        requested_date: date,
        requested_time: time,
        status: "pending" as const,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDone(true);
      queryClient.invalidateQueries({ queryKey: ["slots", date] });
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Merci d'indiquer votre nom complet.";
    if (!isValidPhone(phone)) next.phone = "Numéro de téléphone invalide.";
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim()))
      next.email = "Adresse e-mail invalide.";
    if (!serviceId) next.service = "Choisissez un soin.";
    if (!date) next.date = "Choisissez une date.";
    if (!time) next.time = "Choisissez un créneau horaire.";
    setErrors(next);
    if (Object.keys(next).length === 0) mutation.mutate();
  };

  if (done) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden />
        <h3 className="mt-4 text-2xl">Demande envoyée</h3>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Merci ! Nous avons bien reçu votre demande et nous vous confirmerons rapidement par
          téléphone ou WhatsApp.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setDone(false);
            setName("");
            setPhone("");
            setEmail("");
            setServiceId("");
            setTime("");
          }}
        >
          Prendre un autre rendez-vous
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-2xl border bg-card p-6 shadow-soft sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <Label htmlFor="name">Nom complet *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom et prénom"
            className="mt-2"
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="56 985 983"
            className="mt-2"
          />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
        </div>
        <div>
          <Label htmlFor="email">E-mail (optionnel)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="mt-2"
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="service">Soin souhaité *</Label>
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger id="service" className="mt-2 w-full">
              <SelectValue placeholder="Choisir un soin" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} · {s.duration_minutes} min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.service && <p className="mt-1 text-xs text-destructive">{errors.service}</p>}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="date">Date souhaitée *</Label>
          <Input
            id="date"
            type="date"
            min={todayStr()}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setTime("");
            }}
            className="mt-2"
          />
          {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
        </div>
      </div>

      <div className="mt-6">
        <Label>Créneaux disponibles *</Label>
        {loadingSlots ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement des disponibilités…
          </p>
        ) : slots.length === 0 ? (
          <p className="mt-3 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
            Aucun créneau disponible ce jour-là. Merci de choisir une autre date.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTime(s)}
                className={cn(
                  "rounded-lg border px-2 py-2 text-sm transition-colors",
                  time === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:border-primary hover:bg-brand-soft",
                )}
              >
                {formatTime(s)}
              </button>
            ))}
          </div>
        )}
        {errors.time && <p className="mt-1 text-xs text-destructive">{errors.time}</p>}
      </div>

      {mutation.isError && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Ce créneau vient d'être réservé ou une erreur est survenue. Merci de choisir un autre
          horaire.
        </p>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CalendarCheck className="h-4 w-4" />
        )}
        Envoyer ma demande
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Aucun compte nécessaire. Nous confirmons chaque rendez-vous par téléphone.
      </p>
    </form>
  );
}
