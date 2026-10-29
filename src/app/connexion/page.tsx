import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Connexion — Bulk",
};

export default function ConnexionPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8">
      <Link
        href="/"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Retour
      </Link>

      <div className="flex flex-1 flex-col justify-center gap-8 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight">
            C&apos;est parti<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground">
            Connecte-toi pour créer ton profil et voir ta projection. Pas de mot de passe.
          </p>
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>

        <p className="text-xs text-muted-foreground">
          En continuant, tu confirmes avoir 18 ans ou plus.
        </p>
      </div>
    </div>
  );
}
