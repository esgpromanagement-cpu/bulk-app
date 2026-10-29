// Évite les redirections ouvertes : on n'accepte qu'un chemin interne.
export function safeNext(next: string | null | undefined, fallback = "/onboarding") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
