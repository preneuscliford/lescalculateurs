# Recommandations SEO IA - Search Console (2026-04-18T15:42:15.394Z)

## Parametres
- Dossier source: `C:\Users\prene\OneDrive\Bureau\lesCalculateurs\seach-console-perf`
- Fichier 7 jours: `lescalculateurs.fr-Performance-on-Search-2026-04-18.xlsx`
- Fichier 28 jours: `lescalculateurs.fr-Performance-on-Search-2026-04-18 (1).xlsx`
- Seuil impressions 28j: `150`
- Seuil CTR max 28j: `2.00%`
- Pages analysees: `8`
- Modele OpenAI: `gpt-5-mini`
- Strategie: `hub-first`

## Pages prioritaires
| Page | Impr 28j | Clics 28j | CTR 28j | Pos 28j | Score |
|---|---:|---:|---:|---:|---:|
| /pages/apl | 42240 | 172 | 0.41% | 8.23 | 5111.40 |
| /pages/are | 26808 | 211 | 0.79% | 7.90 | 3366.61 |
| /pages/rsa | 22877 | 101 | 0.44% | 8.36 | 2724.44 |
| /pages/prime-activite | 19683 | 161 | 0.82% | 9.20 | 2121.91 |
| /pages/apl-zones | 14465 | 38 | 0.26% | 6.98 | 2066.96 |
| /pages/pret | 9758 | 12 | 0.12% | 8.06 | 1209.22 |
| /pages/salaire-brut-net-calcul-2026 | 2962 | 1 | 0.03% | 2.73 | 1084.66 |
| /pages/notaire | 5608 | 32 | 0.57% | 7.04 | 792.05 |

## /pages/apl
- URL: https://www.lescalculateurs.fr/pages/apl
- Fichier local: `src\pages\apl.html`
- Title actuel: APL 2026 : montant, simulation CAF et conditions
- Meta actuelle: Découvrez combien vous pouvez toucher d
- CTR 28j: 0.41% (172/42240)
- CTR 7j: 0.49% (60/12217)
- Pages satellites associees:
- /pages/apl/apl-smic-seul | impr28=1656 | clics28=76 | ctr28=4.59% | pos28=6.44
- /pages/apl/apl-loyer-700-personne-seule | impr28=1068 | clics28=21 | ctr28=1.97% | pos28=8.24
- /pages/apl/apl-chomage-loyer-moyen | impr28=1036 | clics28=13 | ctr28=1.25% | pos28=7.52
- /pages/apl/apl-famille-trois-enfants | impr28=952 | clics28=15 | ctr28=1.58% | pos28=6.25
- /pages/apl/apl-apprenti | impr28=951 | clics28=4 | ctr28=0.42% | pos28=7.02
- /pages/apl/apl-celibataire-smic | impr28=889 | clics28=19 | ctr28=2.14% | pos28=6.91

Diagnostic:
Le hub génère beaucoup d'impressions (position moyenne ~8) mais faible CTR (~0,4–0,5%) car le snippet actuel est coupé, peu engageant et n'affiche pas d'avantage concret ni d'appel à l'action clair. Le titre/H1 sont verbeux et ne mettent pas en avant l'élément différenciant (simulateur rapide + chiffres indicatifs). La meta actuelle est tronquée (« Découvrez combien vous pouvez toucher d ») — perte d'information. En plus, l'URL/pseudo-breadcrumb et l'extrait montrent beaucoup d'éléments redondants (historique, méthodologie) qui diluent l'intention utilisateur. Les pages satellites performent mieux sur requêtes spécifiques (ex. smic) : elles captent des clics grâce à une promesse précise. Le hub doit donc devenir plus attractif en SERP (titre/meta) et plus orienté conversion (CTA visible, exemples chiffrés, structured data FAQ/schema) tout en renforçant le maillage vers les pages satellites thématiques.

Titles proposes:
- APL 2026 — Simulation rapide CAF : estimez votre aide en 2 min
- Simulateur APL 2026 (CAF) : montant estimé selon loyer & revenus
- Calculez votre APL 2026 | Estimation CAF immédiate selon votre ville

Metas proposees:
- Estimez gratuitement votre APL 2026 en 2 minutes. Montant indicatif selon loyer, revenus et zone. Résultat instantané + exemples (personne seule, famille). Basé sur barèmes CAF à jour.
- Calculez votre aide au logement (APL) 2026 : montant approximatif, conditions et simulateur gratuit. Entrez loyer, revenus et zone pour obtenir un résultat personnalisé en 2 min.

Quick wins UX:
- Placer le simulateur visible au-dessus de la ligne de flottaison avec CTA clair (« Lancer la simulation — 2 min ») et affichage d'un montant indicatif exemple (ex. « Personne seule, loyer 600€ → APL ≈ 140€/mois ») pour accrocher l'utilisateur.
- Ajouter un bloc « Scénarios rapides » au-dessus du fold : boutons vers les satellites (Ex. « Smic seul », « Famille 3 enfants », « Apprenti ») avec micro-extraits de résultat pour chaque cas, afin de capter les recherches longues traînes.
- Intégrer FAQ en bas de page avec balisage FAQPage (structured data) couvrant 5–7 questions concrètes (qui peut avoir droit, calcul simplifié, pièces CAF, délais) pour gagner en visibilité dans les SERP et répondre aux intentions immédiates.

Recommandations de maillage:
- Dans le hub, insérer un module « Choisissez votre situation » (cartes) renvoyant vers chaque page satellite (texte d'ancrage descriptif : ex. « APL pour personne au SMIC ») — 1er écran et fin d'article.
- Sur chaque page satellite, ajouter un lien contextuel vers le hub avec ancre orientée conversion (« Calculer votre APL personnalisé ») et un court résumé qui explique que le hub propose le simulateur complet.
- Créer un fil de navigation « Cas pratiques » sur le hub listant les satellites les plus recherchés (smic, apprenti, famille) avec mini-extraits de résultat et liens profonds vers les simulateurs pSEO.

Actions prioritaires:
- Haut impact — Optimiser titre + meta et lancer A/B test : remplacer le titre actuel par l'un des titres proposés et utiliser une meta descriptive montrant le gain utilisateur (résultat en 2 min, gratuit). Mesurer CTR sous 2–4 semaines.
- Très visible — Mettre le simulateur et un exemple chiffré au-dessus du pli + ajouter boutons vers scénarios satellites. Améliore l'engagement et diminue le taux de rebond, renforçant le signal de pertinence pour Google.
- Technique/SEO — Ajouter balisage FAQPage et breadcrumbs clairs, et harmoniser les ancres internes hub→satellites et satellites→hub. Cela améliore l'apparence en SERP et la découverte des pages pSEO pertinentes.

## /pages/are
- URL: https://www.lescalculateurs.fr/pages/are
- Fichier local: `src\pages\are.html`
- Title actuel: ARE 2026 : simulation chomage, montant et reprise d'emploi
- Meta actuelle: Estimez votre allocation chômage (ARE) selon votre salaire, votre durée de travail et une reprise d
- CTR 28j: 0.79% (211/26808)
- CTR 7j: 0.78% (67/8610)
- Pages satellites associees:
- /pages/are/are-fin-de-droits-quelles-aides | impr28=25 | clics28=0 | ctr28=0.00% | pos28=5.72
- /pages/are/montant-are-2026 | impr28=8 | clics28=0 | ctr28=0.00% | pos28=2.62
- /pages/are/are-cumul-salaire-temps-partiel-2026 | impr28=8 | clics28=0 | ctr28=0.00% | pos28=4.50
- /pages/are/are-fin-de-droits-aides-2026 | impr28=8 | clics28=0 | ctr28=0.00% | pos28=6.12
- /pages/are/are-duree-indemnisation-2026 | impr28=1 | clics28=0 | ctr28=0.00% | pos28=3.00

Diagnostic:
Le hub reçoit beaucoup d'impressions mais très peu de clics (CTR ~0,8%). Causes probables :
- Title et meta actuels peu accrocheurs et tronqués : ils n’exploitent pas d’éléments différenciants (montant moyen, « simulateur », appel à l’action clair) ni d’arguments de confiance (France Travail, mise à jour 2026). Sur la SERP la balise est donc peu distinctive face aux résultats concurrents.
- H1 / extrait de page long et verbeux sans proposition de valeur rapide : l’utilisateur ne comprend pas en un coup d’œil ce qu’il va obtenir (simulation immédiate ? gratuit ? fiable ?).
- Absence d’éléments structurés visibles en SERP (FAQ/HowTo/schema) : pas d’extraits enrichis pour gagner de l’espace et d’attention.
- Position moyenne (~8) rend l’effort de CTR plus difficile ; il faut maximiser l’attrait du snippet pour compenser.
- Maillage interne et pages satellites peu visibles (impressions nulles ou très faibles) : elles ne renforcent pas la page hub dans les signaux sémantiques et n’apparaissent pas comme sitelinks utiles.
Conséquence : le hub capte l’intention (impressions) mais n’offre pas une proposition de clic différenciante et actionnable. Objectifs : clarifier l’offre, afficher bénéfices concrets et obtenir rich snippets / sitelinks via contenu structuré et maillage ciblé.

Titles proposes:
- Simulateur ARE 2026 — Estimez votre allocation chômage (montant & durée)
- ARE 2026 : calcul immédiat du montant et durée d’indemnisation — Gratuit
- Allocation chômage (ARE) 2026 — Simulation fiable selon France Travail

Metas proposees:
- Calculez votre ARE 2026 en 2 min : montant mensuel, durée d’indemnisation et conséquences d’une reprise d’emploi. Gratuit, validé France Travail — Lancez la simulation.
- Obtenez une estimation rapide et fiable de votre allocation chômage (ARE 2026). Montant, durée, fin de droits et aides alternatives expliquées. Mise à jour 2026 — Commencez la simulation.

Quick wins UX:
- Mettre un bouton d’action visible en haut (« Lancer la simulation ») avec micro-copy rassurante (ex. « estimation en 2 min — gratuite ») pour convertir les visiteurs directement depuis le hub.
- Ajouter un résumé visuel en 3 points sous le H1 : 1) Ce que vous obtenez (montant + durée), 2) Temps nécessaire (ex. 2 min), 3) Fiabilité (barèmes France Travail, date de mise à jour).
- Insérer une section FAQ courte (5 Q/R) en haut de page avec balisage FAQ schema pour viser l’extrait enrichi et augmenter la surface du snippet dans la SERP.

Recommandations de maillage:
- Ajouter un bloc « Cas fréquents » immédiatement sous le lancement de la simulation qui renvoie vers les satellites (fin de droits, cumul salaire temps partiel, durée) avec ancres explicites et micro-descriptions (1 ligne) pour favoriser les sitelinks.
- Sur chaque page satellite, inclure un lien contextuel fort vers le hub (« Retour au simulateur ARE 2026 ») avec mêmes mots-clés (ARE 2026, simulateur) pour concentrer le jus SEO sur la page hub.
- Créer un sommaire sticky (table des matières) qui liste le hub et les pages satellites, et place des liens internes « Vérifier ce cas » à côté des exemples pour guider l’utilisateur vers la page précise.

Actions prioritaires:
- Optimiser le snippet (Title + Meta) pour augmenter le CTR — test A/B de 3 titres/métas proposés et choisir celui qui augmente le CTR : inclure promesse rapide (temps), bénéfice concret (montant/durée) et preuve (France Travail, 2026).
- Implémenter FAQ/HowTo schema et ajouter 5 questions prioritaires en haut de page pour tenter d’obtenir des extraits enrichis et augmenter la visibilité sur la SERP.
- Renforcer le maillage interne hub→satellites et satellites→hub : créer blocs « cas fréquents » et micro-descriptions, et s’assurer que chaque satellite pointe vers le hub avec ancres exact-match afin d’obtenir sitelinks et répartir l’autorité.

## /pages/rsa
- URL: https://www.lescalculateurs.fr/pages/rsa
- Fichier local: `src\pages\rsa.html`
- Title actuel: RSA 2026 : montant selon votre situation (simulation CAF)
- Meta actuelle: Découvrez combien vous pouvez toucher au RSA en 2026 selon votre situation familiale, vos revenus et votre logement. Estimation rapide.
- CTR 28j: 0.44% (101/22877)
- CTR 7j: 0.38% (38/10102)
- Pages satellites associees:
- /pages/rsa/rsa-et-apl-cumul | impr28=145 | clics28=1 | ctr28=0.69% | pos28=6.64
- /pages/rsa/rsa-hebergement-gratuit | impr28=144 | clics28=3 | ctr28=2.08% | pos28=10.03
- /pages/rsa/rsa-couple-sans-enfant | impr28=118 | clics28=1 | ctr28=0.85% | pos28=3.76
- /pages/rsa/rsa-parent-isole-sans-revenu | impr28=36 | clics28=0 | ctr28=0.00% | pos28=8.00
- /pages/rsa/rsa-sans-revenu-personne-seule | impr28=33 | clics28=0 | ctr28=0.00% | pos28=7.42
- /pages/rsa/rsa-couple-sans-revenu | impr28=28 | clics28=0 | ctr28=0.00% | pos28=13.96

Diagnostic:
Le hub reçoit beaucoup d'impressions (position moyenne ~8) mais un CTR très bas (~0,4%). Raisons probables : le titre et la meta actuels sont trop génériques et similaires aux autres résultats (manque d'éléments différenciants : chiffre concret, promesse claire, CTA). L'extrait visible contient du HTML encodé et une formulation longue/technique qui noie l'information utile. La page ne met pas suffisamment en avant un bénéfice immédiat (ex. “simulez en 2 min”), ni d'aperçu chiffré (ex. montants clés) dans le snippet. Enfin, l'UX above-the-fold n'incite pas au clic (CTA peu visible, pas d'extrait résultat), et le maillage vers les pages satellites n'est pas exploité pour capter des intentions spécifiques (APL, couple, sans revenu) directement depuis le snippet ou les ancres internes.

Titles proposes:
- RSA 2026 — Calculez votre montant en 1 min (simulation CAF rapide)
- Montant RSA 2026 : estimation immédiate selon foyer & revenus
- Simulateur RSA 2026 | Découvrez combien vous toucherez (CAF)

Metas proposees:
- Estimez votre RSA 2026 en quelques clics avec notre simulateur conforme aux barèmes CAF. Gratuit, rapide — exemple : personne seule = 651,69 €/mois. Lancez la simulation et obtenez un résultat personnalisé.
- Obtenez une estimation fiable du RSA 2026 selon votre situation familiale, vos revenus et votre logement. Simulation gratuite et pas-à-pas, résultats instantanés et sources CAF à jour.

Quick wins UX:
- Ajouter un CTA clair et visible above-the-fold : bouton « Lancer la simulation (1–2 min) » avec micro-copy rassurante (gratuit, conforme CAF).
- Afficher un aperçu chiffré immédiat (ex. « Personne seule sans revenu : 651,69 €/mois ») et exemples rapides (couple, parent isolé) pour donner un résultat tangible dès le snippet partagé et encourager le clic.
- Structurer la page avec blocs d’intention (Simulateur → FAQ → Cas fréquents) et implémenter FAQ/FAQPage schema + resultats structurés pour améliorer l’apparence dans les SERP (rich snippets).

Recommandations de maillage:
- Placer un bloc « Cas fréquents » near top (above fold or first screen) liant vers les satellites clés : « RSA et APL », « RSA couple sans enfant », « RSA personne seule sans revenu » avec mini-extraits (1 ligne) montrant pourquoi cliquer.
- Dans chaque section du hub qui évoque un cas précis, insérer un callout contextuel avec lien profond vers la page satellite correspondante (ex. mention ‘Cumuler APL ? En savoir plus → RSA et APL (lien)’).
- Ajouter un panneau « Comparez votre situation » en bas de simulateur qui affiche 3 boutons/tiles pour ouvrir directement la page satellite la plus pertinente selon le résultat (ex. si résultat = couple → bouton ‘Cas couple’).

Actions prioritaires:
- Action 1 (impact élevé) — Refonte du titre + meta et publication immédiate : remplacer le titre actuel par une version plus actionnable et chiffrée; mettre la meta qui annonce un résultat concret et le temps de simulation. Mesurer CTR via GSC sur 2 semaines.
- Action 2 (impact élevé) — UX above-the-fold : installer un CTA proéminent « Lancer la simulation (1–2 min) », afficher un exemple chiffré visible sans scroller et activer FAQ schema. Ces changements améliorent l’attractivité du snippet et la probabilité de clic.
- Action 3 (impact moyen) — Renforcer le maillage hub→satellites : créer un bloc ‘Cas fréquents’ avec liens profonds et mini-extraits, et ajouter callouts contextuels dans le contenu. Optimiser les pages satellites pour des intents long-tail complémentaires afin de remonter le hub via hub-first.

## /pages/prime-activite
- URL: https://www.lescalculateurs.fr/pages/prime-activite
- Fichier local: `src\pages\prime-activite.html`
- Title actuel: Simulation Prime d&rsquo;activit&eacute; 2026 : montant, conditions et calcul CAF
- Meta actuelle: Calculez votre prime d
- CTR 28j: 0.82% (161/19683)
- CTR 7j: 0.70% (35/4982)
- Pages satellites associees:
- /pages/prime-activite/plafond-prime-activite-2026 | impr28=158 | clics28=0 | ctr28=0.00% | pos28=3.67
- /pages/prime-activite/prime-activite-parent-isole-un-enfant | impr28=68 | clics28=0 | ctr28=0.00% | pos28=6.81
- /pages/prime-activite/prime-activite-couple-sans-enfant-smic | impr28=67 | clics28=0 | ctr28=0.00% | pos28=8.42
- /pages/prime-activite/prime-activite-reprise-emploi-personne-seule | impr28=15 | clics28=0 | ctr28=0.00% | pos28=8.40
- /pages/prime-activite/prime-activite-temps-partiel-smic | impr28=10 | clics28=0 | ctr28=0.00% | pos28=7.10

Diagnostic:
Le hub reçoit beaucoup d'impressions (position ~9) mais un CTR très faible (~0,8%) parce que son snippet n'est pas convaincant ni complet : le meta est tronqué/insuffisant, le title est trop générique, il manque d'éléments différenciants (chiffres, bénéfices rapides, CTA). Le résultat n'affiche pas de rich snippets (FAQ/schema) ni d'éléments attractifs (exemples de montants, durée de simulation). Les pages satellites sont peu visibles (peu d'impressions et 0 clics) et ne sont pas suffisamment mises en avant depuis le hub (maillage faible et absence de teasing concret). Enfin, l'extrait actuel peine à transmettre une promesse concrète et immédiate (ex : «estimez en 2 minutes»), ce qui réduit la propension au clic.

Titles proposes:
- Simulateur Prime d'activité 2026 — Estimez votre montant CAF en 2 min
- Prime d'activité 2026 : montant estimé (CAF) selon vos revenus & foyer
- Calculez votre Prime d'activité 2026 (CAF) — Simulation gratuite et immédiate

Metas proposees:
- Calculez en 2 minutes votre Prime d'activité 2026 (résultat indicatif CAF). Entrez vos revenus et votre foyer — simulation gratuite, barèmes officiels à jour.
- Estimez rapidement le montant de votre Prime d'activité 2026 selon vos revenus, situation familiale et logement. Simulation gratuite, résultat indicatif basé sur les barèmes CAF.

Quick wins UX:
- Mettre un CTA clair et visible au-dessus de la ligne de flottaison : bouton « Lancer la simulation » + icône et mention « 2 min » / « résultat indicatif CAF ».
- Afficher dès le haut de page 2–3 exemples concrets de montants (personne seule, couple, parent isolé) pour capter l'attention et fixer une attente.
- Ajouter une section FAQ courte avec balisage FAQ schema (questions fréquentes, conditions, délais) pour générer un rich snippet et augmenter le CTR.

Recommandations de maillage:
- Sur le hub, créer des cards/teasers pour chaque page satellite (titre clair + 1 phrase d'accroche + CTA « En savoir plus ») : ex. 'Plafonds 2026 — qui y a droit ?'.
- Utiliser des ancres contextualisées depuis le contenu du hub vers les satellites (ex. « plafonds prime d'activité 2026 » → /prime-activite/plafond-prime-activite-2026) pour capter des requêtes longues et améliorer le maillage sémantique.
- Sur chaque page satellite, ajouter un lien retour visible vers le hub (« Retour au simulateur Prime d'activité ») et proposer d'autres satellites connexes pour pousser la navigation et renforcer le topical authority.

Actions prioritaires:
- Haute — Refaire title + meta (3 variantes proposées) et implémenter FAQ schema afin d'améliorer immédiatement l'attractivité du snippet et viser un rich snippet.
- Moyenne — Modifier la page pour placer un CTA 'Lancer la simulation — 2 min' en haut, ajouter 2–3 exemples de montants et résumé concret (gain attendu) pour augmenter l'engagement et le taux de clics.
- Moyenne — Renforcer le maillage hub→satellites : ajouter cards teasers, ancres sémantiques et liens retour sur les satellites, et enrichir les contenus satellites pour capter des requêtes longue traîne.

## /pages/apl-zones
- URL: https://www.lescalculateurs.fr/pages/apl-zones
- Fichier local: `src\pages\apl-zones.html`
- Title actuel: Zone APL 2026 : trouvez votre zone 1, 2 ou 3 et son impact
- Meta actuelle: Trouvez votre zone APL 2026 selon votre commune, comprenez la différence entre zone 1, 2 et 3, puis estimez l
- CTR 28j: 0.26% (38/14465)
- CTR 7j: 0.25% (15/5938)

Diagnostic:
La page hub reçoit beaucoup d'impressions (position ~7) mais un CTR très faible (~0,25%). Causes probables : titre et meta peu attractifs et partiellement tronqués, message centré sur le concept (« zone APL ») sans promesse utilisateur immédiate (bénéfice/temps/resultat), absence de balises structurées (FAQ/schema) qui favorisent les rich snippets, et absence de pages satellites pSEO qui auraient permis des sitelinks et un maillage renforçant la visibilité. En conséquence, la page apparaît dans beaucoup de requêtes génériques mais ne convertit pas les vues en clics. Autres facteurs possibles : concurrence avec snippets concurrents (simulateurs, outils officiels), meta incomplète/tronquée et manque d'appel à l'action clair dans l'extrait.

Titles proposes:
- Zone APL 2026 — Trouvez votre zone (1, 2 ou 3) en 10s et estimez l'impact sur votre APL
- Quel est ma zone APL 2026 ? Trouvez votre zone 1/2/3 et calculez l'effet sur votre loyer
- Zone APL 2026 : localisation rapide par commune + effet immédiat sur plafond de loyer

Metas proposees:
- Entrez votre commune et découvrez en 10s si vous êtes en zone APL 1, 2 ou 3. Voyez immédiatement ce que cela change pour votre plafond de loyer et votre estimation d'APL. Simulateur gratuit et indicatif.
- Trouvez votre zone APL 2026 (zone 1, 2 ou 3) par commune et visualisez l'impact sur votre loyer pris en compte et votre estimation d'aide. Résultat rapide, explicatif et non contractuel.

Quick wins UX:
- Placer en haut de page un champ de recherche/lookup 'Entrez votre commune → Obtenir ma zone en 10s' avec résultat instantané et bouton 'Simuler mon APL'.
- Afficher un extrait clair du bénéfice : 3 lignes résumant « Votre zone / Plafond de loyer / Estimation APL » avec exemples chiffrés pour Paris, Lyon, et une petite ville (exemples concrets augmentent le CTR).
- Ajouter une section FAQ courte (questions fréquentes) et implémenter le balisage FAQ schema pour gagner en rich snippet dans les résultats Google.

Recommandations de maillage:
- Créer pages satellites pSEO : 'Zone APL Paris (zone 1)', 'Zone APL Lyon', 'Zone APL [département]'. Depuis le hub, lister ces pages avec ancres natives ('Zone APL Paris — voir détails') pour capter requêtes locales et générer sitelinks.
- Ajouter blocs contextuels vers les simulateurs associés (par ex. 'Simulateur APL', 'Plafonds de loyer par zone') avec liens internes visibles et contextualisés (ex. 'Simuler mon APL maintenant →').
- Mettre un fil d'Ariane et un widget 'Pages liées' sur les simulateurs et guides (satellites) renvoyant vers le hub pour concentrer le jus SEO et renforcer la page hub comme point d'entrée.

Actions prioritaires:
- Optimiser titre + meta (tests A/B si possible) pour mettre la promesse utilisateur (résultat rapide, bénéfice chiffré) et ajouter CTA. Implémenter balisage FAQ et données structurées pour rich snippets.
- Créer et publier au moins 5 pages satellites pSEO (zones/communes/départements + simulateurs locaux). Lier ces pages depuis le hub avec ancres descriptives pour capter recherches locales et obtenir sitelinks.
- Ajouter un lookup/mini-simulateur en haut du hub (résultat immédiat par commune) et exemples chiffrés ; améliorer UI pour action rapide ('Simuler mon APL') afin d'augmenter le taux de clics et la conversion depuis le SERP.

## /pages/pret
- URL: https://www.lescalculateurs.fr/pages/pret
- Fichier local: `src\pages\pret.html`
- Title actuel: Simulateur prêt immobilier 2026 : mensualité et capacité
- Meta actuelle: Calculez votre mensualité, capacité d
- CTR 28j: 0.12% (12/9758)
- CTR 7j: 0.16% (4/2452)
- Pages satellites associees:
- /pages/pret/taux-immobilier-2026-a-quoi-s-attendre | impr28=97 | clics28=0 | ctr28=0.00% | pos28=9.11
- /pages/pret/calcul-du-taux-d-endettement | impr28=70 | clics28=0 | ctr28=0.00% | pos28=21.51
- /pages/pret/quel-salaire-pour-emprunter-200-000 | impr28=58 | clics28=0 | ctr28=0.00% | pos28=4.31
- /pages/pret/quel-salaire-pour-emprunter-300-000 | impr28=33 | clics28=0 | ctr28=0.00% | pos28=5.06
- /pages/pret/capacite-d-emprunt-comment-la-calculer | impr28=26 | clics28=0 | ctr28=0.00% | pos28=3.23
- /pages/pret/mensualite-de-pret-immobilier-comment-l-estimer | impr28=24 | clics28=0 | ctr28=0.00% | pos28=6.25

Diagnostic:
La page hub reçoit beaucoup d'impressions mais très peu de clics : CTR 0,12% sur 28j alors que la position moyenne est ~8. Causes probables : title et meta actuels peu attractifs et tronqués (la meta commence par « Calculez votre mensualité, capacité d »), absence d'arguments différenciants (ex. « simulateur gratuit », « résultat immédiat », chiffres concrets) et pas d'appel à l'action visible dans le snippet. Le contenu visible en SERP manque de signaux de valeur (ex. durée de simulation, précision, fiabilité sources). Enfin, le hub ne met pas assez en avant ses pages satellites dans le contenu et dans le maillage (opportunité manquée pour capter des recherches longues).

Titles proposes:
- Simulateur prêt immobilier 2026 — Mensualité & capacité instantanée (gratuit)
- Combien puis-je emprunter en 2026 ? Simulateur prêt immobilier — mensualité & capacité
- Simulateur prêt immobilier 2026 : mensualité, capacité d’emprunt — résultat en 1 minute

Metas proposees:
- Calculez en 1 minute votre capacité d'emprunt et votre mensualité pour 2026. Simulateur gratuit, méthodes bancaires (BdF) et exemples chiffrés. Essayez maintenant.
- Simulez votre prêt immobilier pour 2026 : montant max, mensualité et taux. Résultat immédiat, explications simples et conseils pour emprunter au meilleur taux.

Quick wins UX:
- Placer le simulateur au-dessus de la ligne de flottaison avec un CTA clair (« Calculer ma capacité ») et un résultat exemple visible (ex : « Exemple : 200 000 € → 935 €/mois ») pour rassurer et inciter au clic.
- Ajouter un encart ‘résultats rapides’ + 2 presets (ex. « Couple, 2 revenus » ; « Célibataire, 1 revenu ») pour réduire la friction de saisie et augmenter le taux de conversion du widget.
- Ajouter FAQ structurée et balisage schema FAQ/SoftwareApplication pour enrichir le SERP (extrait), afficher valeur et capter plus de clics.

Recommandations de maillage:
- Dans l’introduction du hub, insérer une section « Besoin d'aide pour… » avec 3 liens profonds vers les satellites clefs (taux 2026 ; calcul du taux d’endettement ; quel salaire pour emprunter X) en utilisant des ancres exact-match et incitatives (ex. « Voir les taux immobiliers 2026 »).
- Ajouter des callouts contextuels près du simulateur reliant aux pages satellites pertinentes selon l’étape : après le résultat proposer « Mieux comprendre votre taux d'endettement » (lien vers /calcul-du-taux-d-endettement) et « Voir combien il vous faut gagner pour emprunter 200k/300k » (liens vers pages salaire).
- Faire remonter le hub depuis chaque page satellite : placer en haut un lien « Retour au simulateur prêt immobilier » + un bref extrait (2-3 phrases) expliquant pourquoi revenir au hub améliore la simulation (renforce la priorité du hub).

Actions prioritaires:
- 1) Optimiser title et meta du hub (tester 2-3 variantes orientées bénéfice/CTA et chiffres). Impact: immédiat sur CTR en SERP, faible coût technique.
- 2) Améliorer l’UX au-dessus de la ligne de flottaison : afficher le simulateur + résultats exemples + presets et réduire le temps de saisie. Impact: augmente conversions internes et signaux utilisateur, coût moyen.
- 3) Renforcer le maillage hub↔satellites et implémenter FAQ/schema : créer liens contextuels, ancres exact-match et schema FAQ/SoftwareApplication pour rich snippets. Impact: boost du CTR organique et gain de positions via meilleure compréhension sémantique, coût moyen/technique.

## /pages/salaire-brut-net-calcul-2026
- URL: https://www.lescalculateurs.fr/pages/salaire-brut-net-calcul-2026
- Fichier local: `src\pages\salaire-brut-net-calcul-2026.html`
- Title actuel: Salaire brut net 2026 : simulateur + prélèvement à la source
- Meta actuelle: Convertissez votre salaire brut en net 2026 et estimez le net après impôt (PAS).
- CTR 28j: 0.03% (1/2962)
- CTR 7j: 0.00% (0/105)

Diagnostic:
La page hub reçoit beaucoup d'impressions mais presque aucun clic parce que le snippet actuel est trop générique et peu attractif pour l'internaute : title et meta manquent d'appel à l'action, d'éléments différenciants (gratuit, simulateur instantané, résultat chiffré) et de preuves (exemples rapides, FAQ). En plus : il n'y a aucune page satellite liée pour renforcer l'autorité sémantique et proposer des entrées plus précises ; l'absence de balisage FAQ/HowTo ou de données structurées empêche l'apparition de rich snippets attractifs ; la copie visible dans les SERP n'indique pas clairement le bénéfice immédiat (ex. résultat en 1 clic, calcul conforme 2026). Enfin, le contenu extrait est long et décousu pour un meta snippet — ne met pas en avant la valeur utilisateur (simuler son net après impôt/prélèvement à la source) ni d'exemples chiffrés convaincants. Résultat : bon positionnement pour une requête large mais faible pertinence perçue et peu d'incitation au clic.

Titles proposes:
- Simulateur salaire brut → net 2026 — Calcul instantané & prélèvement à la source
- Salaire brut en net 2026 (gratuit) : calculez votre net après impôt en 1 clic
- Convertir brut en net 2026 — Simulateur officiel, cadre / non-cadre / fonctionnaire

Metas proposees:
- Calculez gratuitement votre salaire net 2026 à partir du brut. Simulateur instantané (cadre, non-cadre, fonctionnaire) avec prise en compte du prélèvement à la source et des cotisations 2026. Exemple : 2 500 € brut → ~1 950 € net. Essayez maintenant.
- Simulateur salaire brut → net 2026 : obtenez votre net mensuel et net après impôt en quelques secondes. Méthode transparente, taux URSSAF & AGIRC-ARRCO 2026. Mode d'emploi et tableau de conversion inclus.

Quick wins UX:
- Placer le simulateur interactif visible 'above the fold' (champ brut, statut, fréquence) + bouton clair « Calculer mon net » et afficher le résultat instantanément avec un exemple chiffré (ex. 2 500 € brut → 1 950 € net).
- Ajouter une section FAQ/HowTo concise (questions fréquentes : comment le PAS est appliqué, différence cadre/non-cadre, SMIC) et baliser en JSON-LD pour obtenir rich snippets.
- Intégrer un tableau résumé de conversion (brut → net) + 3 exemples rapides (SMIC, salaire moyen, 2 500€) et un bouton 'Partager / Télécharger' pour augmenter l'engagement et le CTR.

Recommandations de maillage:
- Créer 3 pages satellites et les lier depuis le hub : 1) Simulateur détaillé cadre vs non-cadre, 2) Explication du prélèvement à la source 2026 (comment il impacte le net), 3) Méthodologie & taux URSSAF/AGIRC-ARRCO 2026. Chaque lien doit utiliser un anchor text naturel (ex. « simulateur cadre/non-cadre », « prélèvement à la source 2026 », « méthode de calcul 2026 »).
- Dans chaque page satellite, placer un lien de retour vers le hub avec anchor text orienté conversion (ex. « Calculer votre net maintenant ») et le module de simulateur intégré pour remonter le trafic vers le hub.
- Créer un bloc 'Voir aussi' contextuel sur le hub listant les satellites avec micro-descriptions (1 ligne) et prioriser les liens internes dans le premier écran pour capter l'intention précise des utilisateurs.

Actions prioritaires:
- 1) Refaire title + meta pour améliorer l'attractivité (CTA + bénéfice chiffré) et ajouter balisage FAQ/HowTo JSON-LD — impact élevé et gains rapides en CTR + possibilité de rich snippets.
- 2) Mettre le simulateur en haut de page (UX) avec résultats immédiats et exemples pré-remplis — augmente la conversion organique et le temps sur page.
- 3) Créer et lier 3 pages satellites ciblées (cadre/non-cadre, prélèvement à la source, méthode/taux 2026) pour renforcer la topicalité, améliorer le maillage et capter des requêtes longues complémentaires.

## /pages/notaire
- URL: https://www.lescalculateurs.fr/pages/notaire
- Fichier local: `src\pages\notaire.html`
- Title actuel: Simulateur frais de notaire 2026 : ancien, neuf et departement
- Meta actuelle: Estimez vos frais de notaire en 2026 selon le prix du bien, l
- CTR 28j: 0.57% (32/5608)
- CTR 7j: 0.59% (12/2039)
- Pages satellites associees:
- /pages/notaire/frais-notaire-neuf-2026 | impr28=162 | clics28=0 | ctr28=0.00% | pos28=4.88
- /pages/notaire/frais-notaire-ancien-2026 | impr28=105 | clics28=0 | ctr28=0.00% | pos28=3.02

Diagnostic:
Le hub reçoit beaucoup d'impressions mais très peu de clics : le titre et la meta actuels sont trop génériques et partiellement tronqués, ils n'expriment pas de bénéfice différenciant ni d'appel à l'action clair. Le snippet ne met pas en avant l'outil interactif (simulateur immédiat), les arguments concrets (pourcentages, économies, durée) ni la source de confiance (Notaires.fr). L'extrait contient des répétitions et manque de microformat/FAQ pour capter plus d'espace dans les SERP. Les pages satellites existent mais ne sont pas suffisamment mises en valeur dans le hub (maillage faible ou peu engageant), d'où 0 clics malgré des positions correctes. Enfin, possible manque de balisage structuré (FAQ/breadcrumb) et d'accroche visuelle au-dessus de la ligne de flottaison (CTA net), ce qui réduit la conversion depuis la SERP et la navigation interne.

Titles proposes:
- Simulateur frais de notaire 2026 — Estimation instantanée (ancien & neuf, par département)
- Calculez vos frais de notaire 2026 en 30s | Ancien, Neuf & Montant par département
- Frais de notaire 2026 : estimation fiable par prix, type (ancien/neuf) et département

Metas proposees:
- Estimez en quelques secondes vos frais de notaire 2026 selon le prix du bien, l'achat (ancien ou neuf) et le département. Simulation gratuite et barèmes officiels 2026 — lancer la simulation.
- Simulateur fiable basé sur les barèmes 2026 : calculez vos frais de notaire pour un bien ancien ou neuf et comparez par département. Résultat immédiat, source Notaires.fr.

Quick wins UX:
- Placer un CTA unique et visible « Lancer la simulation » au-dessus de la ligne de flottaison avec un résumé chiffré (ex. « ≈ 7–8 % pour l'ancien ») pour capter l'intention rapide.
- Ajouter un champ rapide « Exemple rapide » (prix prérempli 200k/300k/400k) pour obtenir un résultat en 1 clic et démontrer la valeur immédiate du simulateur.
- Afficher un bandeau de confiance proche du CTA : icône Notaires.fr + date de mise à jour (ex. « Barèmes officiels 2026 — vérifié le 24/02/2026 ») et micro-FAQ (questions courtes) en JSON-LD pour enrichir le snippet.

Recommandations de maillage:
- Dans le hub, créer un bloc « Comparer : Neuf vs Ancien » avec deux boutons très visibles menant vers /pages/notaire/frais-notaire-neuf-2026 et /pages/notaire/frais-notaire-ancien-2026 avec ancre explicite (ex. « Frais notaire neuf — calcul détaillé »).
- Sur chaque page satellite, ajouter en haut un lien contextuel « Retour au simulateur global » + un petit widget montrant l'estimation sommaire du hub pour encourager la navigation bidirectionnelle.
- Intégrer un bloc FAQ commun au hub listant 5 questions clés, chaque réponse renvoyant vers la page satellite pertinente (ex. question sur différences frais ancien/neuf renvoyant vers la page correspondante).

Actions prioritaires:
- Haute impact — Rewriting du title et de la meta du hub (choisir une des suggestions ci‑dessus) + ajout de balisage FAQ/Breadcrumb en JSON-LD pour augmenter la surface du snippet et le taux de clic.
- Moyen impact — Réorganiser la page au‑dessus de la ligne de flottaison : CTA « Lancer la simulation », exemples préremplis, bandeau de confiance Notaires.fr et résumé chiffré pour capter les clics rapides depuis la SERP.
- Moyen/Élevé impact — Renforcer le maillage hub→satellites et satellites→hub : blocs comparatifs, ancres explicites, liens dans FAQ; optimiser les titles/meta des satellites pour ciblage longue traîne (ex. « frais notaire neuf 2026 par département ») afin d'exploiter les impressions existantes.

