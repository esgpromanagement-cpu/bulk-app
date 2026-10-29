"use server";

import { z } from "zod";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type WaitlistState = {
  status: "idle" | "success" | "error";
  message: string;
};

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: "Entre une adresse email valide." };
  }

  if (!isSupabaseConfigured) {
    return { status: "error", message: "Service indisponible pour le moment. Réessaie plus tard." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({ email: parsed.data.email });

  if (error) {
    // 23505 = violation d'unicité : déjà inscrit.
    if (error.code === "23505") {
      return { status: "success", message: "Tu es déjà sur la liste. On te prévient très vite." };
    }
    console.error("waitlist insert", error);
    return { status: "error", message: "Oups, ça n'a pas marché. Réessaie dans un instant." };
  }

  return { status: "success", message: "C'est noté ! Tu fais partie des premiers." };
}
