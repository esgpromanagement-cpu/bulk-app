import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { formatKg } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

// Placeholder de l'étape 2 : la projection IA arrive à l'étape 3.
export default async function ProjectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/projection");

  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, objectif_kg")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5">
      <h1 className="text-3xl font-black tracking-tight">
        Profil créé, {profile.prenom}<span className="text-primary">.</span>
      </h1>
      <p className="text-muted-foreground">
        Objectif : <span className="font-semibold text-foreground">+{formatKg(Number(profile.objectif_kg))}</span>{" "}
        sur 6 mois. Ta projection IA arrive très vite.
      </p>
      <Button asChild variant="secondary" size="lg" className="w-full">
        <Link href="/onboarding?modifier">Modifier mon profil</Link>
      </Button>
      <form action="/auth/deconnexion" method="post">
        <Button type="submit" variant="ghost" size="lg" className="w-full">
          Se déconnecter
        </Button>
      </form>
    </div>
  );
}
