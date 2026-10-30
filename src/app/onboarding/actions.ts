"use server";

import { redirect } from "next/navigation";

import { profileSchema, type ProfileInput } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type SaveProfileResult = { error: string } | undefined;

export async function saveProfile(input: ProfileInput): Promise<SaveProfileResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  if (!isSupabaseConfigured) {
    return { error: "Service indisponible pour le moment. Réessaie plus tard." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/onboarding");

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...parsed.data }, { onConflict: "id" });

  if (error) {
    console.error("profiles upsert", error);
    return { error: "Impossible d'enregistrer ton profil. Réessaie dans un instant." };
  }

  redirect("/projection");
}
