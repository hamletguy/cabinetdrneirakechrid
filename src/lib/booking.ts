import { supabase } from "@/integrations/supabase/client";

export type Service = {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  sort_order: number;
};

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled";

export type Booking = {
  id: string;
  client_name: string;
  phone: string;
  email: string | null;
  service_id: string | null;
  requested_date: string;
  requested_time: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
};

export const statusLabels: Record<BookingStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  rejected: "Refusé",
  cancelled: "Annulé",
};

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id,name,description,duration_minutes,sort_order")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Service[];
}

export type ClinicHour = {
  weekday: number;
  is_open: boolean;
  opens_at: string;
  closes_at: string;
  slot_minutes: number;
};

export async function fetchClinicHours(): Promise<ClinicHour[]> {
  const { data, error } = await supabase
    .from("clinic_hours")
    .select("weekday,is_open,opens_at,closes_at,slot_minutes")
    .order("weekday");
  if (error) throw error;
  return (data ?? []) as ClinicHour[];
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(":");
  return Number(h) * 60 + Number(m);
};

export const formatTime = (t: string) => t.slice(0, 5).replace(":", "h");

export function buildSlots(hour: ClinicHour | undefined): string[] {
  if (!hour || !hour.is_open) return [];
  const start = toMinutes(hour.opens_at);
  const end = toMinutes(hour.closes_at);
  const step = hour.slot_minutes || 30;
  const slots: string[] = [];
  for (let m = start; m + step <= end; m += step) {
    const h = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    slots.push(`${h}:${mm}:00`);
  }
  return slots;
}

export async function fetchTakenSlots(date: string): Promise<string[]> {
  const { data, error } = await supabase.rpc("taken_slots", { _date: date });
  if (error) throw error;
  return ((data ?? []) as { requested_time: string }[]).map((r) => r.requested_time.slice(0, 8));
}

export async function fetchAvailableSlots(date: string): Promise<string[]> {
  const weekday = new Date(`${date}T00:00:00`).getDay();
  const [hours, taken] = await Promise.all([fetchClinicHours(), fetchTakenSlots(date)]);
  const all = buildSlots(hours.find((h) => h.weekday === weekday));
  const takenSet = new Set(taken.map((t) => t.slice(0, 5)));
  const today = new Date();
  const isToday = date === today.toISOString().slice(0, 10);
  const nowMinutes = today.getHours() * 60 + today.getMinutes();
  return all.filter(
    (s) => !takenSet.has(s.slice(0, 5)) && (!isToday || toMinutes(s) > nowMinutes),
  );
}

export const isValidPhone = (v: string) => /^[+0-9\s().-]{8,20}$/.test(v.trim());
