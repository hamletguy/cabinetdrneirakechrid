import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, LogOut, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchServices,
  formatTime,
  statusLabels,
  type Booking,
  type BookingStatus,
} from "@/lib/booking";
import { images } from "@/lib/clinic";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Cabinet Dr Neïra Kechrid Allani" },
      { name: "description", content: "Gestion des rendez-vous du cabinet dentaire." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Tableau de bord — Cabinet Dr Neïra Kechrid Allani" },
      { property: "og:description", content: "Gestion des rendez-vous du cabinet dentaire." },
    ],
  }),
  component: AdminDashboard,
});

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-sand text-foreground",
  confirmed: "bg-mint text-foreground",
  rejected: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const todayStr = () => new Date().toISOString().slice(0, 10);

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [checking, setChecking] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [dayView, setDayView] = useState(todayStr());

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) navigate({ to: "/admin/login" });
      else setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const serviceName = useMemo(
    () => Object.fromEntries(services.map((s) => [s.id, s.name])),
    [services],
  );

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    enabled: !checking,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Booking[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });

  const filtered = bookings.filter(
    (b) =>
      (statusFilter === "all" || b.status === statusFilter) &&
      (!dateFilter || b.requested_date === dateFilter),
  );

  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const stats = {
    week: bookings.filter((b) => b.created_at >= weekAgo).length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
  };

  const daySchedule = bookings
    .filter(
      (b) =>
        b.requested_date === dayView && (b.status === "pending" || b.status === "confirmed"),
    )
    .sort((a, b) => a.requested_time.localeCompare(b.requested_time));

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src={images.logo} alt="" className="h-9 w-9 rounded-full object-cover" />
            <span className="text-sm font-semibold">Tableau de bord</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/admin/login" });
            }}
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Demandes (7 jours)", value: stats.week },
            { label: "En attente", value: stats.pending },
            { label: "Confirmés", value: stats.confirmed },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-soft">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-3xl font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as "all" | BookingStatus)}
              >
                <SelectTrigger id="status" className="mt-2 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {(Object.keys(statusLabels) as BookingStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFilter">Date</Label>
              <Input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="mt-2 w-48"
              />
            </div>
            {(statusFilter !== "all" || dateFilter) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter("all");
                  setDateFilter("");
                }}
              >
                Réinitialiser
              </Button>
            )}
          </div>

          <div className="mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Soin</TableHead>
                  <TableHead>Date / heure</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Chargement…
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Aucun rendez-vous.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      {b.client_name}
                      {b.email && (
                        <span className="block text-xs text-muted-foreground">{b.email}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="text-primary">
                        {b.phone}
                      </a>
                    </TableCell>
                    <TableCell>{b.service_id ? serviceName[b.service_id] : "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {b.requested_date} · {formatTime(b.requested_time)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyles[b.status]} variant="secondary">
                        {statusLabels[b.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={b.status}
                        onValueChange={(v) =>
                          updateStatus.mutate({ id: b.id, status: v as BookingStatus })
                        }
                      >
                        <SelectTrigger className="ml-auto w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(statusLabels) as BookingStatus[]).map((s) => (
                            <SelectItem key={s} value={s}>
                              {statusLabels[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {updateStatus.isError && (
            <p className="mt-3 text-sm text-destructive">
              La mise à jour a échoué. Un autre rendez-vous occupe peut-être déjà ce créneau.
            </p>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl">
              <CalendarDays className="h-5 w-5 text-primary" /> Planning du jour
            </h2>
            <Input
              type="date"
              value={dayView}
              onChange={(e) => setDayView(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="mt-5 space-y-2">
            {daySchedule.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun rendez-vous ce jour-là.</p>
            )}
            {daySchedule.map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border bg-background px-4 py-3"
              >
                <span className="w-16 font-semibold">{formatTime(b.requested_time)}</span>
                <span className="flex-1 min-w-40">{b.client_name}</span>
                <span className="text-sm text-muted-foreground">
                  {b.service_id ? serviceName[b.service_id] : "—"}
                </span>
                <Badge className={statusStyles[b.status]} variant="secondary">
                  {statusLabels[b.status]}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
