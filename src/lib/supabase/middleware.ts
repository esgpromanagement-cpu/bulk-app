import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

// Routes réservées aux utilisateurs connectés.
const PROTECTED_PREFIXES = [
  "/onboarding",
  "/projection",
  "/programme",
  "/nutrition",
  "/suivi",
  "/abonnement",
  "/parametres",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const redirectToLogin = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  };

  if (!isSupabaseConfigured) return isProtected ? redirectToLogin() : response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Ne rien mettre entre createServerClient et getUser() : ça rafraîchit le token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) return redirectToLogin();

  return response;
}
