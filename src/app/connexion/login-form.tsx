"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const linkError = searchParams.get("erreur") === "lien";

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Supabase n'est pas configuré (variables d'environnement manquantes).");
      return;
    }
    const value = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      toast.error("Entre une adresse email valide.");
      return;
    }
    setSending(true);
    const { error } = await createClient().auth.signInWithOtp({
      email: value,
      options: { emailRedirectTo: redirectTo() },
    });
    setSending(false);
    if (error) {
      toast.error("Impossible d'envoyer le lien. Réessaie dans une minute.");
      return;
    }
    setSentTo(value);
  }

  async function handleGoogle() {
    if (!isSupabaseConfigured) {
      toast.error("Supabase n'est pas configuré (variables d'environnement manquantes).");
      return;
    }
    setGoogleLoading(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) {
      setGoogleLoading(false);
      toast.error("Connexion Google impossible pour le moment.");
    }
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Mail className="size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Check tes mails</p>
          <p className="text-sm text-muted-foreground">
            On a envoyé un lien de connexion à <span className="text-foreground">{sentTo}</span>.
            Ouvre-le sur ce téléphone.
          </p>
        </div>
        <Button variant="ghost" onClick={() => setSentTo(null)}>
          Utiliser une autre adresse
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {linkError && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Ce lien a expiré ou n&apos;est plus valide. Demande un nouveau lien.
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full bg-white text-black hover:bg-white/90 hover:text-black"
        onClick={handleGoogle}
        disabled={googleLoading}
      >
        {googleLoading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
        Continuer avec Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleMagicLink} className="flex flex-col gap-3" noValidate>
        <Label htmlFor="email">Ton email</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="ton@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" size="lg" className="w-full font-bold" disabled={sending}>
          {sending ? <Loader2 className="animate-spin" /> : null}
          Recevoir mon lien de connexion
        </Button>
      </form>
    </div>
  );
}
