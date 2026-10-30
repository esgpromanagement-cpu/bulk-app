import { z } from "zod";

export const NIVEAUX = [
  { value: "debutant", label: "Débutant", hint: "Moins de 6 mois de muscu régulière" },
  { value: "intermediaire", label: "Intermédiaire", hint: "6 mois à 2 ans de pratique" },
  { value: "confirme", label: "Confirmé", hint: "Plus de 2 ans, tu connais les bases" },
] as const;

export const MATERIELS = [
  { value: "salle", label: "Salle de sport", hint: "Barres, machines, haltères" },
  { value: "maison_halteres", label: "Maison avec haltères", hint: "Haltères réglables, banc si possible" },
  { value: "poids_du_corps", label: "Poids du corps", hint: "Pompes, tractions, dips…" },
] as const;

export type Niveau = (typeof NIVEAUX)[number]["value"];
export type Materiel = (typeof MATERIELS)[number]["value"];

export const AGE_MIN = 18;

// Prise de masse sur 6 mois. Débutant ≈ 0,5–1 kg/mois, puis ça ralentit avec l'expérience.
// Les plafonds sont dupliqués dans le trigger SQL (0002_profiles.sql).
export const OBJECTIF_6_MOIS: Record<Niveau, { min: number; suggere: number; max: number }> = {
  debutant: { min: 3, suggere: 4.5, max: 6 },
  intermediaire: { min: 2, suggere: 3, max: 4 },
  confirme: { min: 1, suggere: 1.5, max: 2.5 },
};

export const profileFields = z.object({
  prenom: z.string().trim().min(1, "Dis-nous ton prénom.").max(40, "40 caractères max."),
  age: z.coerce
    .number({ message: "Entre ton âge." })
    .int("Entre un nombre entier.")
    .min(AGE_MIN, "L'app est réservée aux 18 ans et plus.")
    .max(99, "Âge invalide."),
  taille_cm: z.coerce
    .number({ message: "Entre ta taille en cm." })
    .int("En cm, sans virgule.")
    .min(140, "Entre 140 et 220 cm.")
    .max(220, "Entre 140 et 220 cm."),
  poids_kg: z.coerce
    .number({ message: "Entre ton poids en kg." })
    .min(35, "Entre 35 et 200 kg.")
    .max(200, "Entre 35 et 200 kg."),
  niveau: z.enum(["debutant", "intermediaire", "confirme"], { message: "Choisis ton niveau." }),
  materiel: z.enum(["salle", "maison_halteres", "poids_du_corps"], {
    message: "Choisis ton matériel.",
  }),
  seances_semaine: z.coerce.number().int().min(2, "Entre 2 et 6.").max(6, "Entre 2 et 6."),
  objectif_kg: z.coerce.number().positive(),
});

// Garde-fou : objectif plafonné selon le niveau (revalidé côté serveur et en base).
export const profileSchema = profileFields.superRefine((data, ctx) => {
  const { min, max } = OBJECTIF_6_MOIS[data.niveau];
  if (data.objectif_kg < min || data.objectif_kg > max) {
    ctx.addIssue({
      code: "custom",
      path: ["objectif_kg"],
      message: `Pour ton niveau, vise entre ${min} et ${max} kg sur 6 mois.`,
    });
  }
});

export type ProfileInput = z.infer<typeof profileSchema>;

export function formatKg(kg: number) {
  return `${kg.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kg`;
}
