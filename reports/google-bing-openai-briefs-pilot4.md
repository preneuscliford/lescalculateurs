# Briefs Claude - Priorites Google + Bing (2026-04-19T08:19:05.699Z)

## Parametres
- Input: `reports\google-bing-merged-priority-latest.json`
- Modele OpenAI: `gpt-5-mini`
- Pages analysees: `4`

## /pages/impot
- Fichier local: `src\pages\impot.html`
- Type: hub_or_pillar
- Score fusionne: 4504.58
- Resume priorite: Bing renvoie du trafic (≈28k impressions) mais CTR faible (0,85%) malgré position moyenne 6.3. Prioriser correction du title/meta + hero (réponse directe/featured snippet) pour améliorer CTR, garder ton prudent YMYL (mention "estimation indicative" et lien vers impots.gouv.fr). Injecter les requêtes Bing principales ('simulateur impôts 2026', 'simulation impôts 2026', 'calcul impôts 2026') de manière naturelle dans title, meta, H1/H2, CTA, FAQ et ancres internes.

Zones a corriger:
- Title (balise <title>): Titre actuel long et verbeux ; ne contient pas exactement la requête principale sous sa forme la plus cherchée. CTR faible ; title doit être attractif et contenir 'simulateur impôts 2026'.
  Pourquoi: Le title est la première chose vue par l'utilisateur dans les SERP. Améliorer pertinence + promesse claire augmente le CTR depuis Bing/Google sans changer le ranking.
  Instruction Claude: Remplacer par un title court (50–65 caractères) intégrant la requête principale. Exemples sûrs à proposer (ne pas promettre certitudes) :
- "Simulateur impôts 2026 — Estimez votre impôt sur le revenu (indicatif)"
- "Simulateur impôts 2026 gratuit — Calculer votre impôt 2026"
Conserver la mention 'indicatif' pour respecter YMYL. Ne pas ajouter d'appel agressif "garanti".
- Meta description: Meta actuelle tronquée et incomplète. Ne met pas en valeur la proposition (outil, gratuit, indicatif, vérification officielle).
  Pourquoi: La meta influence fortement le CTR et la compréhension immédiate de la page dans les résultats de recherche.
  Instruction Claude: Écrire une meta complète (120–155 caractères) qui contient 1–2 mots-clés prioritaires et une CTA douce. Exemple :
"Simulateur impôts 2026 gratuit et indicatif : calculez votre impôt sur le revenu selon revenu imposable, parts et décote. Résultat indicatif — vérifier sur impots.gouv.fr."
Placer 'simulateur impôts 2026' ou 'simulation impôts 2026' en début si possible.
- Hero / Above the fold (bloc principal + H1): H1 actuel pertinent mais le terme 'simulateur' n'apparaît pas immédiatement dans le hero visuel. Le message ne capte pas assez la requête de recherche (simulateur/simulation) et l'UX pour lancer le calcul n'est pas explicite.
  Pourquoi: Les visiteurs depuis Bing veulent souvent lancer tout de suite une simulation. Si le hero ne communique pas 'lancez la simulation', taux de rebond et abandon augmentent.
  Instruction Claude: Conserver H1 mais rapprocher/ajouter la formulation utilisateur orientée 'simulateur'. Exemple : garder H1 "Impôt sur le revenu 2026 : estimez combien vous allez payer" et ajouter un sous-titre court juste en dessous : "Simulateur impôts 2026 — testez en 1 minute (résultat indicatif)". Rendre visible le bouton CTA principal à côté du hero ('Estimer mon impôt (gratuit, indicatif)').
- Réponse directe / Featured snippet: La page ne propose pas de réponse directe compacte et structurée (boîte de résultats rapides) utilisable comme featured snippet. Actuellement beaucoup de texte d'accroche mais pas de 'answer box' synthétique.
  Pourquoi: Une réponse directe courte augmente les chances d'obtenir un featured snippet et d'améliorer CTR/visibilité sur Bing/Google pour des requêtes comme 'calcul impôts 2026' ou 'simulation impôts 2026'.
  Instruction Claude: Ajouter juste après le hero un encart 'Réponse rapide' de 2–3 phrases + 3 lignes de synthèse de la méthode (sans taux exacts si non sourcés) et un mini-exemple chiffré clairement marqué 'exemple indicatif' (avec source/arrondi). Exemple de structure :
- Ligne 1 (one-liner) : "Estimation rapide : entrez votre revenu imposable et vos parts — le simulateur applique le barème progressif et la décote pour donner un résultat indicatif."
- Lignes 2–3 (étapes) : "1) Divisez le revenu par le nombre de parts ; 2) appliquez le barème progressif ; 3) multipliez par les parts et appliquez décote/crédits."
Insister sur 'résultat indicatif' et lien vers impots.gouv.fr. Si vous ajoutez un exemple chiffré, précisez source ou 'illustration uniquement'.
- CTA principal (bouton Estimer): CTA existant générique ; wording et visibilité peuvent être améliorés pour le CTR depuis SERP et la page d'accueil interne.
  Pourquoi: Un CTA clair et rassurant augmente le taux de conversion des visiteurs organiques en utilisateurs du simulateur.
  Instruction Claude: Remplacer/affiner le libellé CTA : 'Estimer mon impôt (gratuit, indicatif)'. Placer un second CTA de secours 'Exemple rapide' qui pré-remplit le calcul pour montrer le fonctionnement. Ajouter aria-label et tracking click event (dataLayer) pour mesurer conversions.
- Bloc calcul / UI du simulateur: Vérifier que le bloc calcul : 1) affiche un récapitulatif clair (revenu imposable, parts, montant d'impôt), 2) fournit un détail de calcul ligne par ligne, 3) inclut disclaimer et lien vers impots.gouv.fr, 4) est accessible et rapide à utiliser. Le libellé et la granularité des résultats peuvent être insuffisants pour convaincre l'utilisateur YMYL.
  Pourquoi: Pour YMYL, la transparence du calcul et la possibilité de vérifier chaque étape renforcent la confiance et réduisent les retours négatifs / rebonds.
  Instruction Claude: 1) Afficher sous le résultat un 'Détail du calcul' avec : revenu imposable, quotient familial (revenu/parts), imposition par tranche (valeurs arrondies) si vous les avez sourcées, montant avant/ après décote/crédit. 2) Toujours afficher 'Estimation indicative — vérifier sur impots.gouv.fr' avec lien. 3) Proposer bouton 'Télécharger le détail' (PDF) et bouton 'Comparer un autre scénario' qui copie les valeurs dans le formulaire. 4) Vérifier libellés pour accessibilité (labels, placeholders) et temps de calcul minimal.
- H2 et structure des sous-titres: H2 actuels longs et parfois redondants. Ils doivent intégrer des variantes de requêtes Bing et clarifier l'intention (guide, cas pratique, FAQ).
  Pourquoi: Une structure Hn claire aide le crawl, le passage en featured snippet et la compréhension rapide en SERP.
  Instruction Claude: Réordonner/renommer certains H2 en gardant le contenu existant :
- H2 A : "Comment fonctionne le simulateur impôts 2026" (inclure étapes en bref)
- H2 B : "Exemples de simulation impôt 2026" (préremplis 2–3 cas simples)
- H2 C : "Tranches 2026 et décote — ce qui change" (si vous affichez les tranches, sourcer)
Conserver balisage sémantique et ajouter ancres pour internal linking.
- FAQ: Peu ou pas de FAQ exploitant les requêtes longues de Bing. Pas de FAQ structurée (schema) déclarée dans la page.
  Pourquoi: FAQ ciblées avec balisage peuvent capter plus d'impressions/CTR et servir pour les snippets. Elles répondent aux micro-intentions (simulateur vs calcul vs tranches).
  Instruction Claude: Ajouter 6–8 Q courtes ciblées incluant les mots-clés :
- 'Comment fonctionne le simulateur impôts 2026 ?' (réponse courte + lien vers méthode)
- 'Quelle différence entre revenu brut et revenu imposable ?'
- 'Ce simulateur est-il fiable pour ma déclaration ?' (réponse YMYL prudente)
- 'Où vérifier le montant définitif ?' (réponse : impots.gouv.fr)
Inclure FAQ schema JSON-LD. Rester prudent : rappeler que l'outil fournit une estimation à titre indicatif.

Keywords Bing a injecter:
- simulateur impôts 2026 -> title, meta, hero subtitle, CTA, internal anchor text (Priorité 1. Intégrer exactement la requête dans le title et la meta pour capter les impressions Bing. Utiliser aussi comme ancre interne sur pages hub.)
- simulation impôts 2026 -> FAQ question, H2 secondaire, meta si possible (Bonne variante — utiliser dans FAQ et H2 'Exemples de simulation impôts 2026'.)
- calcul impôts 2026 -> réponse directe (featured snippet), H2 'Comment ça marche', paragraphes explicatifs (Utiliser pour la partie méthode et pour le court encadré 'Réponse rapide : comment se fait le calcul'.)
- simulateur impots -> CTA, anchor text internes (Variante sans accent utile pour certaines requêtes ; utiliser dans ancres et microcopy.)
- simulation impôt 2026 -> FAQ, micro-titres (Variante singulière à insérer dans une ou deux FAQ.)

Safe changes first:
- Corriger la meta description complète et non tronquée (120–155 caractères) avec mention 'indicatif' et lien de vérification.
- Modifier le title pour inclure 'Simulateur impôts 2026' (50–65 caractères).
- Rapprocher un CTA visible 'Estimer mon impôt (gratuit, indicatif)' dans le hero.
- Ajouter un encart 'Réponse rapide' (2–3 phrases) juste en dessous du hero.
- Ajouter FAQ courte et activer le balisage JSON-LD FAQ schema.

Brief Claude:
- Objectif: Augmenter le CTR et le nombre de clics depuis Bing/Google en alignant title/meta/hero sur les requêtes prioritaires tout en respectant les contraintes YMYL (rappel constant que le résultat est indicatif et vérifiable sur impots.gouv.fr). Obtenir potentiel featured snippet pour 'calcul impôts 2026'/'simulateur impôts 2026'.
- A conserver:
  - La mention claire 'Estimation indicative' ou formulation similaire
  - Le lien de vérification vers impots.gouv.fr
  - Les explications détaillées existantes (méthodologie) — ne pas supprimer
  - Accessibilité du simulateur et la possibilité de comparer plusieurs scénarios
- A corriger:
  - Title : remplacer par une version courte contenant 'simulateur impôts 2026'.
  - Meta description : corriger la phrase tronquée et inclure CTA doux + mention 'indicatif'.
  - Hero : rapprocher wording 'simulateur' et rendre CTA immédiatement visible.
  - Réponse directe : ajouter un encart synthétique (méthode + mini-exemple indicatif) utilisable comme featured snippet.
  - Bloc calcul : afficher détail du calcul (étapes + récapitulatif) et bouton 'Comparer un autre scénario'.
  - FAQ : ajouter questions ciblées et déployer FAQ schema JSON-LD.
  - Maillage : ajouter ancres internes depuis hub principal et libellés d'ancre contenant les mots-clés prioritaires.

## /pages/salaire-brut-net-calcul-2026
- Fichier local: `src\pages\salaire-brut-net-calcul-2026.html`
- Type: hub_or_pillar
- Score fusionne: 1407.52
- Resume priorite: Faible CTR malgré positions élevées : corriger title/meta, H1/hero, réponse directe (featured-snippet), CTA et les signaux YMYL (méthodo + sources). Injecter variantes exactes Bing (« brut en net 2026 », « salaire brut en net 2026 », « calcul salaire brut en net 2026 ») dans les zones hautes de la page. Ajouter disclaimers clairs et sources URSSAF pour réduire risque YMYL.

Zones a corriger:
- Title: Trop promotionnel, emojis, formulation longue. N'inclut pas exactement les requêtes Bing les plus fréquentes (ex: « brut en net 2026 »).
  Pourquoi: Le title est le premier élément vu dans SERP — une formulation plus exacte + ciblée augmente le CTR sur les requêtes observées (Bing). Éviter promesses absolues sur une page YMYL.
  Instruction Claude: Proposer 2 variantes de title courtes (<= 60 caractères) intégrant les mots-clés prioritaires. Exemples sûrs :
1) "Brut en net 2026 — Calculateur salaire brut → net"
2) "Calcul salaire brut en net 2026 | Simulateur gratuit"
Remplacer l'actuel title par l'une de ces variantes. Retirer emojis et formules comme "100% fiable".
- Meta description: Trop promotionnelle et longue, pas d'appel à l'action précis et pas d'indication de fiabilité/sources; n'utilise pas clairement les requêtes Bing.
  Pourquoi: Meta bien écrite augmente CTR et aligne l'attente de l'utilisateur (important en YMYL). Doit contenir mot-clé principal et inciter à cliquer sans promesses absolues.
  Instruction Claude: Remplacer par une meta concise (~150-160 caractères) incluant un mot-clé Bing. Exemple : "Calculez rapidement votre salaire brut en net 2026 (cadre, non-cadre, fonctionnaire). Méthode basée sur les cotisations URSSAF 2026. Calculer maintenant."
- H1 / Hero (visible au-dessus de la ligne de flottaison): H1 peu keywordisé et wording trop marketing. Hero actuel contient emojis, promesses et éléments distrayants; absence d'une réponse directe (conversion exemple immédiat) en texte clair et sourcé.
  Pourquoi: H1/hero doivent répondre immédiatement à l'intention (featured snippet). Une phrase claire + exemple chiffré améliore CTR organique et expérience utilisateur.
  Instruction Claude: Remplacer H1 par une version exacte pour le SEO : "Calcul salaire brut en net 2026" ou "Brut en net 2026 — calculateur". Immédiatement sous le H1 afficher une ligne de réponse directe, neutre et sourcée : "Ex. : 2 500 € brut mensuel → ≈ 1 950 € net (non‑cadre, estimation basée sur cotisations 2026)." Ajouter un petit disclaimer : "Estimation indicative — méthode & sources en bas de page (URSSAF)."
- Réponse directe / Featured snippet zone: Pas de bloc clair et concis répondant aux requêtes type « brut en net 2026 » avec chiffres et méthode résumée; le contenu actuel est verbeux et promotionnel.
  Pourquoi: Google/Bing favorisent un paragraphe court + exemple chiffré pour featured snippet et pour CTR sur requêtes transactionnelles/informationnelles.
  Instruction Claude: Insérer un encadré 1-2 phrases + 1 ligne d'exemple en texte HTML simple (pas d'images) au-dessus du fold : 
"Brut en net 2026 : pour un salaire brut mensuel de 2 500 €, comptez ≈ 1 950 € net (non‑cadre). Estimation basée sur taux de cotisations employé ~22–23% et prélèvement à la source 2026. Voir méthode détaillée ci‑dessous."
- CTA principal: CTA existant ('Calculer maintenant') est présent mais noyé dans le design et accompagné de revendications fortes; peut manquer de contraste ou position stratégique.
  Pourquoi: CTA clair et visible augmente l'interaction avec le simulateur (mesure d'engagement utile pour SEO). Dans une page YMYL, le CTA doit être factuel et non trompeur.
  Instruction Claude: Rendre CTA principal proéminent et textuellement précis : 'Lancer le calcul (estimation)'. Placer un second petit CTA texte à côté : 'Voir la méthode & sources'. Ne plus utiliser termes absolus comme 'GRATUIT' en gros ou '100% fiable'.
- Bloc calcul / hypothèses: Hypothèses de calcul peu visibles et absence d'explications méthodologiques précises; pas d'indication des limites de l'estimation.
  Pourquoi: Page YMYL doit expliciter sources et méthode pour crédibilité (E-A-T). Les utilisateurs et moteurs veulent savoir les hypothèses (taux, assiette, cadre/non-cadre, prélèvement à la source).
  Instruction Claude: Ajouter un sous‑bloc 'Méthode et hypothèses' proche du haut (ou ancre visible) listant : taux pris (URSSAF 2026), distinction cadre/non‑cadre/fonctionnaire, si calcul mensuel/annuel, prise en compte ou non des congés payés/avantages. Inclure lien direct vers source officielle URSSAF + BOFiP si pertinent. Mentionner marge d'erreur (ex : 'estimation ± X% selon situation').
- FAQ (schema + contenu): FAQ inexistante ou mal structurée; pas d'utilisation explicite des mots-clés Bing dans les Q; pas de balisage FAQ schema.
  Pourquoi: FAQ ciblée améliore présence en SERP et capte clics sur questions fréquentes. Le balisage FAQ augmente chances d'extrait enrichi. Important pour YMYL d'apporter réponses neutres et sourcées.
  Instruction Claude: Ajouter 6-8 questions courtes en FAQ, incluant les requêtes Bing. Exemples de Q : 'Comment convertir brut en net 2026 ?', 'Quelle différence brut/net 2026 pour un cadre ?', 'Comment le prélèvement à la source impacte‑t‑il mon net 2026 ?' Fournir réponses courtes (1-3 phrases) avec renvoi vers méthodo + sources. Implémenter FAQ schema JSON‑LD.
- Maillage interne (liens en entrée/sortie): Peu de liens internes orientant vers pages d'autorité (URSSAF, impôt) ou vers le hub. Le hub/pilier doit renvoyer clairement aux pages enfants et vice versa.
  Pourquoi: Un maillage interne cohérent renforce la topicalité du hub et aide Google/Bing à comprendre la structure thématique; améliore position sur requêtes longues.
  Instruction Claude: Ajouter/optimiser liens internes : vers page hub 'Simulateurs paie', article 'Cotisations URSSAF 2026', page 'Prélèvement à la source 2026' et vers articles détaillés (SMIC 2026, charges cadre vs non‑cadre). Sur ces pages, ajouter un lien retour explicite vers la page cible (anchor text : 'calcul salaire brut en net 2026' ou 'brut en net 2026').

Keywords Bing a injecter:
- brut en net 2026 -> Title, H1, première phrase (encadré réponse directe), FAQ question (Mot-clé principal à viser pour capter le volume Bing (impr=1029). Utiliser la forme exacte dans les zones hautes.)
- salaire brut en net 2026 -> Meta description, H1 alternative, CTA (Bonne variation de recherche (impr=386). Mettre en meta et CTA pour améliorer CTR et cohérence sémantique.)
- calcul brut en net 2026 -> Titre de la section « Méthode », FAQ, balise H2 (Cible utilisateurs cherchant la méthode exacte. Utiliser dans l'ancre 'Méthode de calcul'.)
- calcul salaire brut en net 2026 -> Tableau de conversion caption, H2 du bloc calcul (Formulation longue utile pour featured snippet et pour les titres d'images/tableaux.)
- salaire brut net 2026 -> URL canonique (si possible), alt texte d'image, FAQ (Petite recherche (impr=133) ; utile en variation dans contenus visuels et microcopy.)

Safe changes first:
- Changer title et meta description par variantes proposées (sans toucher au code du simulateur).
- Remplacer H1 par formulation keywordisée.
- Ajouter encadré de réponse directe au‑dessus du fold (texte simple).
- Rendre CTA unique plus lisible et modifier le libellé en 'Lancer le calcul (estimation)'.
- Ajouter 1 paragraphe 'Méthode & sources' avec lien URSSAF et mention d'estimation.

Brief Claude:
- Objectif: Améliorer CTR et confiance utilisateur sur la page pilier 'salaire brut → net 2026' en corrigeant micro-éléments SEO (title/meta/H1), en fournissant une réponse directe chiffrée et en clarifiant la méthodologie/sources (YMYL). Cibler explicitement les requêtes Bing listées pour remonter CTR et position sur ces variantes.
- A conserver:
  - Le simulateur interactif existant (ne pas le remplacer).
  - Exemples chiffrés déjà présents (ex : 2 500 € brut → ~1 950 € net) mais repositionner comme réponse directe neutre.
  - Mention année 2026 et prise en compte du prélèvement à la source.
  - Tableaux de conversion (garder mais sémantiser).
- A corriger:
  - Retirer formulations trop promotionnelles ou absolues (ex: '100% fiable', 'GRATUIT' en gros).
  - Rendre visible et explicite la méthodologie + sources officielles (URSSAF, BOFiP si utile).
  - Insérer un encadré de réponse directe au‑dessus du fold avec conversion exemple et disclaimer clair.
  - Utiliser les requêtes Bing exactes dans title, H1, meta, H2 et FAQ sans keyword stuffing.
  - Ajouter FAQ structurée et marquage JSON‑LD pour FAQ (réponses courtes et sourcées).

## /pages/blog/frais-notaire-ancien-neuf-2026
- Fichier local: `src\pages\blog\frais-notaire-ancien-neuf-2026.html`
- Type: pseo
- Score fusionne: 950.68
- Resume priorite: Améliorer le CTR et la visibilité snippet en donnant une réponse directe chiffrée en haut de page, corriger le Title et la Meta (actuelle incomplète), rendre le calcul transparent avec un exemple concret et relier clairement la page au hub/outil de simulation. Priorité 1 = Title / Meta / Réponse directe / CTA vers simulateur. Priorité 2 = Bloc de calcul (transparence + sources), FAQ structurée (FAQPage schema), maillage vers hub et sources officielles.

Zones a corriger:
- Title: Titre correct mais trop générique et peu orienté CTR/snippet ; ne contient pas un exemple chiffré ni formulation promesse claire.
  Pourquoi: Le titre est le premier levier de CTR dans Google/Bing. Un titre plus orienté promesse (chiffres + estimation) augmente la probabilité de clic et la possibilité d'obtenir un featured snippet.
  Instruction Claude: Propose 2 variantes concises (<= 60 caractères visibles) optimisées pour CTR et pour la requête 'frais de notaire ancien neuf 2026'. Inclure l'année 2026 et un signal chiffré/valeur indicative. Exemples acceptables :
- 'Frais de notaire 2026 — Ancien vs Neuf : estimation (ex. 250k€)'
- 'Frais de notaire ancien vs neuf (2026) — Ex. chiffré & calcul'
Ne pas faire de promesse exacte. Conserver ton style factuel et la mention 'estimation indicative' dans la meta (mais pas forcément dans le title).
- Meta description: Meta incomplète (tronquée) et peu incitative ; n'expose pas les chiffres ni l'appel à simuler.
  Pourquoi: Meta influence le CTR depuis les SERP et doit résumer la promesse (estimation + outil). Google affichera souvent la meta si elle est pertinente.
  Instruction Claude: Remplace la meta actuelle par une version complète (120–155 caractères) qui contient : affirmation chiffrée courte (ex. '≈7–9% ancien / 2–3% neuf'), mention de l'année 2026, disclaimer 'estimation indicative', et CTA vers le simulateur. Exemple à générer : 'Frais de notaire 2026 : environ 7–9% dans l'ancien vs 2–3% dans le neuf. Exemples chiffrés et simulateur 30s — estimation indicative.'
- Hero / Extrait visible (intro au-dessus du pli): Le paragraphe d'introduction est informatif mais trop long et manque d'une réponse directe ultra courte en 1–2 lignes pour le featured snippet.
  Pourquoi: Google privilégie les réponses directes en haut de page pour featured snippets. Une phrase synthétique (réponse directe) augmente les chances d'extrait mis en avant.
  Instruction Claude: Ajouter immédiatement sous le H1 une 'réponse directe' de 1–2 phrases (2 lignes max) avec chiffres clés et un CTA bouton textuel vers le simulateur. Exemple de structure : (1) phrase synthétique 'En 2026, comptez ≈7–9% du prix dans l'ancien vs ≈2–3% dans le neuf (VEFA) — estimation indicative.' (2) une phrase courte renvoyant au simulateur 'Simulez vos frais en 30s' (bouton). Ne pas supprimer le paragraphe existant, le conserver après cette réponse directe.
- Bloc calcul (exemples chiffrés): La page annonce exemples et calculs mais il faut clarifier les formules, afficher les hypothèses et citer sources (Notaires.fr / barèmes départementaux) ; risque YMYL si chiffres présentés comme définitifs.
  Pourquoi: Les utilisateurs (et correcteurs YMYL) attendent méthodologie transparente : montrer les étapes de calcul et les sources permet d'établir confiance et de réduire les risques de désinformation.
  Instruction Claude: Vérifier et expliciter les étapes de calcul : base taxable (prix + éventuels frais), taxe de publicité foncière/droits d'enregistrement (avec fourchette), émoluments du notaire (barème), débours. Pour 1 exemple concret proposer 2 simulations rapides (prix 200k€ et 350k€) pour ancien vs neuf avec pas-à-pas : Formule + valeurs numériques + mention 'taux départementaux pris en compte : X% (ex. département Y)'. Ajouter lien source vers Notaires.fr pour les barèmes et préciser 'estimation indicative'. Si tu fournis valeurs, arrondir et afficher intervalle (ex. '≈7,2% → 14 400€').
- Réponse directe / Featured snippet: Manque de bloc 'réponse courte' formaté pour featured snippet (1 phrase + petit tableau/ligne).
  Pourquoi: Le format précis (question + réponse courte + chiffres) augmente fortement la possibilité d'obtenir un featured snippet pour des requêtes comparatives.
  Instruction Claude: Créer un bloc HTML simple en haut de l'article contenant : question compacte (H2 ou span), puis 1 ligne réponse 'Ancien : ≈7–9% du prix / Neuf (VEFA) : ≈2–3% du prix (2026) — estimation indicative', puis un mini tableau 2 colonnes (Ancien / Neuf) avec 1 exemple chiffré pour un prix type (ex. 250 000€ → X€ / Y€). Le texte doit rester prudent et sourcé.
- CTA / Simulateur: Le CTA 'Simulez vos frais en 30 secondes' est présent mais pas suffisamment mis en valeur ni répété au-dessus et sous le pli ; pas de lien clair vers le hub.
  Pourquoi: Pour une page pSEO l'objectif de conversion (outil/simulateur) doit être évident pour capter les clics internes et diminuer le bounce. Le simulateur est aussi utile pour les snippets 'calculate'.
  Instruction Claude: Rendre le CTA visible dès la réponse directe (bouton, texte d'ancrage) et répéter en fin d'article. Ajouter aussi une invitation au hub/pilier 'En savoir plus : notre dossier hub Immobilier' avec lien interne vers la page hub principale. S'assurer que le lien ouvre la page de simulateur en ancre ou nouvelle page selon l'UX.
- FAQ: FAQ existante mais probablement trop générique ; pas de balisage structuré FAQ schema et manque de questions orientées 'snippet' (ex. 'Combien de frais de notaire pour 250 000€ ?').
  Pourquoi: FAQ structurée augmente les chances d'extraits enrichis (rich results) et répond à questions fréquentes des utilisateurs, améliorant CTR et satisfaction. Pour YMYL, les réponses doivent rester prudentes et sourcées.
  Instruction Claude: Ajouter 6–8 questions courtes orientées utilisateurs et featured snippets : ex. 'Quels sont les frais de notaire pour un achat ancien à 250 000€ ?', 'Comment réduire les frais de notaire ?', 'Que comprend la TVA dans le neuf ?'. Fournir réponses courtes (1–2 phrases), chiffrées pour 1–2 Q si possible, toujours avec 'estimation indicative' et lien source. Implémenter FAQPage JSON-LD. Ne pas faire de promesses (pas 'économisez X€ garanti').
- Maillage interne (liens): Manque de lien visible vers le hub / pilier et vers sources officielles (Notaires.fr, service-public.fr).
  Pourquoi: Le pSEO doit renvoyer au hub/pilier pour consolider l'autorité thématique et aider Google à comprendre le positionnement. Les sources officielles renforcent l'E-A-T (YMYL).
  Instruction Claude: Insérer 2 liens internes : (1) lien vers la page hub Immobilier (onglet 'guide frais' ou équivalent), (2) lien vers l'outil de simulation. Ajouter 2 liens externes vers Notaires.fr (barèmes) et service-public.fr (droits d'enregistrement) et indiquer la date des sources (ex. 'Barème Notaires.fr — consulté Jan 2026').

Keywords Bing a injecter:
-  ->  (Bing n'a fourni aucun signal utile à injecter pour cette page. Se concentrer sur Google featured snippet et pSEO.)
- (aucun) -> n/a (Aucun mot-clé Bing fourni.)

Safe changes first:
- Corriger la meta description complète et le Title (tests A/B possibles).
- Ajouter une 'réponse directe' synthétique sous le H1 (1–2 phrases).
- Mettre en avant le CTA 'Simulez vos frais en 30s' en haut de page et en fin d'article.
- Ajouter ou mettre à jour les liens vers Notaires.fr et vers le hub interne.
- Structurer la FAQ et ajouter JSON-LD FAQPage (non intrusif).

Brief Claude:
- Objectif: Augmenter le CTR et la probabilité de featured snippet en donnant une réponse directe chiffrée, clarifier le calcul des frais (exemples transparents) et convertir vers le simulateur/hub, tout en respectant les contraintes YMYL (pas de promesses et sources officielles).
- A conserver:
  - H1 existant 'Frais de notaire : ancien ou neuf en 2026 ?' (ou adapter légèrement mais conserver l'intention).
  - Le disclaimer 'estimation indicative' et mention de Notaires.fr.
  - Le simulateur existant (CTA) — il faut le mettre en avant, pas le remplacer.
  - Tous les éléments chiffrés actuels si sourcés ; sinon les marquer comme 'à vérifier'.
- A corriger:
  - Title : rendre plus attractif et contenir année + signal chiffré sans être présomptueux.
  - Meta description : corriger la troncature et inclure une phrase d'appel à simuler.
  - Ajouter une réponse directe courte et un mini-tableau d'exemple pour le featured snippet.
  - Rendre le bloc de calcul transparent (formules + hypothèses + sources) et ajouter 2 exemples concrets (prix types).
  - Renforcer le maillage vers le hub et sources officielles.
  - Structurer et baliser la FAQ (JSON-LD) pour rich results.
  - S'assurer que toutes les affirmations chiffrées sont présentées comme 'estimation indicative' et sourcées pour respecter YMYL.

## /pages/asf
- Fichier local: `src\pages\asf.html`
- Type: hub_or_pillar
- Score fusionne: 417.49
- Resume priorite: Priorité haute : (1) corriger Title + Meta pour améliorer CTR sur Google (conserver mots-clés principaux 'ASF 2026 CAF' + promesse d'estimation), (2) renforcer le hero / réponse directe au-dessus de la simulation (answer box bref, indicatif, lien CAF) pour capter featured snippet, (3) améliorer CTA et positionnement du simulateur + preuves (sources officielles CAF) pour réduire friction sur pages YMYL.

Zones a corriger:
- Title: Titre long/peu orienté CTR ; manque mention explicite « estimation indicative » et mots-clés secondaires utiles (parent isolé, pension, APL).
  Pourquoi: Le Title est le signal principal pour l'indexation et influence fortement le CTR depuis Google (actuellement CTR 1.59% malgré position ~8). Une formulation plus claire peut augmenter clics et obtenir plus d'impressions qualifiées.
  Instruction Claude: Remplace le Title actuel par une version plus concise et attractive (50–60 caractères si possible). Exemple à appliquer exactement ou adapter : "Simulation ASF 2026 (CAF) — Estimation pour parent isolé & pension". Garder 'ASF 2026' et 'CAF' au début si possible. Ne pas promettre un montant définitif ; ajouter 'Estimation' ou 'indicative' si l'espace le permet.
- Meta description: Meta incomplète/tronquée actuellement (« l » à la fin). Manque d'argumentaire pour inciter au clic (bénéfice clair + sécurité YMYL).
  Pourquoi: La meta augmente le CTR et permet d'adresser les doutes YMYL (fiabilité). Une meta claire et rassurante améliore le taux de clics et la qualité du trafic.
  Instruction Claude: Remplacer par une meta complète (120–155 caractères) avec bénéfices clairs et mention de la nature indicative + source officielle. Exemple : "Estimez votre ASF 2026 (CAF) selon situation parentale, nombre d'enfants et pension alimentaire. Résultat indicatif — décision finale CAF. Lancer la simulation."
- Hero / H1 / réponse directe: H1 bien orienté mais la zone hero manque d'une 'réponse directe' courte (featured snippet style) et d'un lien visible vers la source CAF. L'utilisateur doit comprendre en 3s ce que la page offre et sa fiabilité.
  Pourquoi: Google valorise le contenu qui répond rapidement à la requête principale (format 'quick answer'). Une phrase synthétique placée juste sous le H1 augmente les chances d'obtenir un featured snippet et réduit le taux de rebond.
  Instruction Claude: Ajouter immédiatement sous le H1 une 'réponse directe' en 1 phrase + 1 ligne d'explication. Exemple de formulation à poster telle quelle : "Résultat indicatif : calculez ici une estimation de votre ASF 2026 (CAF) selon votre statut de parent isolé, le nombre d'enfants et la présence/absence de pension alimentaire. Les organismes officiels sont décisionnaires — voir lien CAF." Inclure un lien texte visible vers la page officielle CAF sur l'ASF.
- Bloc calcul / Simulateur: UX du simulateur non précisée : pas d'exemples par défaut, pas d'explication synthétique du calcul, pas d'option 'exemple rapide' ni d'export de résultat. Risque : l'utilisateur ne lance pas le simulateur.
  Pourquoi: Le simulateur est le coeur de la page. Pour convertir la visite en interaction (clic/usage), il doit être simple, rassurant (messages YMYL) et proposer cas concrets qui couvrent les requêtes principales (parent isolé, sans pension, cumul APL).
  Instruction Claude: 1) Ajouter 3 boutons d'exemples rapides au-dessus du simulateur : 'Parent isolé, 1 enfant, pas de pension', 'Parent isolé, 2 enfants, pension partielle', 'Orphelin / enfant placé'. Ces exemples remplissent automatiquement les champs. 2) Afficher juste au-dessus du résultat une mini-explication : 'Montant estimé = barème CAF par enfant + majoration parent isolé - prise en compte ressources'. 3) Afficher un petit label orange : 'Estimation indicative — CAF seul décisionnaire' + lien vers CAF. 4) Permettre export PDF ou copie du résultat et bouton 'Comment demander à la CAF' (lien vers formulaire officiel).
- CTA principal: Texte actuel 'Lancer la simulation ASF' est neutre ; pas assez rassurant sur la nature indicative ni orienté conversion pour YMYL.
  Pourquoi: Un CTA clair + confiance explicite augmente les taux d'utilisation du simulateur et diminue les hésitations sur les sujets financiers/socials.
  Instruction Claude: Remplacer le libellé CTA par une variante plus engageante et rassurante, par exemple : 'Lancer la simulation (estimation indicative)'. Ajouter un CTA secondaire 'Voir conditions & barèmes CAF' à droite/bas du bloc pour les utilisateurs cherchant la source officielle.
- FAQ: Présence de FAQ, mais questions/réponses peuvent être trop longues/techniques ou manquer de sources. Manque d'optimisation pour featured snippets et pour requêtes YMYL fréquentes.
  Pourquoi: La FAQ bien structurée améliore la visibilité organique (rich results) et permet de répondre aux micro-requêtes des utilisateurs (ex. 'Qui a droit à l'ASF ?', 'Cumul APL et ASF ?').
  Instruction Claude: Restructurer la FAQ en 6–8 Q/R courtes (max 2–3 phrases chacune). Priorité aux questions suivantes : 'Qui a droit à l'ASF ?', 'Comment est calculé le montant ?', 'L'ASF dépend-elle d'une pension alimentaire ?', 'Cumul ASF et APL possible ?', 'Comment faire si l'autre parent ne paie pas ?' Pour chaque réponse, ajouter 1 lien source (CAF ou texte officiel) et terminer par une ligne: 'Pour une décision officielle, consultez votre CAF.' Activer balisage FAQ schema si possible (JSON-LD).
- Maillage interne / liens sortants: Maillage insuffisant vers pages utiles du hub et vers la page CAF officielle; ancres parfois génériques. Pas de 'back link' clair vers le hub.
  Pourquoi: Un maillage réfléchi renforce la valeur pilier/hub, distribue l'autorité et guide l'utilisateur vers actions concrètes (simulateur, formulaire CAF, articles détaillés).
  Instruction Claude: 1) Ajouter 3 liens internes prioritaires visibles dans le hero ou sous le H1 avec ancres précises : 'Simulateurs (hub)', 'Barèmes CAF ASF 2026', 'Que faire si pas de pension alimentaire'. 2) Vérifier que chaque lien ouvre en same-domain et utilise un texte d'ancrage explicite. 3) Ajouter un lien sortant principal vers la page officielle CAF sur l'ASF (ou la fiche service-public) et marquer 'source officielle'.
- H2 / structure: H2 actuels très nombreux et longs ; certains H2 ressemblent à des phrases marketing plutôt qu'à des signaux sémantiques clairs.
  Pourquoi: Des H2 concis et orientés mots-clés aident Google à comprendre le contenu et facilitent le scan utilisateur. H2 clairs augmentent les chances de snippet pour sous-questions.
  Instruction Claude: Raccourcir et normaliser les H2. Exemple de H2 prioritaires : 'Comment fonctionne l'ASF (CAF) ?', 'Montants indicatifs 2026', 'Parent isolé : droit et conditions', 'Cumul avec APL', 'FAQ rapide'. Remplacer H2 très longs/fourre-tout par H2 courts et découper le contenu sous chaque H2 en blocs très scannables.

Keywords Bing a injecter:
-  ->  (Bing n'a fourni aucun mot-clé exploitable directement pour cette page — priorité reste l'optimisation sur Google et la clarté pour l'utilisateur.)
- ASF parent isolé -> H1, hero quick answer, 1 FAQ question, one example button in simulator (Bien que Bing n'ait pas fourni de signaux, ces requêtes sont celles que les utilisateurs tapent ; intégrer ces requêtes naturellement augmente la couverture sémantique.)

Safe changes first:
- Remplacer Title et Meta avec formulations conseillées (non YMYL dangereuses).
- Ajouter la 'réponse directe' (1 phrase) sous le H1 avec lien CAF.
- Changer le libellé du CTA principal pour inclure 'estimation indicative'.
- Ajouter liens internes prioritaires visibles (hub, barèmes, guide pension alimentaire).
- Raccourcir et standardiser les H2 majeurs.

Brief Claude:
- Objectif: Augmenter CTR et l'utilisation du simulateur ASF 2026 en rendant l'information directe, vérifiable et rassurante (YMYL-safe), tout en améliorant la structure pour capter featured snippets et réduire le taux de rebond.
- A conserver:
  - Mention claire 'Estimation indicative' et avertissement que CAF est décisionnaire.
  - Simulateur présent et accessible sur la page.
  - Conserver le focus sur 'parent isolé' et les cas 'absence de pension' et 'cumul APL'.
  - Ton pédagogique et prudent (éviter promesses chiffrées définitives sans source).
- A corriger:
  - Title et Meta (corriger longueur, clarté, ajouter 'estimation indicative').
  - Ajouter une réponse directe succincte sous le H1 (featured-snippet style) avec lien CAF.
  - Améliorer CTA principal + ajouter CTA secondaire vers conditions/barèmes CAF.
  - Renforcer bloc simulateur avec 3 exemples préremplis, explication de calcul en 1 ligne, export du résultat et lien vers procédure CAF.
  - Structurer et raccourcir H2, optimiser et sourcer FAQ, activer balisage FAQ si possible.
  - Ajouter maillage interne clair vers le hub et pages connexes et un lien officiel CAF.

