import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

// Placeholder de l'étape 1 : prouve que l'auth fonctionne. L'onboarding arrive à l'étape 2.
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion?next=/onboarding");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5">
      <h1 className="text-3xl font-black tracking-tight">
        T&apos;es connecté<span className="text-primary">.</span>
      </h1>
      <p className="text-muted-foreground">
        Connecté en tant que <span className="text-foreground">{user.email}</span>. L&apos;onboarding
        arrive très vite.
      </p>
      <form action="/auth/deconnexion" method="post">
        <Button type="submit" variant="secondary" size="lg" className="w-full">
          Se déconnecter
        </Button>
      </form>
    </div>
  );
}
