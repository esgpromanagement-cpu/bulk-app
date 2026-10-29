import Link from "next/link";
import { ArrowRight, Camera, Dumbbell, LineChart, Sparkles } from "lucide-react";

import { PhysiqueIllustration } from "@/components/landing/physique-illustration";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Camera,
    title: "Prends une photo",
    text: "Torse, de face, bonne lumière. Ta photo reste privée.",
  },
  {
    icon: Sparkles,
    title: "Découvre ta projection",
    text: "L'IA te montre un physique réaliste atteignable en 6 mois.",
  },
  {
    icon: Dumbbell,
    title: "Suis le plan",
    text: "Programme, nutrition et objectifs adaptés à ton niveau et ton matériel.",
  },
  {
    icon: LineChart,
    title: "Check-in chaque semaine",
    text: "Photo + poids, et tu vois la différence semaine après semaine.",
  },
];

export default function Home() {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden px-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />

      <header className="relative flex items-center justify-between pt-[max(1.25rem,env(safe-area-inset-top))]">
        <span className="text-xl font-black tracking-tight uppercase italic">
          Bulk<span className="text-primary">.</span>
        </span>
        <Link
          href="/connexion"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Connexion
        </Link>
      </header>

      <main className="relative flex flex-1 flex-col gap-14 pt-10">
        {/* Hero */}
        <section className="flex flex-col gap-6">
          <p className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Pour les gars minces qui veulent prendre du muscle
          </p>
          <h1 className="text-4xl leading-[1.05] font-black tracking-tight text-balance">
            Vois ton physique <span className="text-primary">dans 6 mois</span> avant de commencer.
          </h1>
          <p className="text-base text-muted-foreground">
            Une photo, une projection IA réaliste, puis le programme, la nutrition et le suivi pour
            y arriver. Pas de promesse magique : juste un plan clair.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full text-base font-bold">
              <Link href="/connexion?next=/onboarding">
                Essayer gratuitement
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="w-full">
              <a href="#liste-attente">Rejoindre la liste d&apos;attente</a>
            </Button>
          </div>
        </section>

        {/* Exemple avant / projection */}
        <section aria-labelledby="exemple-titre" className="flex flex-col gap-4">
          <h2 id="exemple-titre" className="text-lg font-bold">
            Exemple
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <figure className="flex flex-col gap-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border bg-card p-4">
                <PhysiqueIllustration muscle={0} />
                <span className="absolute top-2 left-2 rounded-md bg-background/80 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
                  Avant
                </span>
              </div>
              <figcaption className="text-center text-xs text-muted-foreground">
                Aujourd&apos;hui
              </figcaption>
            </figure>
            <figure className="flex flex-col gap-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-primary/40 bg-card p-4">
                <PhysiqueIllustration muscle={0.75} />
                <span className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                  <Sparkles className="size-3" />
                  Projection IA
                </span>
              </div>
              <figcaption className="text-center text-xs text-muted-foreground">
                Dans 6 mois
              </figcaption>
            </figure>
          </div>
          <p className="text-xs text-muted-foreground">
            Illustration. Projection IA indicative, pas une garantie de résultat. Le résultat réel
            dépend de ton entraînement, ton alimentation et ton sommeil.
          </p>
        </section>

        {/* Comment ça marche */}
        <section aria-labelledby="etapes-titre" className="flex flex-col gap-4">
          <h2 id="etapes-titre" className="text-lg font-bold">
            Comment ça marche
          </h2>
          <ol className="flex flex-col gap-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex gap-4 rounded-2xl border bg-card p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">
                    <span className="text-muted-foreground">{i + 1}.</span> {title}
                  </p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Liste d'attente */}
        <section
          id="liste-attente"
          aria-labelledby="attente-titre"
          className="flex scroll-mt-6 flex-col gap-4 rounded-2xl border bg-card p-5"
        >
          <div className="flex flex-col gap-1">
            <h2 id="attente-titre" className="text-lg font-bold">
              Sois parmi les premiers
            </h2>
            <p className="text-sm text-muted-foreground">
              Laisse ton email, on te prévient dès que les nouvelles fonctionnalités sortent.
            </p>
          </div>
          <WaitlistForm />
        </section>
      </main>

      <footer className="relative mt-14 border-t pt-6 text-xs text-muted-foreground">
        <p>Réservé aux 18 ans et plus. Les projections IA sont indicatives et ne représentent pas un résultat réel.</p>
        <p className="mt-2">© {new Date().getFullYear()} Bulk</p>
      </footer>
    </div>
  );
}
