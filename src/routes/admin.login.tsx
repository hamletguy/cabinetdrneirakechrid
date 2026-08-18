import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { clinic, images } from "@/lib/clinic";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Espace staff — Cabinet Dr Neïra Kechrid Allani" },
      { name: "description", content: "Connexion réservée à l'équipe du cabinet dentaire." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Espace staff — Cabinet Dr Neïra Kechrid Allani" },
      { property: "og:description", content: "Connexion réservée à l'équipe du cabinet dentaire." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError("E-mail ou mot de passe incorrect.");
      return;
    }
    navigate({ to: "/admin" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-soft">
        <img src={images.logo} alt="" className="mx-auto h-14 w-14 rounded-full object-cover" />
        <h1 className="mt-4 text-center text-2xl">Espace staff</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">{clinic.shortName}</p>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Se connecter
        </Button>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Les comptes du personnel sont créés par l'administrateur du cabinet.
        </p>
      </form>
    </div>
  );
}
