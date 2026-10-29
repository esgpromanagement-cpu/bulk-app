# Projet : App de transformation physique "skinny → muscle"

## Vision
Web app mobile (PWA) en français pour les jeunes hommes minces qui veulent prendre du muscle.
L'utilisateur prend une photo, l'IA génère une projection réaliste de son physique dans X mois,
puis l'app lui donne le programme, la nutrition et un suivi hebdo pour y arriver.

Accroche = la projection IA. Rétention (abonnement) = programme + check-in hebdo.

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Supabase : auth (email magic link + Google), base Postgres, Storage pour les photos (bucket privé)
- Stripe : abonnement (Checkout + Customer Portal + webhooks)
- fal.ai : édition d'image pour la projection (modèle d'édition image-to-image, à rendre configurable via variable d'env)
- PWA : manifest + service worker (installable sur iPhone/Android)
- Déploiement : Vercel

## Design
- Mobile-first, 100 % pensé pour écran de téléphone
- Dark mode par défaut, style moderne et motivant (fitness, énergique)
- Tous les textes en français, ton tutoiement, direct

## Fonctionnalités V1

### 1. Landing page (/)
- Hero avec accroche ("Vois ton physique dans 6 mois avant de commencer")
- Exemple avant/projection clairement étiqueté "Projection IA"
- Formulaire liste d'attente (email) → table `waitlist`
- CTA "Essayer gratuitement"

### 2. Onboarding (/onboarding)
Étapes une par une (une question par écran) :
- Prénom, âge, taille (cm), poids (kg)
- Niveau : débutant / intermédiaire / confirmé
- Matériel : salle de sport / maison avec haltères / poids du corps
- Séances par semaine : 2 à 6
- Objectif de prise de masse sur 6 mois (proposé automatiquement selon le niveau)

### 3. Projection IA (/projection)
- Upload photo (torse, de face, bonne lumière) avec consignes affichées
- Génération via fal.ai d'une version plus musclée, même personne, même pose, même fond
- Version gratuite : image floutée + filigrane "Projection IA"
- Version payante : image HD sans flou
- Toujours afficher la mention "Projection IA indicative, pas une garantie de résultat"

### 4. Programme (/programme)
- Séances générées selon niveau, matériel et fréquence (templates en base, pas d'IA nécessaire en V1)
- Progression semaine par semaine (charges/répétitions)
- Chaque exercice : nom, séries, répétitions, repos, consigne courte
- Cocher une séance comme faite

### 5. Nutrition (/nutrition)
- Calcul besoins caloriques (Mifflin-St Jeor) + surplus léger pour prise de masse
- Objectif protéines journalier
- 10-15 idées de repas prise de masse pas chers (contenu statique en V1)

### 6. Check-in hebdo (/suivi)
- Photo + poids chaque semaine
- Comparaison côte à côte : photo de départ / photo actuelle / projection
- Courbe de poids

### 7. Abonnement (/abonnement)
- Gratuit : onboarding + projection floutée
- Premium : 9,99 €/mois ou 49 €/an → projection HD, programme, nutrition, suivi
- Stripe Checkout + webhook qui met à jour `profiles.is_premium`

## Garde-fous (obligatoires)
- Objectif de prise de poids plafonné à une progression réaliste et saine (pas plus d'environ 0,5 à 1 kg par mois pour un débutant)
- Refuser les utilisateurs de moins de 18 ans à l'onboarding
- La projection doit rester réaliste : pas de physique de bodybuilder pro, pas de transformation irréaliste
- Prompt de génération : même visage, même identité, pas de modification du visage, pas de nudité
- Photos stockées dans un bucket Supabase privé, accessibles uniquement par leur propriétaire (RLS)
- Bouton "Supprimer mon compte et mes photos" dans les paramètres (RGPD)
- Ne jamais présenter une projection comme un résultat réel

## Base de données (Supabase)
- `profiles` : id (= auth.users.id), prenom, age, taille_cm, poids_kg, niveau, materiel, seances_semaine, objectif_kg, is_premium, stripe_customer_id, created_at
- `projections` : id, user_id, photo_originale_path, photo_projection_path, created_at
- `checkins` : id, user_id, semaine, poids_kg, photo_path, created_at
- `seances_faites` : id, user_id, semaine, seance_index, done_at
- `waitlist` : id, email, created_at
- RLS activé sur toutes les tables : chaque utilisateur ne voit que ses données

## Variables d'environnement
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
FAL_KEY, FAL_MODEL_ID,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY,
NEXT_PUBLIC_APP_URL

## Ordre de construction
1. Setup projet + Supabase + auth + landing avec liste d'attente
2. Onboarding + table profiles
3. Projection IA (upload, génération, flou pour non-premium)
4. Stripe + premium
5. Programme + nutrition
6. Check-in hebdo + comparaison
7. PWA + déploiement Vercel

Avancer étape par étape. À la fin de chaque étape : vérifier que ça build, résumer ce qui a été fait, et attendre ma validation avant de passer à la suivante.
