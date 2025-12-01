## Objectif
- Réécrire chaque page départementale du blog individuellement pour éliminer tout contenu dupliqué, tout en respectant le design actuel et en conservant les images existantes.
- S’aligner sur le document de référence `solution.md` pour la structure, les exigences de variation et les interdits.

## Portée et Séquencement
- Portée: 101 pages dans `src/pages/blog/departements/`.
- Séquencement: procéder département par département (ordre croissant des codes), avec un premier lot de 3 pages (01 Ain, 02 Aisne, 03 Allier) pour valider le format, puis par lots de 10.

## Sources et Données
- Données DVF 2024: mutations, médiane, libellés (sans inventer de chiffres).
- Prix moyens (m²) par département et par villes (fournis/validés).
- Barèmes et simulation: valeurs exactes (barèmes officiels, calculs existants).
- Images: conserver les images Wikimedia déjà en place (aucune modification d’assets demandée).
- SEO JSON‑LD: Breadcrumb et FAQ déjà présents; ajouter LocalBusiness (Notaires) au besoin si cohérent.

## Structure de Contenu (conforme à solution.md)
- (A) Introduction contextualisée: unique par département (géographie, attractivité, niveau de prix local), sans phrases interdites.
- (B) Tableau « Frais de notaire »: chiffres exacts, commentaire distinct (angle local).
- (C) Analyse locale: démographie, attractivité, zones recherchées, particularités (frontaliers, stations, littoral, ruralité), tendances récentes.
- (D) Simulation d’achat: explication de la simulation fournie, rédaction unique (sans déformer les montants).
- (E) 3 à 5 astuces uniques: spécifiques au département; ne pas recycler les mêmes 4 astuces.
- (F) Marché immobilier 2024–2025: prix/volume/tension/attractivité en style unique.
- (G) Prix par villes: commentaire spécifique (jamais générique).
- (H) Notaires – DVF: phrase introductive unique + mini‑paragraphe par ville; éviter « mixtes » → préférer « types variés ».
- (I) FAQ personnalisée: 3–4 questions locales (urbain/rural, primo‑accédants, taxes locales…).
- (J) Conclusion courte + CTA: style unique.

## Règles d’Écriture
- Interdits (selon solution.md): bannir les formulations listées (ex: « En 2025, les frais représentent… », « L’écart entre neuf et ancien… », etc.).
- Zéro duplication: phrases, astuces, FAQ et transitions doivent varier; aucune structure mécanique répétée.
- Exactitude: ne jamais inventer de données; s’en tenir aux sources.
- Ton: naturel, localisé, précis; transitions variées.

## Processus par Page
1. Extraire les données (prix m², villes, DVF, simulation).
2. Rédiger chaque section A→J de manière unique (respect des interdits).
3. Adapter les libellés DVF (ventes immobilières « types variés » si ambigu), éviter « mixtes ».
4. Conserver l’image existante et le design; ne pas toucher aux assets.
5. Intégrer/ajuster les JSON‑LD si nécessaire (FAQ/Breadcrumb déjà présents).
6. Vérifier duplication (recherche de phrases répétées), cohérence chiffres, lisibilité.
7. Commit dédié par page (message clair), puis push.

## Validation
- Build après chaque lot, inspection visuelle, contrôle des liens et du balisage.
- Contrôle anti‑duplication (recherche de répétitions courtes et de motifs).
- Vérification SEO basique (balises, JSON‑LD valides, pas d’assets modifiés).

## Lot 1 (pilot)
- Réécrire: Ain (01), Aisne (02), Allier (03), en appliquant précisément `solution.md`.
- Livrer, valider, puis poursuivre par lots de 10.

## Gestion des Risques & Reversibilité
- Sauvegarde (branche/backup) avant chaque lot.
- Reversibilité par commit granulaire: retour en arrière page par page si besoin.

Souhaitez‑vous que je démarre avec le lot pilote (01, 02, 03) selon ce plan, puis enchaîner par lots de 10 ?