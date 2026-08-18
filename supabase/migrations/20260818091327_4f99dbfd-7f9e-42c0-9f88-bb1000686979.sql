CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','rejected','cancelled');

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 30,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are publicly readable" ON public.services FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  phone text NOT NULL,
  email text,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  requested_date date NOT NULL,
  requested_time time NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX bookings_active_slot_unique ON public.bookings (requested_date, requested_time)
  WHERE status IN ('pending','confirmed');

GRANT INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request a booking" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "Staff can read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff can update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff can delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.clinic_hours (
  weekday integer PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  is_open boolean NOT NULL DEFAULT true,
  opens_at time NOT NULL DEFAULT '08:00',
  closes_at time NOT NULL DEFAULT '17:00',
  slot_minutes integer NOT NULL DEFAULT 30
);
GRANT SELECT ON public.clinic_hours TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_hours TO authenticated;
GRANT ALL ON public.clinic_hours TO service_role;
ALTER TABLE public.clinic_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hours are publicly readable" ON public.clinic_hours FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff can update hours" ON public.clinic_hours FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.taken_slots(_date date)
RETURNS TABLE (requested_time time)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.requested_time FROM public.bookings b
  WHERE b.requested_date = _date AND b.status IN ('pending','confirmed');
$$;
GRANT EXECUTE ON FUNCTION public.taken_slots(date) TO anon, authenticated;

INSERT INTO public.clinic_hours (weekday, is_open, opens_at, closes_at, slot_minutes) VALUES
 (0,false,'08:00','14:00',30),
 (1,true,'08:00','17:00',30),
 (2,true,'08:00','17:00',30),
 (3,true,'08:00','17:00',30),
 (4,true,'08:00','17:00',30),
 (5,true,'08:00','17:00',30),
 (6,true,'08:00','14:00',30);

INSERT INTO public.services (name, description, duration_minutes, sort_order) VALUES
 ('Consultation et examen dentaire','Bilan bucco-dentaire complet',30,1),
 ('Détartrage','Nettoyage et polissage des dents',30,2),
 ('Soins dentaires (caries)','Traitement et obturation',45,3),
 ('Extraction dentaire','Retrait d''une dent',30,4),
 ('Blanchiment dentaire','Éclaircissement des dents',60,5),
 ('Facettes dentaires','Pose de facettes pour améliorer l''esthétique du sourire',60,6);