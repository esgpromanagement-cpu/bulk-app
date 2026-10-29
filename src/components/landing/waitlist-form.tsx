"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { joinWaitlist, type WaitlistState } from "@/app/actions/waitlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: WaitlistState = { status: "idle", message: "" };

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(joinWaitlist, initialState);

  if (state.status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <Label htmlFor="waitlist-email" className="sr-only">
        Ton email
      </Label>
      <Input
        id="waitlist-email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="ton@email.com"
        required
        aria-invalid={state.status === "error" || undefined}
        aria-describedby={state.status === "error" ? "waitlist-error" : undefined}
      />
      {state.status === "error" && (
        <p id="waitlist-error" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button type="submit" size="lg" variant="secondary" disabled={pending} className="w-full">
        {pending ? <Loader2 className="animate-spin" /> : null}
        Rejoindre la liste d&apos;attente
      </Button>
    </form>
  );
}
