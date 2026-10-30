"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, Minus, Plus, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AGE_MIN,
  MATERIELS,
  NIVEAUX,
  OBJECTIF_6_MOIS,
  formatKg,
  profileFields,
  profileSchema,
  type Materiel,
  type Niveau,
  type ProfileInput,
} from "@/lib/profile";
import { cn } from "@/lib/utils";

import { saveProfile } from "./actions";

type Values = {
  prenom: string;
  age: string;
  taille_cm: string;
  poids_kg: string;
  niveau: Niveau | "";
  materiel: Materiel | "";
  seances_semaine: number | null;
  objectif_kg: number | null;
};

type Initial = Partial<Omit<ProfileInput, "niveau" | "materiel">> & {
  niveau?: string;
  materiel?: string;
};

const STEPS = [
  "prenom",
  "age",
  "taille_cm",
  "poids_kg",
  "niveau",
  "materiel",
  "seances_semaine",
  "objectif_kg",
  "recap",
] as const;
type Step = (typeof STEPS)[number];

const REQUIRED: Record<Exclude<Step, "recap" | "objectif_kg">, string> = {
  prenom: "Dis-nous ton prénom.",
  age: "Entre ton âge.",
  taille_cm: "Entre ta taille en cm.",
  poids_kg: "Entre ton poids en kg.",
  niveau: "Choisis ton niveau.",
  materiel: "Choisis ton matériel.",
  seances_semaine: "Choisis un nombre de séances.",
};

const SEANCES_CONSEIL: Record<Niveau, number> = { debutant: 3, intermediaire: 4, confirme: 4 };

function toValues(initial: Initial): Values {
  return {
    prenom: initial.prenom ?? "",
    age: initial.age?.toString() ?? "",
    taille_cm: initial.taille_cm?.toString() ?? "",
    poids_kg: initial.poids_kg?.toString() ?? "",
    niveau: (initial.niveau as Niveau) ?? "",
    materiel: (initial.materiel as Materiel) ?? "",
    seances_semaine: initial.seances_semaine ?? null,
    objectif_kg: initial.objectif_kg ?? null,
  };
}

function parseDecimal(v: string) {
  return v.replace(",", ".").trim();
}

export function OnboardingFlow({ initial }: { initial: Initial }) {
  const [values, setValues] = useState<Values>(() => toValues(initial));
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tooYoung, setTooYoung] = useState(false);
  const [pending, startTransition] = useTransition();

  const step: Step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setError(null);
    setValues((v) => ({ ...v, [key]: value }));
  }

  function validateStep(s: Step, v: Values = values): string | null {
    if (s === "recap") return null;
    if (s === "objectif_kg") {
      if (!v.niveau || v.objectif_kg == null) return "Choisis ton objectif.";
      const { min, max } = OBJECTIF_6_MOIS[v.niveau];
      return v.objectif_kg < min || v.objectif_kg > max
        ? `Pour ton niveau, vise entre ${min} et ${max} kg sur 6 mois.`
        : null;
    }
    const raw = v[s];
    const value = typeof raw === "string" ? parseDecimal(raw) : raw;
    if (value === "" || value === null) return REQUIRED[s];
    const res = profileFields.shape[s].safeParse(value);
    return res.success ? null : (res.error.issues[0]?.message ?? "Valeur invalide.");
  }

  function goNext(v: Values = values) {
    // Garde-fou : refus des moins de 18 ans, sans rien enregistrer.
    if (step === "age") {
      const age = Number(v.age);
      if (v.age !== "" && Number.isInteger(age) && age > 0 && age < AGE_MIN) {
        setTooYoung(true);
        return;
      }
    }
    const err = validateStep(step, v);
    if (err) {
      setError(err);
      return;
    }
    let next = v;
    // Quand on arrive sur l'objectif, on propose automatiquement une valeur selon le niveau.
    if (STEPS[stepIndex + 1] === "objectif_kg" && v.niveau) {
      const { min, max, suggere } = OBJECTIF_6_MOIS[v.niveau];
      if (v.objectif_kg == null || v.objectif_kg < min || v.objectif_kg > max) {
        next = { ...v, objectif_kg: suggere };
      }
    }
    if (STEPS[stepIndex + 1] === "seances_semaine" && v.seances_semaine == null && v.niveau) {
      next = { ...next, seances_semaine: SEANCES_CONSEIL[v.niveau] };
    }
    setValues(next);
    setError(null);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function choose<K extends "niveau" | "materiel">(key: K, value: Values[K]) {
    const v = { ...values, [key]: value };
    setValues(v);
    setError(null);
    // Petit délai pour voir la sélection avant de passer à l'écran suivant.
    setTimeout(() => goNext(v), 180);
  }

  function submit() {
    const parsed = profileSchema.safeParse({
      ...values,
      age: values.age,
      taille_cm: values.taille_cm,
      poids_kg: parseDecimal(values.poids_kg),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vérifie tes réponses.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await saveProfile(parsed.data);
        if (res?.error) setError(res.error);
      } catch {
        setError("Problème de connexion. Réessaie dans un instant.");
      }
    });
  }

  if (tooYoung) {
    return (
      <Shell>
        <div className="flex flex-1 flex-col justify-center gap-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
            <ShieldAlert className="size-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Pas encore, désolé.</h1>
          <p className="text-muted-foreground">
            L&apos;app est réservée aux 18 ans et plus. Ton corps est encore en croissance : le
            meilleur plan pour toi, c&apos;est le sport en club, bien manger et bien dormir. Parles-en
            à un coach ou à ton médecin.
          </p>
          <p className="text-sm text-muted-foreground">Aucune donnée n&apos;a été enregistrée.</p>
          <form action="/auth/deconnexion" method="post">
            <Button type="submit" variant="secondary" size="lg" className="w-full">
              Quitter
            </Button>
          </form>
        </div>
      </Shell>
    );
  }

  const niveau = values.niveau || null;

  return (
    <Shell>
      <div className="flex items-center gap-3">
        {stepIndex > 0 ? (
          <Button variant="ghost" size="icon" onClick={goBack} aria-label="Retour">
            <ArrowLeft className="size-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" asChild aria-label="Accueil">
            <Link href="/">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        )}
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={stepIndex + 1}
          aria-label={`Étape ${stepIndex + 1} sur ${STEPS.length}`}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
          {stepIndex + 1}/{STEPS.length}
        </span>
      </div>

      <form
        key={step}
        className="flex flex-1 animate-in flex-col gap-8 pt-10 duration-300 fade-in slide-in-from-right-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (step === "recap") submit();
          else goNext();
        }}
        noValidate
      >
        {step === "prenom" && (
          <Question title="C'est quoi ton prénom ?" subtitle="Pour personnaliser ton programme.">
            <Input
              autoFocus
              name="prenom"
              autoComplete="given-name"
              placeholder="Ton prénom"
              value={values.prenom}
              onChange={(e) => set("prenom", e.target.value)}
              maxLength={40}
              aria-invalid={!!error || undefined}
            />
          </Question>
        )}

        {step === "age" && (
          <Question
            title={`Quel âge as-tu${values.prenom ? `, ${values.prenom.trim()}` : ""} ?`}
            subtitle="L'app est réservée aux 18 ans et plus."
          >
            <NumberField
              value={values.age}
              onChange={(v) => set("age", v)}
              unit="ans"
              placeholder="22"
              invalid={!!error}
            />
          </Question>
        )}

        {step === "taille_cm" && (
          <Question title="Tu mesures combien ?" subtitle="En centimètres.">
            <NumberField
              value={values.taille_cm}
              onChange={(v) => set("taille_cm", v)}
              unit="cm"
              placeholder="178"
              invalid={!!error}
            />
          </Question>
        )}

        {step === "poids_kg" && (
          <Question title="Et tu pèses combien ?" subtitle="Le matin à jeun, c'est le plus fiable.">
            <NumberField
              value={values.poids_kg}
              onChange={(v) => set("poids_kg", v)}
              unit="kg"
              placeholder="62"
              decimal
              invalid={!!error}
            />
          </Question>
        )}

        {step === "niveau" && (
          <Question title="Ton niveau en muscu ?">
            <Choices
              options={NIVEAUX}
              value={values.niveau}
              onSelect={(v) => choose("niveau", v)}
            />
          </Question>
        )}

        {step === "materiel" && (
          <Question title="Tu t'entraînes avec quoi ?">
            <Choices
              options={MATERIELS}
              value={values.materiel}
              onSelect={(v) => choose("materiel", v)}
            />
          </Question>
        )}

        {step === "seances_semaine" && (
          <Question
            title="Combien de séances par semaine ?"
            subtitle={
              niveau
                ? `Pour ton niveau, ${SEANCES_CONSEIL[niveau]} séances c'est idéal. Choisis ce que tu peux tenir.`
                : undefined
            }
          >
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("seances_semaine", n)}
                  aria-pressed={values.seances_semaine === n}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-2xl border text-2xl font-black transition-colors",
                    values.seances_semaine === n
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card hover:bg-accent"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </Question>
        )}

        {step === "objectif_kg" && niveau && values.objectif_kg != null && (
          <Objectif
            niveau={niveau}
            value={values.objectif_kg}
            poids={Number(parseDecimal(values.poids_kg))}
            onChange={(v) => set("objectif_kg", v)}
          />
        )}

        {step === "recap" && niveau && (
          <Recap values={values} niveau={niveau} onEdit={(s) => setStepIndex(STEPS.indexOf(s))} />
        )}

        {error && (
          <p role="alert" className="-mt-4 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          {step !== "niveau" && step !== "materiel" && (
            <Button type="submit" size="lg" className="w-full text-base font-bold" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {step === "recap" ? (
                <>
                  Valider mon profil
                  <Check />
                </>
              ) : (
                <>
                  Continuer
                  <ArrowRight />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))]">
      {children}
    </div>
  );
}

function Question({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl leading-tight font-black tracking-tight text-balance">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function NumberField({
  value,
  onChange,
  unit,
  placeholder,
  decimal,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder: string;
  decimal?: boolean;
  invalid?: boolean;
}) {
  return (
    <div className="relative">
      <Input
        autoFocus
        type="text"
        inputMode={decimal ? "decimal" : "numeric"}
        pattern={decimal ? "[0-9]*[.,]?[0-9]*" : "[0-9]*"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(decimal ? /[^0-9.,]/g : /[^0-9]/g, "");
          onChange(v.slice(0, decimal ? 5 : 3));
        }}
        aria-invalid={invalid || undefined}
        className="h-16 pr-16 text-3xl font-bold tabular-nums"
      />
      <span className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-lg text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}

function Choices<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: readonly { value: T; label: string; hint: string }[];
  value: string;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value)}
            aria-pressed={selected}
            className={cn(
              "flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-colors",
              selected ? "border-primary bg-primary/10" : "bg-card hover:bg-accent"
            )}
          >
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold">{o.label}</span>
              <span className="text-sm text-muted-foreground">{o.hint}</span>
            </span>
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border",
                selected && "border-primary bg-primary text-primary-foreground"
              )}
            >
              {selected && <Check className="size-4" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Objectif({
  niveau,
  value,
  poids,
  onChange,
}: {
  niveau: Niveau;
  value: number;
  poids: number;
  onChange: (v: number) => void;
}) {
  const { min, max, suggere } = OBJECTIF_6_MOIS[niveau];
  const label = NIVEAUX.find((n) => n.value === niveau)?.label.toLowerCase();
  const step = 0.5;

  return (
    <Question
      title="Ton objectif sur 6 mois"
      subtitle={`Proposé selon ton niveau (${label}). Une prise de masse lente = plus de muscle, moins de gras.`}
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6">
        <div className="flex w-full items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-12 rounded-full"
            onClick={() => onChange(Math.max(min, value - step))}
            disabled={value <= min}
            aria-label="Diminuer l'objectif"
          >
            <Minus />
          </Button>
          <div className="text-center">
            <p className="text-5xl font-black text-primary tabular-nums">+{formatKg(value)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              ≈ {formatKg(Math.round((value / 6) * 10) / 10)} / mois
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-12 rounded-full"
            onClick={() => onChange(Math.min(max, value + step))}
            disabled={value >= max}
            aria-label="Augmenter l'objectif"
          >
            <Plus />
          </Button>
        </div>
        {Number.isFinite(poids) && poids > 0 && (
          <p className="text-sm">
            {formatKg(poids)} → <span className="font-bold">{formatKg(poids + value)}</span>
          </p>
        )}
        {value === suggere ? (
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            Recommandé
          </span>
        ) : (
          <button
            type="button"
            className="text-xs text-muted-foreground underline underline-offset-4"
            onClick={() => onChange(suggere)}
          >
            Revenir à la recommandation (+{formatKg(suggere)})
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        On plafonne à {formatKg(max)} sur 6 mois pour ton niveau : au-delà, c&apos;est surtout du
        gras, pas du muscle.
      </p>
    </Question>
  );
}

function Recap({
  values,
  niveau,
  onEdit,
}: {
  values: Values;
  niveau: Niveau;
  onEdit: (s: Step) => void;
}) {
  const rows: { step: Step; label: string; value: string }[] = [
    { step: "prenom", label: "Prénom", value: values.prenom.trim() },
    { step: "age", label: "Âge", value: `${values.age} ans` },
    { step: "taille_cm", label: "Taille", value: `${values.taille_cm} cm` },
    { step: "poids_kg", label: "Poids", value: formatKg(Number(parseDecimal(values.poids_kg))) },
    {
      step: "niveau",
      label: "Niveau",
      value: NIVEAUX.find((n) => n.value === niveau)?.label ?? "",
    },
    {
      step: "materiel",
      label: "Matériel",
      value: MATERIELS.find((m) => m.value === values.materiel)?.label ?? "",
    },
    { step: "seances_semaine", label: "Séances", value: `${values.seances_semaine} / semaine` },
    { step: "objectif_kg", label: "Objectif 6 mois", value: `+${formatKg(values.objectif_kg ?? 0)}` },
  ];

  return (
    <Question title="On récapitule" subtitle="Touche une ligne pour la modifier.">
      <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
        {rows.map((r) => (
          <li key={r.step}>
            <button
              type="button"
              onClick={() => onEdit(r.step)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent"
            >
              <span className="text-sm text-muted-foreground">{r.label}</span>
              <span className="font-semibold">{r.value}</span>
            </button>
          </li>
        ))}
      </ul>
    </Question>
  );
}
