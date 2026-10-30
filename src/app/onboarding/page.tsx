import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { OnboardingFlow } from "./onboarding-flow";

export const metadata: Metadata = {
  title: "Ton profil — Bulk",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ modifier?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, age, taille_cm, poids_kg, niveau, materiel, seances_semaine, objectif_kg")
    .eq("id", user.id)
    .maybeSingle();

  // Profil déjà rempli : on passe directement à la suite (sauf demande de modification).
  const { modifier } = await searchParams;
  if (profile && modifier === undefined) redirect("/projection");

  const fullName = (user.user_metadata?.full_name ?? user.user_metadata?.name ?? "") as string;
  const prenomGoogle = fullName.trim().split(/\s+/)[0] ?? "";

  return (
    <OnboardingFlow
      initial={
        profile
          ? {
              ...profile,
              poids_kg: Number(profile.poids_kg),
              objectif_kg: Number(profile.objectif_kg),
            }
          : { prenom: prenomGoogle }
      }
    />
  );
}
