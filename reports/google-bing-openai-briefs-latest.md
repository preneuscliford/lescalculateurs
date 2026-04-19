# Briefs Claude - Priorites Google + Bing (2026-04-19T08:29:03.718Z)

## Parametres
- Input: `reports\google-bing-merged-priority-latest.json`
- Modele OpenAI: `gpt-5-mini`
- Pages analysees: `12`

## /pages/impot
- Fichier local: `src\pages\impot.html`
- Type: hub_or_pillar
- Score fusionne: 4504.58
- Resume priorite: Améliorer le CTR et la visibilité sur Bing en concentrant les corrections sur Title + Meta, Hero (réponse directe), CTA, bloc de calcul (transparence) et FAQ/schema. Utiliser explicitement les expressions Bing à fort volume (« simulateur impôts 2026 », « simulation impôts 2026 », « calcul impôts 2026 ») sans promettre d'exactitude (YMYL). Ajouter liens vers impots.gouv.fr et maillage depuis le hub Outils.

Zones a corriger:
- Title (balise <title>): Title actuel long et peu optimisé pour le mot-clé principal. Le mot-clé exact 'simulateur impôts 2026' n'est pas en tête et manque d'attrait pour le CTR.
  Pourquoi: Le title est le premier signal visible sur Bing/Google. Placer le mot-clé principal au début et formuler une promesse claire (sans garantie) augmente le CTR et la pertinence.
  Instruction Claude: Remplacer le title par une version courte, orientée mot-clé et CTR. Exemple proposé (ne pas réécrire au-delà) : "Simulateur impôts 2026 — estimation et calcul instantané (indicatif)". Respecter 50–70 caractères. Ne pas promettre précision absolue et conserver mention 'indicatif'.
- Meta description: Meta actuelle tronquée ('Estimez combien vous allez payer d'). Manque d'appel à l'action, mots-clés et référence officielle.
  Pourquoi: La meta influence le CTR sur les SERP Bing. Une description complète avec mot-clé, bénéfice, CTA et mention de source officielle augmente les clics et la confiance (YMYL).
  Instruction Claude: Rédiger une meta descriptive ~140–160 caractères incluant : mot-clé primaire « simulateur impôts 2026 », bénéfice (estimation rapide, comparaison de scénarios), CTA (Simuler maintenant) et rappel 'estimation indicative — vérifier sur impots.gouv.fr'. Exemple de trame : "Simulateur impôts 2026 : calculez une estimation rapide de votre impôt selon revenu, situation et parts. Simulation indicative — vérifier sur impots.gouv.fr. Simuler maintenant."
- Hero / Réponse directe (au-dessus du pli): Contenu hero informatif mais manque d'une phrase réponse claire et d'un bouton CTA visible. H1 OK mais on peut renforcer la phrase d'accroche et snippet pour featured snippet.
  Pourquoi: Les moteurs favorisent une réponse courte et lisible en haut de page (featured snippet). Un CTA clair augmente le taux de conversion vers l'outil.
  Instruction Claude: Ajouter immédiatement sous le H1 une 'réponse directe' de 1-2 phrases incluant le mot-clé principal. Exemple de modèle : "Estimez votre impôt 2026 en quelques secondes avec notre simulateur (estimation indicative). Résultat détaillé par tranches et parts fiscales." Ajouter un bouton CTA primaire 'Simuler mon impôt 2026' (texte exact incluant mot-clé) visible au-dessus du pli et un CTA secondaire 'Exemple de calcul' qui fait défiler vers le bloc exemple.
- Réponse directe / Exemple chiffré (pour featured snippet): Il n'y a pas d'exemple chiffré simple en haut montrant comment le simulateur calcule. Les pages qui gagnent le featured snippet affichent souvent un exemple rapide.
  Pourquoi: Un petit calcul d'exemple (transparent et documenté) augmente les chances d'obtenir un featured snippet et répond directement aux requêtes Bing listées (ex : 'calcul impôts 2026').
  Instruction Claude: Insérer un bloc 'Exemple' court (3–4 lignes) avec un cas concret et la méthode: tranches appliquées, quotient familial, décote si applicable. Exemple non-exhaustif et accompagné d'un avertissement : 'Exemple indicatif basé sur le barème 2026 — vérifier sur impots.gouv.fr'. Ne pas garantir l'exactitude. Format souhaité : entrée -> calcul par tranches -> résultat arrondi.
- CTA (call-to-action) et microcopy autour du simulateur: CTA existants peu standardisés (libellés variables). Pas d'ancrage textuel avec mots-clés pour SEO/CTR.
  Pourquoi: Un CTA optimisé avec texte contenant le mot-clé augmente le taux de clic interne et peut influer sur les impressions sur Bing (ancres visibles, rich snippets).
  Instruction Claude: Uniformiser CTAs : bouton primaire 'Simulateur impôts 2026 — Estimer maintenant' ; bouton secondaire 'Comparer plusieurs scénarios'. Ajouter mini-texte sous le CTA: 'Estimation indicative — résultat final sur impots.gouv.fr'. Ne pas promettre valeur définitive.
- Bloc calcul / transparence algorithmique: Le fonctionnement du simulateur est décrit sommairement; manque de transparence sur barème, tranches, et arrondis. Pas de lien direct vers la source officielle du barème.
  Pourquoi: YMYL : il faut établir confiance. Expliquer la méthode de calcul (barème 2026, quotient familial, décote) et lier à impots.gouv.fr réduit friction et risques de désinformation.
  Instruction Claude: Ajouter une sous-section 'Comment nous calculons' listant précisément : sources (lien vers la page officielle du barème 2026), tranches utilisées, application du quotient familial (expliquer plafonnement), décote, et arrondis. Fournir bouton 'Voir le détail du calcul' qui déroule la répartition par tranche (valeurs chiffrées).
- FAQ + données structurées (FAQ schema): FAQ peu ciblée sur requêtes Bing. Pas (ou pas assez) de balisage FAQ schema qui améliore visibilité sur Bing/Google.
  Pourquoi: Balisage FAQ peut générer des rich results et capter plus d'impressions/clics. Répondre aux requêtes haut volume augmente la pertinence search.
  Instruction Claude: Ajouter 6–8 FAQ courtes répondant explicitement aux requêtes Bing : 'Comment utiliser le simulateur impôts 2026 ?', 'Quelle différence entre revenu net et revenu imposable ?', 'Comment le quotient familial impacte-t-il mon impôt ?', 'Le simulateur prend-il en compte la décote ?' etc. Implémenter FAQ schema JSON-LD. Réponses courtes (1–2 phrases) + lien vers sections détaillées ou impots.gouv.fr.
- Maillage interne (liens entrant/sortant): Liens internes mal exploités : le hub/tools n'est pas clairement lié avec le bon anchor text contenant mots-clés. Pas de lien clair vers page officielle impots.gouv.fr.
  Pourquoi: Liens internes renforcent la page pilier et envoient du 'jus' sur le mot-clé. Les liens sortants vers sources officielles renforcent la E-A-T pour YMYL.
  Instruction Claude: Ajouter au moins 3 liens internes depuis le hub 'Simulateurs' / 'Outils' et pages connexes (guide fiscal 2026, changements 2026) avec anchor text exact 'simulateur impôts 2026' et 'simulation impôts 2026'. Ajouter lien sortant en haut et dans 'Comment nous calculons' vers la page officielle impots.gouv.fr (texte visible).

Keywords Bing a injecter:
- simulateur impôts 2026 -> title, meta, hero CTA, anchor internal (Prioriser ce mot-clé exact au début du title et dans le bouton CTA principal et l'ancre interne depuis le hub.)
- simulation impôts 2026 -> FAQ, h2, meta (Utiliser dans une FAQ et au moins un H2 pour capter variantes. Optionnellement dans meta si espace.)
- simulateur impots -> hero microcopy, internal anchors (Variante sans accent utile pour certaines requêtes : inclure dans microcopy et anchor text.)
- calcul impôts 2026 -> exemple chiffré, h2, FAQ (Mettre ce mot-clé dans le bloc exemple et un H2 explicite 'Calcul impôts 2026 : méthode et exemple'.)
- simulation impôt 2026 -> FAQ, schema answers (Variante singulière à inclure dans FAQ et réponses JSON-LD.)
- simulateur impots 2026 -> CTA, breadcrumb, anchor (Reprise comme anchor text et sur le bouton principal pour cohérence.)

Safe changes first:
- Mettre à jour le title pour inclure 'simulateur impôts 2026' en tête
- Remplacer la meta description par une version complète avec CTA et mention 'impots.gouv.fr'
- Ajouter une phrase de réponse directe sous le H1 (1–2 phrases) et bouton CTA principal
- Insérer un petit exemple chiffré indicatif pour featured snippet
- Ajouter FAQ courte + JSON-LD (6–8 items) répondant aux requêtes Bing
- Ajouter lien visible vers impots.gouv.fr dans le bloc 'Comment nous calculons'

Brief Claude:
- Objectif: Optimiser la page pilier 'Impôt sur le revenu 2026' pour augmenter CTR et impressions sur Bing/Google en améliorant title/meta, hero (réponse directe), CTA, transparence du calcul, FAQ et maillage interne, tout en respectant les contraintes YMYL (ne pas promettre précision et citer sources officielles).
- A conserver:
  - H1 actuel 'Impôt sur le revenu 2026 : estimez combien vous allez payer' (conserve formulation)
  - Avertissement 'Estimation indicative' visible et non atténué
  - Les sections expliquant quotient familial, décote et tranches (ne pas supprimer)
  - Date de mise à jour et méthodologie (conserver et actualiser si besoin)
- A corriger:
  - Remplacer le title par une version courte et optimisée incluant 'simulateur impôts 2026' en tête
  - Remplacer la meta par une description complète incluant CTA et référence à impots.gouv.fr
  - Ajouter une réponse directe courte sous le H1 et un CTA primaire avec texte exact 'Simulateur impôts 2026 — Estimer maintenant'
  - Insérer un exemple chiffré simple (cas concret) pour favoriser featured snippet ; inclure source et avertissement
  - Ajouter FAQ ciblée (min. 6 items) et implémenter FAQ JSON-LD
  - Documenter précisément la méthode de calcul avec lien vers impots.gouv.fr (barème 2026) et bouton 'Voir le détail du calcul' déployable
  - Créer/renforcer 3 liens internes depuis le hub/outils avec anchor 'simulateur impôts 2026' et un lien sortant officiel

## /pages/salaire-brut-net-calcul-2026
- Fichier local: `src\pages\salaire-brut-net-calcul-2026.html`
- Type: hub_or_pillar
- Score fusionne: 1407.52
- Resume priorite: CTR très faible sur Google malgré une bonne position. Priorité : améliorer title + meta pour augmenter clics, clarifier l'accroche (hero/H1) en évitant promesses absolues (YMYL), ajouter un 'réponse directe' concise (exemples chiffrés + formule), optimiser FAQ et maillage interne en intégrant explicitement les requêtes Bing à fort volume. Mettre à jour/présenter clairement les hypothèses de calcul (sources et date 2026) pour réduire risques YMYL.

Zones a corriger:
- Title (meta title): Title trop long et peu centré sur les requêtes principales ; contient promesses agressives ('Simulateur salaire brut → net 2026 — Calcul instantané & prélèvement à la source').
  Pourquoi: Un title optimisé et orienté requête augmente le CTR organique ; Google affiche souvent moins de caractères, il faut placer le mot-clé principal en tête et garder une formulation qui respecte les contraintes YMYL (éviter '100% fiable').
  Instruction Claude: Remplace le title par une version courte, claire et contenant une des requêtes Bing à fort volume (ex. 'brut en net 2026' ou 'salaire brut en net 2026'). Propositions (A/B test) :
- 'Calcul salaire brut en net 2026 — Simulateur gratuit' 
- 'Brut en net 2026 : calculateur instantané (cadre/non-cadre)' 
Respecter 50–60 caractères visibles. Éviter mots superlatifs absolus ('100% fiable', 'VRAI').
- Meta description: Meta actuelle est descriptive mais promet trop de certitude ('Simple, gratuit, 100% fiable.'). CTR faible ; meta pourrait mieux inciter au clic en présentant bénéfice clair et date de mise à jour.
  Pourquoi: Meta bien formatée augmente le CTR ; pour pages YMYL, il faut éviter garanties factuelles excessives et préciser que c'est une estimation afin de limiter risques réglementaires et attentes erronées.
  Instruction Claude: Remplacer par une meta concise (max ~150–160 caractères) contenant une requête Bing et un appel à l'action. Exemple :
'Estimateur brut → net 2026 (cadre/non-cadre/fonctionnaire). Calcul instantané et indicatif avec prélèvement à la source — Mise à jour 2026. Calculez en 10s.'
Inclure la mention 'estimation indicative' et la date de mise à jour.
- Hero / H1 (above-the-fold): H1 actuel et hero utilisent emojis et promesses ('Brut → Net instantanément', 'Découvrez votre VRAI salaire net en 10 secondes. 100% fiable'). Ton familier et claims absolus nuisent à la crédibilité YMYL.
  Pourquoi: Le H1 doit immédiatement rassurer et contenir le mot-clé principal pour capturer les snippets et améliorer la correspondance avec l'intention. Éviter langage trop marketing qui pourrait réduire confiance et CTR.
  Instruction Claude: Remplacer H1 par une formulation neutre et keyword-focused : ex. 'Calcul salaire brut en net — estimation 2026'. Dans le hero, conserver un CTA visible mais remplacer claims agressifs par : 'Estimation instantanée (indicative) — Mise à jour 2026'. Retirer emojis dans H1/H2 principaux. Rendre le bouton CTA principal 'Calculer mon net 2026' (texte exact à utiliser) et bouton secondaire 'Voir méthode de calcul'.
- Réponse directe / featured snippet (boîte de résultat rapide): Pas de bloc réponse directe clair et sourcé en haut de page : les exemples chiffrés sont présents mais noyés et présentés comme certitudes.
  Pourquoi: Google privilégie les pages offrant une réponse courte et structurée (ex : conversion rapide, exemples). Un 'answer box' clair augmente la probabilité d'obtenir un featured snippet et d'améliorer CTR. Pour YMYL, il faut préciser hypothèses.
  Instruction Claude: Ajouter un encadré en haut contenant : 1) définition brève (1 phrase) 2) 3 exemples chiffrés explicites avec statut (non-cadre/cadre/fonctionnaire) et préciser 'estimation indicatrice, hypothèses : charges URSSAF X%, prélèvement à la source inclus' 3) mini-formule visible (ex. Net ≈ Brut × (1 − taux de charges)). Exemple d'encart :
'Ex. 2 500 € brut/mois → ≈ 1 950 € net (non-cadre, taux charges ≈22–23%). Résultat indicatif pour 2026 — voir méthode.'
Ajouter source(s) des taux (URSSAF, DGFiP) et date de mise à jour.
- Bloc calculateur / formule: Le bloc calcul semble opérationnel mais il manque une mention claire des hypothèses (taux utilisés, si net avant/après impôt) et un libellé explicite de la précision/intervalle d'erreur.
  Pourquoi: Transparence sur les hypothèses est cruciale sur une page YMYL : réduit risques légaux, augmente confiance et conversion. Les utilisateurs doivent savoir si le résultat est 'net avant impôt' ou 'net après prélèvement à la source'.
  Instruction Claude: 1) Indiquer clairement : 'Résultat = net avant impôt' ou 'Résultat = net après prélèvement à la source' selon calcul actuel. Si possible afficher les deux versions. 2) Afficher les taux retenus et leur source sous le calculateur (ex : 'Hypothèses : charges salariés non-cadre 22–23% — source : URSSAF, maj mm/aa'). 3) Ajouter petit badge 'Mise à jour : JJ/MM/2026' et numéro de version des règles. 4) Si le calcul arrondit, afficher précision (± X €) et bouton 'Voir le détail des cotisations'.
- H2 / Titres secondaires: Multiples H2 avec emojis et formulation marketing ; cela dilue les signaux sémantiques et rend la page moins scannable pour Google/Bing.
  Pourquoi: Titres clairs et sans ornement facilitent le crawling, la lecture et l'extraction de snippets. Les H2 doivent couvrir requêtes long-tail et questions utilisateur (notamment celles remontées par Bing).
  Instruction Claude: Remplacer H2 lourds par versions sans emoji, orientées intent : ex. 'Conversion brut → net 2026 : exemples rapides', 'Tableau de conversion brut/net 2026', 'Comment calculer son salaire brut en net (méthode)'. Garder 5–7 H2 clairs, alignés sur les requêtes Bing listées.
- CTA (Call to action): CTAs actuels multiples et génériques ('Calculer maintenant', 'Simulateur complet') ; manque d'incitation claire et de différenciation entre CTA primaire/sec.
  Pourquoi: CTA bien formulé et visible augmente le taux d'engagement et conversions internes. Texte du bouton est aussi lu par moteurs comme indicateur d'intention.
  Instruction Claude: Définir un CTA primaire visible : 'Calculer mon net 2026' (couleur contrastée, sticky sur mobile). CTA secondaire 'Voir méthode de calcul' pour utilisateurs qui veulent vérifications. Ajouter micro-copy sous le bouton : 'Estimation indicative, sans enregistrement'.
- FAQ (structured data): FAQ insuffisante au regard des requêtes Bing (ex : 'brut en net 2026', 'calcul salaire brut en net 2026'). Pas/peu de structured data FAQ pour capter les SERP riches.
  Pourquoi: FAQ markup aide le positionnement en featured snippets et améliore CTR. Répondre précisément aux requêtes fréquentes de Bing augmente la visibilité sur Bing/Google.
  Instruction Claude: Ajouter 5–8 FAQ ciblées. Utiliser les requêtes Bing comme questions exactes (voir tableau 'bing_keyword_injections'). Réponses courtes (1–2 phrases) + un lien interne vers section méthode/détails. Implémenter FAQ schema JSON-LD. Exemples de Q : 'Comment convertir brut en net 2026 ?', 'Quel taux de charges pour un cadre en 2026 ?' etc.

Keywords Bing a injecter:
- brut en net 2026 -> Title, H1, première phrase du hero, encadré 'réponse directe' (Prioritaire (plus d'impressions). Utiliser mot clé exact au moins une fois dans le H1 ou la première phrase visible.)
- salaire brut en net 2026 -> Meta description, FAQ question, internal anchor text (Bonne intention commerciale — idéal pour CTA et ancres internes.)
- calcul brut en net 2026 -> H2 'Comment calculer...', bloc méthode, FAQ (Utiliser pour la section méthodologie détaillée et pour un HowTo schéma si possible.)
- calcul salaire brut en net 2026 -> Hero CTA, bouton principal, table de conversion titre (Bon pour libellé de bouton et pour titres de tableau.)
- salaire brut net 2026 -> Intro courte, extraits chiffrés, meta, internal links (Variante courte utile dans titres, H2 et ancres.)

Safe changes first:
- Modifier title et meta pour intégrer une des requêtes prioritaires et indiquer 'estimation indicative' (change à faible risque).
- Retirer emojis et claims absolus ('100% fiable', 'VRAI') du hero et H1 ; remplacer par formulation neutre et mise à jour 2026.
- Ajouter encadré réponse directe contenant 2–3 exemples chiffrés et la formule (Net ≈ Brut × (1 − taux)).
- Ajouter date de mise à jour et sources (URSSAF/DGFiP) visibles en haut du calculateur.
- Mettre en place FAQ minimal (3–5 Q/A) et ajouter JSON-LD FAQ schema.

Brief Claude:
- Objectif: Augmenter le CTR organique et la confiance utilisateur pour la page 'salaire-brut-net-calcul-2026' en clarifiant promesse (estimation), améliorant le title/meta/H1, ajoutant une réponse directe structurée et FAQ ciblées pour capter featured snippets, tout en respectant les contraintes YMYL.
- A conserver:
  - Le calculateur interactif (fonctionnalité principale)
  - Les exemples chiffrés pertinents (ex : 2 500 € brut → ~1 950 € net) mais en les qualifiant
  - Onglets/statuts (cadre, non-cadre, fonctionnaire) présents dans l'outil
  - Les tableaux de conversion détaillés (si exacts)
- A corriger:
  - Retirer toute formulation affirmant une 'certitude absolue' (ex: '100% fiable', 'vrai salaire net') ; remplacer par 'estimation indicative' ou 'à titre indicatif'.
  - Ajouter et afficher clairement les hypothèses et sources des taux (URSSAF/DGFiP) et la date de mise à jour 2026.
  - Réécrire title/meta/H1 pour inclure au moins une requête Bing prioritaire et pour augmenter l'attrait au clic (CTA clair).
  - Ajouter FAQ ciblées et JSON-LD pour améliorer chances d'obtenir featured snippets.
  - Clarifier si le résultat affiché est net avant impôt, net après prélèvement à la source, ou proposer les deux.

## /pages/blog/frais-notaire-ancien-neuf-2026
- Fichier local: `src\pages\blog\frais-notaire-ancien-neuf-2026.html`
- Type: pseo
- Score fusionne: 950.68
- Resume priorite: Page pSEO YMYL avec bon trafic mais CTR très faible (8184 imp., 0,10% CTR). Priorité : améliorer le titre et la meta pour augmenter le taux de clic, ajouter une réponse directe (featured-snippet friendly) en haut de page avec chiffres et un exemple chiffré, clarifier le bloc de calcul (hypothèses + sources officielles), renforcer CTA et maillage vers le hub/pilier, et ajouter signaux de confiance (auteur, date, sources). Ne pas réécrire la page complète — indiquer modifications ciblées et prudentes compte tenu du caractère YMYL.

Zones a corriger:
- Title (balise <title>): Titre actuel informatif mais peu attractif et long; n'inclut pas chiffre concret susceptible d'augmenter le CTR ou d'attirer les featured snippets.
  Pourquoi: Le titre est le principal facteur de clic depuis les SERP. Un titre plus précis et orienté résultat (ex. inclure % ou exemple chiffré) augmentera le CTR et la probabilité d'obtenir un clic depuis une position moyenne ~8.
  Instruction Claude: Propose 3 titres alternatifs concis (50–65 caractères) optimisés CTR et intent 'comparatif + résultat immédiat'. Exemple à fournir (ne pas appliquer sans validation) :
1) "Frais de notaire 2026 — Ancien 7–9% vs Neuf 2–3% (ex. 300k€)"
2) "Ancien ou neuf : quels frais de notaire en 2026 ? Ex. chiffré"
3) "Frais de notaire 2026 : combien pour 300 000€ — ancien vs neuf"
Consignes : garder '2026' et les mots-clés 'frais de notaire', 'ancien', 'neuf'. Prioriser variantes qui contiennent une valeur chiffrée pour attirer le regard.
- Meta description: Meta incomplète et tronquée (« Comparez les frais de notaire dans l »). Absence d'appel à l'action et d'élément de différenciation (ex : chiffres, exemple concret, simulateur).
  Pourquoi: Meta influence fortement le CTR ; une description complète (120–155 caractères) avec chiffres et CTA augmente les clics et précise la promesse. Important sur pSEO pour capter l'intent recherche pratique.
  Instruction Claude: Rédige 3 variantes de meta (120–155 caractères) qui incluent : chiffres clés (7–9% / 2–3%), mention d'un exemple chiffré et CTA vers le simulateur. Exemple type : "Frais de notaire 2026 : ~7–9% dans l'ancien, ~2–3% dans le neuf. Exemple chiffré et simulateur rapide — est. indicative." Indiquer version courte pour SERP mobile.
- Hero / Extrait visible (début d'article): Le texte actuel contient déjà des chiffres et un avertissement, mais manque d'une 'réponse directe' très concise (1–2 phrases) qui sert de featured snippet et résume le résultat pour l'utilisateur pressé.
  Pourquoi: Google/Bing privilégient une réponse immédiate en haut de page pour featured snippet : une phrase-chiffre + un très court exemple augmente la probabilité d'extraction automatique.
  Instruction Claude: Ajouter immédiatement après le H1 une courte 'réponse directe' de 25–40 mots contenant : les fourchettes (%) pour ancien vs neuf en 2026, et un micro-exemple (ex. montant sur 300 000€). Exemple à écrire : « En 2026, les frais de notaire sont en moyenne ≈7–9% dans l'ancien et ≈2–3% dans le neuf (VEFA). Par ex. pour 300 000€ : ≈21 000–27 000€ ancien vs ≈6 000–9 000€ neuf (est. indicative). » Maintenir l'avertissement 'estimation indicative' en une phrase juste après.
- Bloc de calculs détaillés: Calculs présents mais potentiellement confus : hypothèses (barèmes, taux départementaux, exonérations) et formule pas assez explicites. Absence d'indication claire des sources officielles et des paramètres variables (département, diagnostics, débours).
  Pourquoi: Sur une page YMYL financière/légale, la transparence des hypothèses et des sources est nécessaire pour la confiance utilisateur et pour réduire le risque d'informations trompeuses. De plus, un bloc de calcul bien structuré favorise le snippet 'how-to' ou le passage chiffré mis en avant.
  Instruction Claude: Refondre le bloc calcul en 3 parties sans réécrire toute la page :
- Ajouter en tête une liste d'hypothèses (prix du bien, département pris pour l'exemple, taux utilisés pour droits de mutation, frais proportionnels, émoluments).
- Présenter la formule pas-à-pas (ex : droits de mutation + émoluments + débours = total) avec une ligne de calcul pour l'exemple 300 000€.
- Lier explicitement chaque taux à une source officielle (Notaires.fr, légifrance) et ajouter un court avertissement sur variation par département.
Fournir un calcul chiffré clair pour 1–2 exemples (300k ancien / 300k neuf).
- CTA (simulateur et conversion): CTA existant ('Simulez vos frais en 30 secondes') mais peut être noyé et manque d'incitation/urgence. Pas de signal clair sur confidentialité, ni d'emplacement sticky/visible dès le scroll.
  Pourquoi: CTA bien visible et spécifique augmente les conversions pSEO (clic vers simulateur, lead). Les utilisateurs recherchent rapidement une estimation personnalisée.
  Instruction Claude: Rendre le CTA plus visible : proposer 2 versions testables — un bouton primaire en haut (hero) et un bouton sticky en bas à droite lors du scroll. Texte : 'Simuler mes frais (30s) — Estimation indicative'. Ajouter microtexte sous le bouton : 'Aucune donnée partagée. Basé sur barèmes officiels.' Indiquer emplacement exacts à implémenter (après la réponse directe et dans le bloc de calcul).
- FAQ (balises + contenu): FAQ existante mais opportunités manquées : questions courtes et ciblées susceptibles d'être extraites en snippet ne sont pas optimisées ; absence de microformat FAQPage/schema en JSON-LD.
  Pourquoi: FAQ avec questions formulées comme des requêtes Google fréquentes (ex: 'Combien de frais pour 300 000€ ancien 2026 ?') augmente chances d'apparition dans People Also Ask / featured snippets et améliore CTR organique.
  Instruction Claude: Ajouter 6–8 questions supplémentaires formulées en requête naturelle (exemples : 'Combien paie-t-on de frais de notaire pour 300 000€ en 2026 (ancien) ?', 'Le vendeur ou l'acheteur paie-t-il les frais ?','Comment réduire les frais de notaire ?'). Pour chaque question, fournir une réponse courte (30–60 mots) + une réponse détaillée plus bas. Générer aussi le JSON-LD FAQPage (valide) pour inclusion (ne pas l'insérer directement, mais fournir le code à l'équipe technique).
- Maillage interne (liens entrants/sortants): Absence d'un lien clairement identifié vers le hub/pilier 'frais de notaire' ou guide principal ; probablement pas de lien retour depuis le hub. Liens externes limités aux mentions générales.
  Pourquoi: En pSEO, le lien depuis le hub augmente l'autorité sémantique et aide Google à comprendre la relation 'pilier->page'. Les liens vers sources officielles augmentent la confiance (YMYL).
  Instruction Claude: Demander explicitement : ajouter un lien en haut (breadcrumb ou phrase d'intro) vers la page pilier 'Guide frais de notaire' et s'assurer que la page pilier contient un lien retour vers cette page. Ajouter 2 liens internes vers : simulateur de frais (outil) et guide sur exonérations/reductions. Ajouter 2 liens externes vers Notaires.fr (barème) et Légifrance pour les taux applicables. Fournir ancres recommandées (ex : 'calculez vos frais', 'barème officiel Notaires.fr').
- Signaux de confiance / YMYL (auteur, date, sources): La page indique une date mais peut manquer d'un bloc auteur qualifié (notaire ou expert fiscal/immobilier), et les sources officielles ne sont pas toutes visibles ou datées.
  Pourquoi: Pour une page YMYL, Google accorde de l'importance à l'expertise et à la transparence. Mentionner l'auteur/expertise et l'origine des chiffres réduit le risque d'algorithme d'évaluation faible et augmente la confiance utilisateur.
  Instruction Claude: Ajouter un court bloc 'Publié par / Vérifié par' : nom, rôle (ex: expert immobilier, notaire consulté), date de mise à jour, et lien vers profil auteur. Lister explicitement les sources principales (Notaires.fr, DGFiP si pertinent, Légifrance) avec URL et date de consultation. Garder le ton prudent : 'estimation indicative, non contractuelle'.

Keywords Bing a injecter:
- frais de notaire 2026 -> title, hero réponse directe, meta, H1 si pertinent (Bing keywords non fournis initialement ; inclure variantes usuelles ('frais de notaire ancien 2026', 'frais de notaire neuf 2026') dans la réponse directe et les FAQ pour couvrir intent.)
- exemple frais de notaire 300 000 -> hero exemple chiffré, FAQ (Les exemples concrets sont très performants pour pSEO — insérer au moins un '300 000€' et un '200 000€' comme variantes.)

Safe changes first:
- Corriger immédiatement la meta description incomplète par une version complète et attractive (voir modèles fournis).
- Ajouter en haut de l'article une 'réponse directe' concise (1–2 phrases) contenant les fourchettes (%) et un micro-exemple (ex. 300 000€).
- Remplacer le titre par une des variantes proposées (A/B test possible) pour améliorer le CTR.
- Ajouter un lien visible vers le simulateur (CTA) juste après la réponse directe.
- Insérer ou lier explicitement Notaires.fr comme source pour les barèmes et ajouter la date de consultation.

Brief Claude:
- Objectif: Fournir au rédacteur/technique des instructions concrètes et priorisées pour augmenter le CTR, favoriser l'extraction en featured snippet, améliorer la confiance YMYL et augmenter les conversions vers le simulateur, sans réécrire intégralement la page.
- A conserver:
  - Le ton explicatif et prudent (mention 'estimation indicative' et référence à Notaires.fr).
  - Les sections existantes (ancien vs neuf, calculs, FAQ) — on améliore la structure mais on ne supprime pas les contenus sans remplacement.
  - Les exemples chiffrés actuels si valides (ne pas inventer chiffres non sourcés).
- A corriger:
  - Titre et meta incomplets/faibles — proposer alternatives testables.
  - Ajouter une réponse directe en haut (featured-snippet friendly) avec fourchettes chiffrées et 1 micro-exemple.
  - Clarifier et structurer le bloc de calculs : lister hypothèses, formules, sources, et fournir 1–2 exemples chiffrés clairs.
  - Rendre le CTA simulateur visible et convaincant (bouton en hero + sticky), ajouter microtexte confiance.
  - Renforcer le maillage interne vers le hub/pilier et assurer lien retour depuis le hub.
  - Ajouter signaux YMYL : auteur/qualification, date de mise à jour, sources officielles datées, et JSON-LD FAQ si possible.

## /pages/asf
- Fichier local: `src\pages\asf.html`
- Type: hub_or_pillar
- Score fusionne: 417.49
- Resume priorite: Priorité n°1 : augmenter le CTR (position moyenne ~8, CTR 1,59 %) en améliorant title/meta/hero et en fournissant une réponse directe concise (snippet) tout en conservant le ton prudent YMYL. Priorité n°2 : clarifier le fonctionnement du simulateur (bloc calcul), afficher sources officielles (CAF, textes) et signaler la méthode pour renforcer E‑E‑A‑T. Priorité n°3 : améliorer les H2/maillage pour guider l'utilisateur vers cas concrets (parent isolé, pension alimentaire, cumul APL) et ajouter FAQ structurée pour capter featured snippets.

Zones a corriger:
- Title: Titre actuel trop long/peu orienté CTR, position 8.13 → amélioration possible pour clics. Contient mots clés mais manque d’angle utilisateur (avantage/temps).
  Pourquoi: Le title est le premier élément visible dans les SERP ; il doit augmenter le taux de clics sans promettre de résultat définitif (YMYL).
  Instruction Claude: Propose 3 variantes de title orientées CTR et conformes YMYL (éviter garanties). Chaque variante ≤ 60 caractères visibles, inclure 'ASF 2026', 'CAF' et une promesse mesurée. Exemples acceptables à soumettre :
- 'ASF 2026 (CAF) : simulation indicative en 2 min' 
- 'Calcul ASF 2026 (CAF) — estimation indicative' 
- 'ASF 2026 pour parent isolé : simulateur CAF et cas fréquents'
Mentionne la longueur visible et suggère une recommandation finale.
- Meta description: Meta tronquée ('...et l'), manque d’appel à l’action clair et de mention de sources officielles et délai/temps de simulation.
  Pourquoi: La meta influence le CTR et la compréhension immédiate — doit rassurer (indication indicative, source CAF) et inciter au clic.
  Instruction Claude: Propose 3 meta descriptions (120–155 caractères) qui : 1) rappellent que c’est une estimation indicative, 2) mentionnent CAF/source, 3) incluent CTA mesuré ('Lancer la simulation'). Exemple : 'Estimez votre ASF 2026 (CAF) en quelques minutes — calcul indicatif selon barèmes officiels. Lancer la simulation et consulter la méthodologie.'
- Hero / Réponse directe (above the fold): Hero actuel est verbeux et redondant ; pas de 'réponse directe' concise destinée au featured snippet. L'appel « Lancer la simulation » existe mais pourrait être renforcé par une phrase d'1 ligne réponse/valeur.
  Pourquoi: Une réponse directe courte (1 phrase + CTA) améliore le taux de clic interne, capte featured snippet et réduit l'incertitude pour l'utilisateur (important en YMYL).
  Instruction Claude: Rédige 1 phrase de 'réponse directe' (max 20–25 mots) claire et prudente : format 'En bref : ...' + une ligne d'explication très courte. Exemple : 'En bref — estimation indicative de l’ASF 2026 selon votre situation (parent isolé, nombre d’enfants, pension alimentaire). Montant final décidé par la CAF.' Positionner cette phrase immédiatement au‑dessus du CTA 'Lancer la simulation'.
- H1 et H2 (structure): H1 et plusieurs H2 sont trop longs, redondants et keyword-stuffés. Les H2 actuels ne suivent pas l’ordre logique de lecture (cas, règles, cumuls, FAQ).
  Pourquoi: Titres clairs améliorent l’UX, le crawl et la possibilité d’obtenir des extraits enrichis (featured snippet/People Also Ask).
  Instruction Claude: Propose une structure H1/H2 concise :
- H1 recommandé (unique) : 'ASF 2026 (CAF) — estimation pour parents isolés et orphelins'
- H2 prioritaires à proposer (ordre) : 1) 'Réponse rapide : ai‑je droit à l’ASF ?' 2) 'Comment est calculée l’ASF (barèmes 2026)' 3) 'Cas fréquents : parent isolé / sans pension / avec APL' 4) 'Simulateur : mode d’emploi' 5) 'FAQ rapide'.
Donne formulations courtes (max 60 caractères) pour chaque H2 et indique lesquelles remplacer en priorité.
- Bloc calcul / Simulateur: Bloc calcul important mais risque d’ambiguïté YMYL si résultats présentés sans mentions, sources ou hypothèses. Peut manquer de visibilité sur hypothèses et méthodologie.
  Pourquoi: Les utilisateurs attendent précision ; les moteurs valorisent la transparence (sources, hypothèses). Erreurs ici impactent crédibilité et conversions vers le simulateur.
  Instruction Claude: Indique 6 actions concrètes pour le bloc calcul :
1) Afficher en haut une ligne 'Estimation indicative — décision finale CAF' ;
2) Montrer les hypothèses utilisées (ex. pension = 0 €, revenu = net imposable X) avec liens vers barème CAF 2026 ;
3) Ajouter bouton 'Voir détail du calcul' déroulable montrant formule simplifiée ;
4) Sauvegarder/Partager l’estimation (PDF ou lien) ;
5) Inclure microdonnées (HowTo or Calculator schema si possible) ;
6) Ne pas afficher montant absolu sans condition — afficher intervalle si incertitude élevée.
Reste prudent sur libellés : utiliser 'estimation indicative' partout.
- CTA: CTA 'Lancer la simulation' présent mais manque d’éléments qui augmentent la conversion (temps, gratuit, indicatif).
  Pourquoi: Un CTA plus précis et rassurant augmente les taux d’engagement sans promettre résultats.
  Instruction Claude: Propose 3 variantes de CTA court + sous-texte rassurant (ex. 'Lancer la simulation — 2 min, estimation indicative'). Indique emplacement recommandé (hero + sticky en bas sur mobile) et couleur/contraste sans réécrire le design.
- FAQ: FAQ existante mais probablement trop courte et pas marquée en schema ; questions susceptibles de capter featured snippets/PAA non ciblées.
  Pourquoi: FAQ schema augmente CTR et présence en rich results. Questions orientées pratique (ex. 'Quel montant pour 1 enfant si pension = 0 ?') attirent plus d’impressions utiles.
  Instruction Claude: Génère 8 questions-réponses courtes (30–50 mots) format FAQ, prudentes (YMYL), avec sources officielles. Priorise questions à fort potentiel snippet : droit de base, effet de la pension, cumul APL, délai de paiement. Fournis JSON‑LD FAQ prêt à intégrer.
- Maillage interne (liens hub/pillar): Maillage mentionné 'Pages utiles' mais à optimiser : lier vers pages clefs (APL, pension alimentaire, pièces CAF, démarche) et renvoyer vers hub principal.
  Pourquoi: Un bon maillage renforce l’autorité sur le thème, dilue les signaux vers pages secondaires et aide le crawler à comprendre l’intent du hub.
  Instruction Claude: Propose une liste priorisée de 6 pages internes à lier (ex. page APL, pension alimentaire simulation, droits parent isolé, comment déclarer à la CAF, contact CAF, hub simulateurs). Pour chaque lien, donne l’ancre recommandée (naturelle, pas optimisée à outrance).

Keywords Bing a injecter:
- aucun -> aucun (Aucune requête Bing fournie. Se concentrer sur signaux Google et optimisation on‑page. Si des données Bing apparaissent plus tard, réévaluer.)
- ASF 2026 simulation -> title, hero, meta, H2 (Même si Bing n'a pas fourni de requêtes, inclure la formulation naturelle 'ASF 2026 simulation' dans title/meta/hero/H2 pour correspondre aux intentions de recherche actuelles (Google).)

Safe changes first:
- Mettre à jour le title et la meta avec variantes proposées (sans changer contenu sensitif).
- Ajouter la phrase de réponse directe (1 ligne) au dessus du CTA dans le hero.
- Raccourcir et clarifier H2 prioritaires en suivant la structure recommandée.
- Ajouter mention visible 'Estimation indicative — décision finale CAF' près du simulateur.
- Créer FAQ structurée (JSON‑LD) et insérer 6–8 Q/R courtes.

Brief Claude:
- Objectif: Augmenter le CTR et la confiance utilisateur sur la page ASF 2026 (hub/pilier) en modifiant title/meta/hero, en fournissant une réponse directe concise pour featured snippet, en clarifiant le simulateur et en renforçant E‑E‑A‑T sans promettre résultats définitifs (respect YMYL).
- A conserver:
  - Mention explicite 'Estimation indicative' et référence à la CAF
  - Le CTA 'Lancer la simulation' (mais peut être optimisé)
  - La mise à jour de la page (date) et le lien vers la méthodologie
  - Ton prudent (ne pas donner de conseils juridiques/assertions définitives)
- A corriger:
  - Title trop long/pas orienté CTR — proposer variantes plus accrocheuses
  - Meta description tronquée et peu incitative — rédiger nouvelles propositions
  - Absence d’une 'réponse directe' courte pour snippet — rédiger et positionner
  - H2 redondants et mal ordonnés — simplifier structure et prioriser cas utilisateurs
  - Bloc simulateur insuffisamment transparent (hypothèses, sources, détail du calcul) — ajouter cadre méthodologique et indication d'incertitude
  - FAQ non marquée en schema — fournir Q/R et JSON‑LD

## /pages/blog/departements/frais-notaire-06
- Fichier local: `src\pages\blog\departements\frais-notaire-06.html`
- Type: pseo
- Score fusionne: 250.75
- Resume priorite: Page pSEO locale (Alpes‑Maritimes / Nice) : améliorer title/meta pour CTR, ajouter une réponse directe (featured‑snippet style) au dessus de la ligne de flottaison, rendre le CTA/calculateur plus visible et transparent (hypothèses + lien officiel Notaires.fr), ajouter FAQ en JSON‑LD et renforcement du maillage vers le hub/pilier. Rester prudent sur affirmations (YMYL) : toujours marquer « estimation indicative » et pointer les sources officielles.

Zones a corriger:
- Title: Titre actuel mélange lieu (Nice) et champ plus large (Alpes‑Maritimes) ; CTR moyen 2.97% malgré bonne position ; titre long et peu centré sur promesse immédiate.
  Pourquoi: Le title est l'élément principal pour augmenter le CTR en search. Pour pSEO local, il doit contenir lieu précis, promesse (estimation immédiate) et barème officiel sans surpromettre.
  Instruction Claude: Proposer 3 variantes de title (max 60–70 caractères visibles) focalisées sur : 1) localité + rapidité + caution YMYL ; 2) format 'Nice (06)' si page vise Nice ; 3) format départemental. Exemple à produire (ne pas appliquer sans validation) : « Frais de notaire Nice (06) 2026 — Estimation immédiate & gratuite (barème officiel) ». Retourner 3 options classées par priorité.
- Meta description: Meta décrite générique et sans incitation forte au clic (manque d'élément différenciateur et d'appel).
  Pourquoi: Meta contribue au CTR et doit résumer la promesse (temps, gratuité, source officielle) tout en conservant avertissement YMYL.
  Instruction Claude: Proposer 2–3 meta descriptions (120–160 caractères) qui : (a) incluent 'Nice' ou 'Alpes‑Maritimes (06)', (b) précisent '10 s / calcul gratuit', (c) gardent la mention 'estimation indicative' + lien vers Notaires.fr. Ex.: « Calcul gratuit en 10 s des frais de notaire à Nice (06). Estimation indicative selon barème 2026 — résultat instantané + lien vers Notaires.fr. »
- Hero / above‑the‑fold (H1 + lead): Le H1 est correct mais le contenu above‑the‑fold n'affiche pas une réponse immédiate chiffrée ni l'exemple concret attendu pour featured snippet ; CTA visible mais peut être plus clair.
  Pourquoi: Les moteurs favorisent une réponse concise et chiffrée au-dessus de la ligne de flottaison pour featured snippet ; les utilisateurs ont besoin d'un exemple rapide pour cliquer.
  Instruction Claude: Insérer directement sous le H1 une phrase 'En bref' d'une ligne (1–2 phrases) avec fourchettes chiffrées et un exemple concret (avec prix d'achat et montant estimé), en commençant par 'En bref —'. Exemple: 'En bref — Achat ancien à Nice : frais ≈ 7–9% du prix. Exemple : pour 300 000 € → ≈ 21 000 € (estimation indicative).' Toujours ajouter immédiatement la mention 'estimation indicative — voir Notaires.fr'.
- Réponse directe / Featured snippet: Pas de réponse formatée pour Google/Bing (snippet) : manque de phrase courte et structurée et d'un calcul pas à pas visible.
  Pourquoi: Pour capter featured snippet et améliorer CTR/visibilité, fournir une réponse courte + un mini calcul (entrée→formule→résultat).
  Instruction Claude: Créer un bloc 'Réponse rapide' (HTML clair, sans JavaScript nécessaire pour le texte) contenant : 1 ligne d'accroche chiffrée + 1 mini-calcul pas à pas (ex. base : droits de mutation + émoluments + débours = total). Inclure balises <strong> sur les chiffres clés. Ne pas promettre certitude : finir par 'montant indicatif — voir simulateur officiel'.
- CTA principal / bouton 'Lancer le calcul': Le CTA existe mais peut manquer de contrasté, d'argumentaire et d'anchor text orienté action ; positionnement peut être trop bas.
  Pourquoi: Amélioration du taux de conversion interne et du temps passé sur page si l'appel à l'action est clair et placée au-dessus de la ligne de flottaison.
  Instruction Claude: Rendre le bouton visible (couleur contraste, texte explicite) et dupliquer : 1) CTA principal en hero: 'Calculer mes frais — Gratuit (10 s)', 2) CTA secondaire après la réponse rapide: 'Calcul détaillé (avec hypothèses)'. Le bouton doit lier directement au #calculator et inclure attribut rel='noopener'.
- Bloc calculateur (si intégré): Le texte mentionne calculateur mais il faut clarifier hypothèses, décortiquer le résultat (droits / émoluments / débours / CSI) et fournir lien vers simulateur officiel.
  Pourquoi: Pour YMYL, transparence sur hypothèses + provenance des taux augmente la confiance utilisateurs et moteurs ; facilite la conversion et réduit risques juridiques.
  Instruction Claude: Ajouter en tête du bloc calculateur : 1) liste d'hypothèses sélectionnées (ex. taux droits de mutation, TVA, frais fixes), 2) affichage du détail en lignes (Droits de mutation, Émoluments, Débours, CSI), 3) bouton 'Exporter / Imprimer' et 4) lien clair 'Vérifier sur Notaires.fr / simulateur officiel'. Marquer que l'issue n'est pas un devis. Si calculateur est JS, s'assurer que le résultat principal est indexable (texte alternatif ou server‑side rendered).
- FAQ / Schema (JSON‑LD): Pas de FAQ structurée visible ; questions YMYL fréquentes non traitées ou peu structurées.
  Pourquoi: FAQ en JSON‑LD améliore les chances d'extraits enrichis et répond aux questions critiques YMYL (responsabilité, officialité).
  Instruction Claude: Rédiger 6–8 questions courtes + réponses (30–60 mots) ciblant : 'Que comprennent les frais de notaire ?', 'Différence ancien / neuf ?', 'Comment réduire ?', 'Qui paie ?', 'Quand montant définitif ?', 'Où vérifier le barème ?'. Fournir JSON‑LD FAQ conforme à schema.org. Respecter ton prudent ('estimation indicative', sources).
- H2 et structure de contenu: H2 actuels contiennent emojis et formulations longues ; structure pas optimisée pour crawl/featured snippet.
  Pourquoi: Titres clairs et sans caractères inhabituels améliorent compréhension SEO et accessibilité. H2 doivent être ciblés sur requêtes locales et besoins (ex. 'Frais de notaire à Nice 2026 — exemple').
  Instruction Claude: Retirer emojis des H2, raccourcir et rendre keywords‑oriented : ex. 'Calcul immédiat (10 s) — Frais de notaire Alpes‑Maritimes 2026', 'Exemple de calcul — Achat ancien à Nice', 'Astuces pour réduire vos frais de notaire'. Mettre les H2 dans un ordre logique pour snippet (direct answer → détail → FAQ).

Keywords Bing a injecter:
- (aucun) -> none (Bing n'a pas fourni de requêtes exploitables pour cette page.)
- suggested_local_queries -> meta/hero/H2 (Suggérer d'utiliser manuellement requêtes locales courantes: 'frais de notaire Nice 2026', 'frais de notaire Cannes 2026', 'frais de notaire 06 2026'.)

Safe changes first:
- Modifier title/meta pour test A/B (3 variantes proposées) — action à faible risque.
- Ajouter la phrase 'En bref' chiffrée sous le H1 et mention 'estimation indicative'.
- Rendre le CTA hero plus visible et changer l'anchor text en 'Calculer mes frais — Gratuit (10 s)'.
- Ajouter lien clair vers Notaires.fr et vers la page hub/pilier (guide frais de notaire).
- Retirer emojis des H2 et raccourcir titres pour meilleure lisibilité.

Brief Claude:
- Objectif: Augmenter CTR et capter featured snippet sur requêtes locales (Nice / Alpes‑Maritimes 06) tout en respectant contraintes YMYL : fournir une réponse chiffrée, transparente et sourcée, optimiser CTA et maillage vers hub sans réécrire la page entière.
- A conserver:
  - Mention d'avertissement YMYL ('estimation indicative', 'non contractuelle')
  - Référence au barème officiel 2026
  - Le calculateur existant (ne pas supprimer)
  - H1 actuel (thématique départementale) — conserver l'orientation Alpes‑Maritimes si la page couvre plusieurs villes
- A corriger:
  - Aligner title/meta avec H1 et promesse (rapidité + gratuité) ; fournir variantes pour test
  - Ajouter une réponse courte chiffrée (format featured snippet) immédiatement sous H1
  - Clarifier hypothèses et décomposer le résultat du calculateur (droits, émoluments, débours, CSI)
  - Améliorer CTA (texte + visibilité) et s'assurer qu'il renvoie directement au bloc calculateur
  - Ajouter FAQ en JSON‑LD et 6–8 Q/R courtes orientées YMYL avec sources
  - Renforcer maillage interne vers le hub/pilier et vers pages villes (Nice, Cannes) et ajouter lien vers Notaires.fr

## /pages/apl/apl-smic-seul
- Fichier local: `src\pages\apl\apl-smic-seul.html`
- Type: pseo
- Score fusionne: 245.34
- Erreur IA: fetch failed

## /pages/impot/tranches-d-impot-2026
- Fichier local: `src\pages\impot\tranches-d-impot-2026.html`
- Type: pseo
- Score fusionne: 173.24
- Resume priorite: Page bien positionnée (pos. ~4) mais CTR = 0% : causes probables = title/meta non attractifs et absence d'un answer-snippet chiffré visible. Priorité haute : title, meta, hero (Réponse rapide), insérer un tableau clair des tranches (pour featured snippet), CTA explicite vers le simulateur, FAQ avec schema, maillage vers hub. Rester prudent (YMYL) : n'ajouter que des chiffres officiels sourcés et formuler toute estimation comme "indicative".

Zones a corriger:
- Title: Titre actuel trop neutre/répétitif (« Tranches d’impôt 2026 (2026) »). N'incite pas au clic et ne met pas en avant les bénéfices (barème, seuils, simulateur).
  Pourquoi: Le title est le principal facteur d'attraction en SERP. Améliorer le title augmente le CTR sans risque SEO. Position élevée + CTR proche de 0 indique un title peu attractif.
  Instruction Claude: Proposer 2-3 variantes de title (60–70 caractères max) qui incluent le mot-clé cible et un bénéfice clair, sans promesse illégitime. Exemples à générer (ne pas inventer chiffres) :
- « Tranches d'impôt 2026 — barème et seuils officiels | Simulation indicative »
- « Barème impôt 2026 : taux & seuils (simulez votre impôt) »
Consignes : garder l'année 2026, inclure « barème » ou « seuils », et ajouter « simulation/estimation » pour attirer les clics. Ne pas promettre un calcul définitif — utiliser le mot « indicative ».
- Meta description: Meta actuelle générique, n'affiche pas les chiffres clés ni d'appel à l'action fort. Ne met pas en avant la possibilité de simuler.
  Pourquoi: Meta est responsable d'une grande partie du CTR. Une meta qui résume la valeur (tableau clair + simulateur) augmentera les clics. Pour YMYL, éviter formulations catégoriques et ajouter source officielle.
  Instruction Claude: Rédiger 2 variantes courtes (120–155 caractères) incluant : promesse claire, appel à l'action, mention « indicative » et référence à la source officielle. Exemple de template à remplir par l'éditeur avec chiffres officiels :
- « Barème 2026 (seuils et taux officiels). Consultez le tableau et simulez votre impôt 2026 — estimation indicative. Source : impots.gouv.fr »
Ne pas inclure chiffres non vérifiés dans la meta; si vous les incluez, vérifiez contre impots.gouv.fr/service-public.
- Hero / Réponse rapide (bloc visible en haut): La 'Réponse rapide' est trop générique et ne contient pas le tableau chiffré ou une réponse en une phrase utilisable pour le featured snippet.
  Pourquoi: Google favorise un answer-snippet court et chiffré. L'absence d'une phrase claire + tableau réduit les chances d'obtention du featured snippet et décourage le clic.
  Instruction Claude: Transformer la 'Réponse rapide' en : 1) une phrase ultra-concise répondant 'Quelles sont les tranches en 2026 ?' 2) un tableau HTML placé immédiatement sous la phrase reprenant les tranches officielles (colonne : plafond bas, plafond haut, taux) pour 1 part. Indiquer clairement la source (impots.gouv.fr) et la date de mise à jour. Exemple de phrase (à compléter par l'éditeur avec chiffres officiels) : « Réponse rapide — barème 2026 (pour 1 part) : [insérer tableau officiel ci‑dessous] — estimation indicative, voir simulateur. »
Important : ne pas inventer chiffres; récupérer et citer la page officielle.
- Bloc 'Réponse directe' (contenu textuel explicatif): Texte trop général, pas d'exemple chiffré, pas de mini-calcul, formulation trop pédagogique et peut sembler vague pour l'internaute qui cherche un résultat rapide.
  Pourquoi: Les utilisateurs cherchent souvent une réponse immédiate + exemple concret (featured snippet + SERP). Un mini-exemple améliore la satisfaction et augmente les clics depuis le snippet.
  Instruction Claude: Ajouter immédiatement après le tableau un mini-exemple chiffré (cas simple) : choix d'un profil (ex. célibataire 1 part, revenu imposable X€) et calcul étape par étape montrant comment appliquer les tranches (formule simplifiée). Toujours : marquer « estimation indicative » et lier la source. Ne pas fournir de conseils personnalisés (éviter 'vous paierez'). Formuler : « Ex. : pour 1 part et RN imposable de [X€] → calcul indicatif : ... » (X à choisir comme exemple neutre, vérifier cohérence).
- Tableau des tranches (HTML): La page semble ne pas exposer un tableau simple et propre des tranches (élément clé pour featured snippet et compréhension rapide).
  Pourquoi: Un tableau HTML propre (non-image) est plus susceptible d'être utilisé comme featured snippet et permet aux moteurs d'extraire les informations. Les images de tableaux ne sont pas idéales.
  Instruction Claude: Insérer un tableau HTML accessible (thead/tbody) listant les tranches 2026 pour 1 part : colonnes 'Plafond inférieur', 'Plafond supérieur', 'Taux'. Ajouter un petit paragraphe expliquant que les seuils varient selon le nombre de parts et renvoyant au simulateur. Ajouter attribut 'data-source' et citation visible : 'Source : impots.gouv.fr — mis à jour le JJ/MM/2026'.
- CTA principal (bouton Pilier / Simulateur): CTA actuel vague ('Accéder au pilier') et placé sans argument contextuel. Peu explicite pour un utilisateur cherchant à simuler.
  Pourquoi: Un CTA clair et orienté conversion (cliquer pour simuler) augmentera le trafic vers le simulateur et le temps passé. Important pour pSEO : transformer une visite informative en interaction.
  Instruction Claude: Remplacer le libellé par un texte transparent et non-prometteur : ex. 'Simuler mon impôt 2026 (estimation indicative, gratuit)'. Mettre le bouton en haut (hero) et en bas de page. Ajouter aria-label et rel=nofollow si le simulateur est externe. Ne pas promettre 'impôt exact'.
- FAQ + données structurées (schema.org): Absence (ou insuffisance) de FAQ en schema. La page peut capter plus d'espace SERP avec FAQ et aider le CTR.
  Pourquoi: FAQ en structured data augmente la visibilité en SERP et la pertinence pour des requêtes complémentaires. Pour YMYL, les réponses doivent être sobres, sourcées et non-conseil personnalisé.
  Instruction Claude: Ajouter 4‑6 Q&A courts (30–60 mots) couvrant : 'Quelles sont les tranches en 2026 ?', 'Comment calculer l'impôt 2026 ?', 'Où trouver le barème officiel ?', 'Quel est l'impact des parts ?'. Générer les textes de réponse en ton factuel, inclure liens et citation à impots.gouv.fr/service-public.fr. Implémenter FAQPage JSON-LD. Ne pas donner de conseils fiscaux personnalisés.
- Maillage interne (liens nav / retour hub): Liens vers le hub et pages connexes existent mais le libellé/position n'est pas optimisé pour pSEO (ancre peu descriptive : 'Retour au pilier').
  Pourquoi: Pour pSEO, il faut un lien fort et descriptif vers le hub (simulateur) pour signaler la relation pilier->page et améliorer la conversion depuis cette page vers l'outil.
  Instruction Claude: Modifier ancres en texte descriptif : ex. 'Simulateur Impôts 2026 — estimer mon impôt' et ajouter un second lien contextuel vers 'Revenu fiscal de référence : définition' et 'Déclaration de revenus 2026'. S'assurer que ces liens sont HTML textuels (pas JS-only) et placés en haut et en fin d'article. Ajouter attribute rel='noopener' si externe.

Keywords Bing a injecter:
- tranches impôt 2026 -> title, h1, hero phrase, first paragraph (Mot-clé principal ; garder exact-match proche du début du title pour Bing et Google.)
- barème impôt 2026 -> meta description, hero, tableau caption (Permet d'attirer les recherches orientées 'barème'.)
- seuils impôt 2026 -> tableau col-header, FAQ (Bonne insertion pour les requêtes sur plafonds/tranches.)
- simulateur impôt 2026 -> CTA, meta, internal link anchor (Mets l'accent sur la fonction de conversion (cliquer pour simuler).)
- comment calculer impôt 2026 -> FAQ, mini-exemple (Utiliser en Q&A et dans l'exemple de calcul pas-à-pas.)

Safe changes first:
- Modifier le title et la meta (propositions à tester A/B).
- Réécrire la ‘Réponse rapide’ en une phrase concise et ajouter la mention de source.
- Insérer un tableau HTML propre des tranches (à jour) en haut du contenu.
- Changer le libellé du CTA en texte clair 'Simuler mon impôt 2026 (estimation indicative)'.
- Ajouter liens internes descriptifs vers le hub/simulateur et pages connexes.
- Ajouter FAQ courte et implémenter JSON‑LD FAQPage (réponses sobres et sourcées).

Brief Claude:
- Objectif: Augmenter le CTR et la conversion vers le simulateur en rendant la page immédiatement utile en SERP : fournir une réponse-synthèse chiffrée (tableau), un exemple de calcul, CTA clair, et FAQ structurée, tout en respectant les contraintes YMYL (chiffres officiels, formulation indicative).
- A conserver:
  - H1 'Tranches d'impôt 2026' (conserver le sujet principal et l'année).
  - Mention de l'aspect pédagogique/indicatif et le disclaimer vers organismes compétents.
  - Lien existant vers le simulateur (conserver le flux vers le hub).
- A corriger:
  - Title : remplacer par une variante plus attractive contenant 'barème' ou 'seuils' et 'simulateur/estimation'.
  - Meta description : rendre plus concrète, inclure mention de tableau officiel et CTA vers le simulateur.
  - Hero / Réponse rapide : produire une phrase très concise + tableau HTML des tranches 2026 (valeurs officielles, sourcées).
  - Ajouter un mini-exemple chiffré (cas simple) montrant le calcul par tranches, toujours libellé 'estimation indicative'.
  - CTA : libellé explicite vers le simulateur, visible en haut et en bas de page.
  - FAQ : ajouter 4–6 questions et JSON-LD FAQPage, réponses factuelles et sourcées.
  - Maillage : ancre descriptive vers le hub/simulateur et autres pages fiscales liées.

## /pages/charges
- Fichier local: `src\pages\charges.html`
- Type: hub_or_pillar
- Score fusionne: 150.89
- Resume priorite: Priorité élevée : corriger les éléments d'indexation (title, meta), améliorer l'accroche hero et la 'réponse directe' pour capter le featured snippet, renforcer E‑A-T/YMYL (sources, disclaimer, méthodologie) et rendre le simulateur plus explicite et traçable. Changements sûrs en premier : title/meta, H1 cohérent, disclaimer et sources, CTA visible, FAQ schema.

Zones a corriger:
- Title: Trop verbeux et risque de duplication avec H1; doit rester sous ~60 caractères et intégrer le mot clé principal sans répétition inutile.
  Pourquoi: Le title est le signal principal pour Google et impacte CTR dans les SERP. Un titre clair, concis et non coupé augmente les clics et la pertinence perçue.
  Instruction Claude: Remplacer par un title concis (<=60 char) incluant 'Charges de copropriété 2026' + promesse mesurable : exemple type à proposer (ne pas appliquer sans validation) : 'Charges de copropriété 2026 — Estimation annuelle & mensuelle'. Vérifier longueur finale et éviter répétition exacte avec H1.
- Meta description: Actuelle tronquée ('...l') et trop courte/incomplète ; n'incite pas au clic ni ne précise la méthode ni les limites (YMYL).
  Pourquoi: La meta influence le CTR et la perception d'autorité. Une meta complète et prudente augmente la confiance et les clics.
  Instruction Claude: Recrire la meta en une phrase complète (120–155 caractères) qui explique l'objet, la méthode et la limite : mentionner 'estimation indicative', 'sur la base de surface, équipements, âge, localisation', et renvoyer au simulateur. Exemple suggéré à adapter: 'Estimez à titre indicatif vos charges de copropriété 2026 selon surface, équipements, âge et localisation. Résultat indicatif — montant réel voté en AG.'
- Hero / accroche (above the fold): H1 et texte d'accroche répétitifs; pas de réponse courte/directe affichée pour capter featured snippet ; absence d'un bouton CTA visuel immédiatement cliquable.
  Pourquoi: La zone hero influence le taux de clics internes, la conversion sur le simulateur et la probabilité d'obtenir un featured snippet (réponse courte en haut).
  Instruction Claude: Ajouter une 'réponse directe' en 1-2 lignes juste sous le H1 — ex. 'Ordre de grandeur : 15–35 €/m²/an selon équipements — utilisez le simulateur pour un résultat personnalisé.' Mettre un CTA primaire visible 'Estimer mes charges' (contraste, action immédiate) et un CTA secondaire 'Voir la méthodologie'. Ne pas promettre d'exactitude, ajouter mention 'estimation indicative'.
- Réponse directe / featured snippet: Aucune réponse courte chiffrée et sourcée affichée ; contenu actuel descriptif long qui diminue chance du snippet.
  Pourquoi: Google/Bing favorisent une réponse concise et chiffrée pour les featured snippets. Cela augmente le trafic organique et CTR.
  Instruction Claude: Insérer un encadré 'En bref' avec 2–3 valeurs indicatives (plage €/m²/an et exemples : petite copro 10–20€/m², grande résidence 20–40€/m²), préciser hypothèses (surface moyenne, équipements) et ajouter source(s) officielles (service-public.fr, INSEE, observatoire immobilier) avec liens. Rester prudent: qualifier 'ordre de grandeur'.
- Bloc calcul / simulateur: Manque de clarté sur hypothèses, unités, plages plausibles et sources ; UX d'entrée/sortie peu mise en avant ; pas de trace de confidentialité ou export du résultat.
  Pourquoi: Les utilisateurs YMYL attendent transparence sur la méthode et la sécurité des données. Google valorise les pages démontrant méthodologie et provenance des données pour sujets financiers.
  Instruction Claude: Afficher clairement les hypothèses utilisées par le simulateur (p.ex. méthode de calcul, coûts moyens par poste, année source des données). Ajouter un mini-exemple calculé par défaut (avec chiffres) pour démontrer fonctionnement. Prévoir un texte légal/consentement sur traitement des données et bouton 'Télécharger le résultat (PDF)'.
- CTA (conversion): CTA existant peu saillant et manque d'options pour utilisateurs hésitants (méthodologie, comparatif, contact pro).
  Pourquoi: CTA bien placés améliorent conversion vers le simulateur et interactions sur la page — signaux positifs pour moteurs.
  Instruction Claude: Rendre le CTA principal contrasté, texte clair 'Estimer mes charges (gratuit, 2 min)'. Ajouter CTA secondaire 'Voir la méthodologie' et 'Comparer 2 scénarios' près du simulateur. Pour YMYL, ajouter 'Consulter un professionnel' en bas avec lien vers page hub sur syndics / diagnostics.
- FAQ / Questions fréquentes: FAQ non structurée ou absente ; pas de balisage FAQ schema.
  Pourquoi: FAQ schema augmente chance d'apparition riche (SERP features) et répond aux doutes YMYL en fournissant réponses courtes et sourcées.
  Instruction Claude: Ajouter 6–8 Q/R courtes et sourcées (ex. 'Comment sont réparties les charges ?', 'Que couvre une charge courante ?','Comment sont votées les charges exceptionnelles ?','Que faire si je conteste un appel de fonds ?'). Fournir réponses factuelles, citer textes officiels et ajouter FAQ schema JSON‑LD.
- Maillage interne (internal linking): Liens internes manquants ou peu ciblés vers pages hub PSEO : syndic, travaux, diagnostic énergétique, procès-verbaux AG, simulateur.
  Pourquoi: Le maillage renforce l'autorité du hub et aide Google à comprendre la relation entre pages. Il canalise aussi le trafic vers pages à forte conversion.
  Instruction Claude: Ajouter des liens contextualisés et ancrés : 'Comprendre le rôle du syndic' -> /pages/syndic, 'Charges exceptionnelles' -> /pages/charges-exceptionnelles, 'Diagnostic de performance énergétique' -> /pages/dpe. Placer 3–5 liens dans le corps et 1 lien de retour vers le hub principal (page qui liste tous les simulateurs).

Keywords Bing a injecter:
-  ->  (Aucune requête Bing fournie - pas d'injection spécifique.)
-  ->  (Laisser vide si aucune donnée Bing.)

Safe changes first:
- Raccourcir et normaliser le title (<=60 caractères) et s'assurer qu'il n'est pas identique au H1
- Corriger la meta description complète (120–155 caractères) pour éviter la troncation
- Aligner le H1 sur le title sans répétition excessive
- Ajouter une mention visible 'Estimation indicative' et un lien vers service-public.fr
- Ajouter un encadré 'En bref' avec plages indicatives et hypothèses
- Mettre un CTA principal visible 'Estimer mes charges (2 min)' et un CTA 'Voir la méthodologie'.

Brief Claude:
- Objectif: Améliorer le SEO & l'UX de la page hub 'Charges de copropriété 2026' pour augmenter le CTR organique, capter un featured snippet et renforcer la confiance (E‑A‑T) sur un sujet YMYL sans promettre de résultats définitifs.
- A conserver:
  - Mention explicite 'Estimation indicative' et renvoi à service-public.fr
  - La structure H2 actuelle qui couvre les principaux postes (petite/ grande copro, équipement, budget global)
  - Le simulateur et sa présence visible sur la page (ne pas supprimer)
  - Ton neutre et prudent vis‑à‑vis d'informations financières/YMYL
- A corriger:
  - Title: rendre plus concis, éviter répétition H1, vérifier longueur et intégrer l'année 2026
  - Meta description: réécrire complètement pour être informative et non tronquée ; inclure limite 'indicative' et encourager le clic
  - Hero: ajouter une réponse courte chiffrée ('En bref') avec hypothèses et sources pour candidate featured snippet
  - Bloc calcul: détailler hypothèses, unités, exemples chiffrés et ajouter option d'export et texte sur protection des données
  - CTA: rendre principal visible et ajouter CTA secondaires 'Méthodologie' et 'Comparer scénarios'
  - FAQ: ajouter 6–8 Q/R courtes et implémenter FAQ schema JSON‑LD
  - Maillage: ajouter 3–5 liens internes vers pages hub pertinentes et un lien de retour vers le hub principal
  - E‑A‑T/YMYL: ajouter date de mise à jour, auteur/responsable éditorial, sources officielles et courte méthodologie

## /pages/apl/apl-famille-trois-enfants
- Fichier local: `src\pages\apl\apl-famille-trois-enfants.html`
- Type: pseo
- Score fusionne: 149.91
- Resume priorite: Améliorer le Title/Meta et la zone hero pour capter plus de clics (featured snippet), afficher une réponse directe claire et sûre (~87 €/mois) et pousser vers le simulateur complet via CTA pré-rempli. Renforcer FAQ + microdonnées FAQ, ajouter lien retour vers le hub APL et clarifier les limites YMYL (estimation indicative, vérifier sur caf.fr). Priorité: Title -> Hero/Answer -> CTA -> FAQ -> Maillage -> Bloc calcul.

Zones a corriger:
- Title: Trop générique et peu incitatif pour le CTR. N'inclut pas la valeur estimée ni le signal d'incertitude visible en SERP.
  Pourquoi: Le Title est le premier facteur qui influence le taux de clics organiques. Un Title précis et rassurant (valeur indicative + année) augmente le CTR sans faire de promesses YMYL.
  Instruction Claude: Remplace le Title actuel par un Title court, explicite et conforme YMYL. Suggestion à utiliser ou adapter : "APL famille (3 enfants) — estimation indicative 2026 : ≈87 €/mois | Simulez". Conserver mention "estimation indicative" pour rester prudent.
- Meta description: Trop vague, n'incite pas au clic et n'explique pas la valeur (simulateur, précision, lien CAF).
  Pourquoi: La meta influence le CTR en présentant l'avantage immédiat (obtenir une estimation rapide, pouvoir affiner avec le simulateur CAF).
  Instruction Claude: Écrire une meta description claire (140-160 caractères) qui mentionne le montant indicatif, l'appel à l'action et la limitation YMYL. Exemple : "Estimation indicative APL pour une famille de 3 enfants (≈87 €/mois). Utilisez notre simulateur gratuit et vérifiez la valeur finale sur caf.fr. Simulez maintenant."
- Hero / zone au-dessus de la ligne de flottaison: Contenu redondant et pas de réponse directe et courte visible en premier plan (featured snippet). Le CTA vers le simulateur complet n'est pas suffisamment mis en avant ni pré-rempli.
  Pourquoi: Les moteurs favorisent les pages qui donnent une réponse directe en haut. Un affichage clair du montant estimé et un CTA pré-rempli augmente chances de featured snippet et le passage au simulateur complet.
  Instruction Claude: Ajouter immédiatement sous le H1 un paragraphe en 1-2 phrases contenant la réponse directe et l'avertissement YMYL : "Estimation indicative : ≈87 €/mois pour une famille avec 3 enfants (2026). Valeur indicative — vérifiez sur caf.fr ou en utilisant le simulateur complet ci‑dessous." Mettre un bouton CTA visible « Ouvrir le simulateur (profil 3 enfants) » qui ouvre le simulateur complet avec paramètres pré-remplis (zone/loyer/nb enfants) via query string.
- Réponse directe / Featured snippet: La page n'optimise pas la réponse structurée (format court + contexte) attendue pour un featured snippet.
  Pourquoi: Bing/Google montrent souvent un encart si la réponse est courte, chiffrée et immédiatement compréhensible. Pour pSEO, capter ce snippet améliore le trafic qualifié.
  Instruction Claude: Créer un bloc HTML simple au format question/réponse ou tableau 1 ligne : "Quel est l'APL pour une famille de 3 enfants (2026) ? → ≈87 € / mois (estimation indicative)." Insérer ce bloc au sommet du contenu. Ajouter une phrase courte expliquant les principaux facteurs (loyer, ressources, zone).
- CTA (simulateur): Le CTA existe mais n'est pas focalisé ni pré-rempli pour le cas '3 enfants' ; visibilité moyenne.
  Pourquoi: Un CTA pré-rempli réduit la friction, augmente les conversions vers la page de simulation complète et les signaux d'engagement (temps sur site, sessions par utilisateur).
  Instruction Claude: Rendre le CTA principal plus visible (couleur contrastée) et ajouter lien avec paramètres pré-remplis : /simulateur-apl?enfants=3&loyer=[valeur par défaut]&zone=[id]. Si l'embed du simulateur est possible, afficher un iframe ou widget minimal dans le hero (sécuriser les performances).
- FAQ: Questions existantes mais formulation et structure non optimisées pour snippets et recherche vocale. Pas de balisage FAQ schema.
  Pourquoi: FAQ optimisée + FAQPage schema augmentent les chances d'apparaitre en rich result et répondent aux requêtes longues des utilisateurs (intention informationnelle).
  Instruction Claude: Reformuler/ajouter 6-8 questions courtes, prioritiser celles qui sont des requêtes probables (voir liste ci-dessous). Implémenter JSON-LD FAQPage avec Q/A courtes (20–40 mots) et neutres : ex. "Quel est le montant moyen de l'APL pour une famille de 3 enfants en 2026 ?" → "En 2026, estimation indicative ≈87 €/mois ; le montant exact dépend du loyer, des ressources et de la zone géographique. Vérifiez sur caf.fr."
- Maillage interne (lien retour hub/pilier): Absence/insuffisance de lien clair vers la page hub APL ou simulateur principal.
  Pourquoi: Pour pSEO, il faut remonter le signal vers le hub/pilier pour renforcer la pertinence thématique et faciliter la navigation utilisateur.
  Instruction Claude: Ajouter 2 liens internes dans le paragraphe d'intro et le bloc 'Comment utiliser cette estimation' : ancre 'Simulateur APL complet' vers /pages/apl/simulateur (ou le hub APL). Ajouter aussi un lien 'Guide APL 2026' vers la page pilier principale.
- Bloc calcul / méthodologie: La méthodologie est listée mais pas synthétisée en 3 points ni pas de transparence sur l'origine des hypothèses (sources CAF, année de référence).
  Pourquoi: En YMYL, la transparence sur les sources augmente la confiance utilisateur et les signaux E-A-T. Les moteurs favorisent contenu sourcé et lisible.
  Instruction Claude: Ajouter un mini-bloc 'Méthode en 3 points' : 1) sources (CAF, barèmes 2026), 2) hypothèse standard utilisée (revenu, loyer, zone), 3) marge d'erreur. Lier vers les sources officielles (caf.fr, textes). Ne pas promettre d'exactitude.

Keywords Bing a injecter:
- montant apl famille 3 enfants 2026 -> Title / Hero / FAQ (Pas de données Bing directes fournies dans le brief initial ; injecter expressions usuelles de recherche que Bing/Google pourraient utiliser pour ce pSEO.)
- estimation APL 3 enfants -> Meta description / Réponse directe (Formulation courte utilisée dans l'encart réponse pour capter featured snippet.)
- simulateur APL famille 3 enfants -> CTA / Maillage interne (Utiliser comme ancre pour le lien pré-rempli vers le simulateur complet.)

Safe changes first:
- Modifier le Title pour inclure la mention 'estimation indicative' et la valeur approximative.
- Réécrire la meta description pour préciser l'estimation et appeler au simulateur.
- Ajouter en haut du contenu une ligne de réponse directe (≈87 €/mois) avec avertissement YMYL.
- Rendre le CTA vers le simulateur plus visible et pré-rempli pour '3 enfants'.
- Ajouter JSON-LD FAQPage pour les questions/réponses existantes (sans donner de conseils juridiques/financiers détaillés).

Brief Claude:
- Objectif: Augmenter le CTR et la visibilité organique pour la requête 'APL famille 3 enfants' en fournissant une réponse directe concise, des CTA pré-remplis vers le simulateur complet et un maillage fort vers le hub APL, tout en respectant les contraintes YMYL (précaution, sources officielles).
- A conserver:
  - La mention explicite que le montant est une estimation indicative.
  - La référence au simulateur complet et l'invitation à vérifier sur caf.fr.
  - Les hypothèses importantes et la méthodologie (mais résumées).
- A corriger:
  - Title et meta pour améliorer le CTR sans promesse catégorique.
  - Hero pour afficher une réponse directe courte et visible (optimisée pour featured snippet).
  - CTA pour pointer vers le simulateur complet avec paramètres pré-remplis (3 enfants).
  - FAQ pour être structurée en FAQPage schema et couvrir les requêtes fréquentes.
  - Maillage interne pour renvoyer clairement au hub/pilier APL.

## /pages/guide-complet-impot-revenu-2026
- Fichier local: `src\pages\guide-complet-impot-revenu-2026.html`
- Type: hub_or_pillar
- Score fusionne: 144.27
- Resume priorite: Priorité haute — page pilier YMYL avec fort potentiel CTR (1538 impressions, CTR 1.04%, position ~10.6). Actions rapides : corriger title/meta, ajouter réponse directe courte (featured-snippet friendly), optimiser hero + CTA vers simulateur, structurer FAQ en JSON‑LD, renforcer maillage interne vers simulateurs et pages officielles, et clarifier bloc calcul. Rester prudent sur formulations (YMYL) et systématiquement citer impots.gouv.fr.

Zones a corriger:
- Title (balise <title>): Titre long mais correct ; possible meilleure formulation SEO/CTR. Actuel : 'Guide complet de l'impôt sur le revenu 2026 : barème, calcul et déclaration - LesCalculateurs'.
  Pourquoi: Le title influence CTR et pertinence. Améliorer l'accroche (action + année + promesse mesurée) peut faire passer la page en 1ère page et améliorer le taux de clic sans changer le contenu légal.
  Instruction Claude: Proposer 3 variantes de title (max 60–65 caractères visibles) orientées CTR tout en restant factuelles et prudentes. Exemples attendus (ne pas remplacer automatiquement) :
- 'Impôt sur le revenu 2026 — barème, calcul & simulateur gratuit | LesCalculateurs'
- 'Barème IR 2026 (mis à jour) : calcul, déclaration & simulateur'
- 'Guide impôt 2026 — barème, calcul indicatif (sources officielles)'
Consignes YMYL : éviter promesses absolues ('payez moins') et écrire 'estimateur indicatif' si mention de simulation. Indiquer toujours la source officielle dans le meta ou sous le titre si possible.
- Meta description: Meta actuelle tronquée ('Guide complet de l'). Absence de description convaincante pour améliorer CTR.
  Pourquoi: La meta description est l'extrait principal dans les SERP — une bonne meta augmente fortement le CTR surtout sur une page pilier YMYL en concurrence.
  Instruction Claude: Rédiger 2 propositions de meta (120–155 caractères) claires et click‑friendly, incluant : mise à jour 2026, revalorisation + mention 'estimation indicative', CTA vers le simulateur et référence impots.gouv.fr. Exemple attendu (format à adapter) : 'Barème 2026 revalorisé — comment calculer votre impôt 2026 (simulateur gratuit). Informations indicatives, montant définitif sur impots.gouv.fr.'
- Hero / zone supérieure (above the fold): Hero contient beaucoup de texte et éléments mais manque d'une 'réponse directe' courte, d'un CTA clair et d'un lien vers la source officielle. Les emojis dans H2/Hero risquent d'affecter lisibilité SERP.
  Pourquoi: Les 1ères secondes décident du taux de rebond et du clic vers le simulateur. Une réponse concise augmente les chances de featured snippet et améliore UX mobile.
  Instruction Claude: Ajouter en haut du contenu un encadré 'Réponse rapide' de 1–2 phrases (max 30–40 mots) qui donne le barème le plus important et la revalorisation 2026 (ex. 'Barème 2026 : 0% jusqu'à 11 294 € ; 11% 11 295–28 797 € ; 30% 28 798–82 341 € ; revalorisation +2% vs 2025 — estimation indicative. Source : impots.gouv.fr').
- Placer en dessous un CTA primaire visible : 'Simuler mon impôt 2026' (bouton contrasté, anchor vers simulateur). 
- Conserver l'avertissement YMYL : 'Information indicative — montant définitif sur impots.gouv.fr'.
- Supprimer ou limiter les emojis dans les H2 (tester A/B sans emojis) ; garder lisibilité et crawlabilité.
- Réponse directe / Featured snippet: Pas d'encadré court et structuré pour capter featured snippet. Le texte actuel est long et dispersé.
  Pourquoi: Un paragraphe factuel et formaté (liste ou tableau court) augmente les chances d'apparition en position zéro et améliore CTR.
  Instruction Claude: Créer une 'boîte réponse' HTML en début de contenu avec : 1) 1 phrase synthétique, 2) minitableau 2 colonnes listing tranches+taux ou une liste à puces, 3) 1 ligne sur revalorisation 2026 et 1 lien vers la source officielle. Formuler en termes prudents ('estimation indicative'). Ne pas donner de conseils fiscaux personnalisés.
- CTA (call-to-action): CTA existant discret. Pas de CTA secondaire stratégiquement placé (ex : 'Voir le barème détaillé', 'Comparer 2025/2026').
  Pourquoi: Objectif de la page hub = alimenter les simulateurs et pages de conversion. CTAs clairs augmentent la conversion interne et les sessions profondes (bon pour SEO).
  Instruction Claude: Proposer 2–3 libellés CTA optimisés : 'Simuler mon impôt 2026' (primary), 'Voir le barème détaillé' (anchor vers section), 'Comparer 2025 vs 2026' (anchor vers comparatif). Indiquer emplacement : hero (primary), sticky header ou floating button mobile (primary), et en fin de chaque section importante (secondary).
- FAQ + balisage structuré (JSON‑LD): FAQ non optimisée pour le moteur ; absence de balises FAQPage JSON‑LD.
  Pourquoi: FAQ schema augmente visibilité dans SERP et capte des requêtes longue traîne ; important pour paires de requêtes fiscales (YMYL) où l'internaute cherche réponses courtes.
  Instruction Claude: Identifier 8–10 FAQ de haut impact (voir suggestions ci‑dessous). Pour chaque question, fournir une réponse courte (30–70 mots) factuelle et sourcée, puis produire JSON‑LD FAQPage valide. Questions à inclure :
- 'Quel est le barème de l'impôt sur le revenu 2026 ?'
- 'Quelle est la revalorisation des seuils en 2026 ?'
- 'Comment calculer mon impôt 2026 ?'
- 'Où déclarer mes revenus 2026 ?' 
- 'Quelles nouveautés fiscales 2026 influencent l'impôt sur le revenu ?' 
Rappel YMYL : réponses indicatives + renvoi systématique vers impots.gouv.fr pour validation officielle.
- Maillage interne (liens internes): Maillage pas assez orienté conversion (peu de liens vers simulateurs et pages détaillées).
  Pourquoi: Renforce l'autorité du hub, améliore crawl et distribue le trafic vers pages transactionnelles (simulateur), ce qui peut améliorer les conversions et les signaux comportementaux.
  Instruction Claude: Ajouter des liens contextuels avec ancres naturelles vers : simulateur impôt (page de conversion principale), page plafonnement du quotient familial, pages sur crédits d'impôts et réductions, comparatif 2025 vs 2026, et la page source impots.gouv.fr. Exemples d'ancres : 'Simulateur impôt 2026', 'Plafonnement du quotient familial (2026)', 'Crédits et réductions d'impôt 2026'. Prioriser 3 liens dans la zone supérieure et 1–2 par section clé.
- Bloc calcul / simulateur intégré: Si présent, le bloc calcul doit être visible, accessible et proposer un exemple prérempli ; vérifiez accessibilité et SEO (JS rend peut empêcher l'indexation).
  Pourquoi: Le simulateur est la conversion principale ; mauvais placement ou UX réduit les conversions. Pour YMYL, les résultats doivent être présentés comme 'estimation'.
  Instruction Claude: S'assurer que : 1) le simulateur est placé dans le hero ou juste après la réponse directe, 2) il propose un exemple prérempli 'cas type' (salarié célibataire 30k€/an) affichant décomposition (revenu net imposable, impôt brut, taux moyen), 3) chaque résultat comporte mention 'estimation indicative — montant définitif sur impots.gouv.fr', 4) le bloc fonctionne sans JS critique (ou fournir une alternative HTML/serveur) pour accessibilité et crawl. Ajouter boutons 'Copier l'estimation' et 'Voir détail du calcul'.

Keywords Bing a injecter:
-  ->  (Aucune requête Bing fournie à exploiter.)
- (aucun) -> none (Aucun keyword Bing disponible dans les données fournies ; se concentrer sur requêtes Google/intent utilisateurs.)

Safe changes first:
- Corriger la meta description (remplacer la chaîne tronquée) et le title (choix entre 3 variantes proposées).
- Ajouter la 'réponse directe' courte en haut de page avec source impots.gouv.fr.
- Mettre un CTA primaire visible 'Simuler mon impôt 2026' dans le hero.
- Ajouter JSON‑LD FAQ (8–10 questions) et balisage Article/Organization basique.
- Insérer 3 liens internes prioritaires vers simulateur et pages détaillées (plafonnement, crédits).
- Vérifier que le simulateur propose un exemple prérempli et affiche mention 'estimation indicative'.

Brief Claude:
- Objectif: Augmenter le CTR et l'engagement (plus de clics vers le simulateur) et améliorer la probabilité d'obtenir un featured snippet tout en respectant les contraintes YMYL (prudence, sources officielles).
- A conserver:
  - H1 actuel 'Impôt sur le revenu 2026 : le guide complet' (titre pilier clair).
  - Tous les montants et barèmes déjà présents — vérifier leur exactitude avant publication.
  - Avertissement YMYL visible (information indicative / 'montant définitif sur impots.gouv.fr').
  - Ton factuel et non‑prometteur (éviter conseils personnalisés directs).
- A corriger:
  - Meta description tronquée — remplacer par une meta complète orientée CTR.
  - Ajouter une réponse directe courte en haut du contenu (1–2 phrases + mini‑tableau des tranches).
  - CTA primaire visible et multiple emplacement (hero, sticky mobile, fin d'article).
  - FAQ structurée en JSON‑LD (8–10 questions) avec réponses courtes et sourcées.
  - Renforcer maillage interne vers simulateur et pages d'approfondissement.
  - Rendre le bloc calcul plus accessible et clairement indiqué comme estimation.

## /pages/aah
- Fichier local: `src\pages\aah.html`
- Type: hub_or_pillar
- Score fusionne: 141.88
- Resume priorite: Améliorer la visibilité (CTR et position) et la confiance (YMYL) : corriger title et meta pour meilleure promesse sans être trompeur, ajouter une 'réponse directe' courte et sourcée en haut (snippet-ready), renforcer CTA et microcopies du simulateur (indication de durée, caractère indicatif, date de mise à jour), structurer les FAQ avec balisage, et améliorer le maillage interne vers pages CAF/MDPH/majors connexes. Priorité sécurité YMYL : clairement indiquer sources (CAF, Service‑Public, MDPH), date de mise à jour et ne pas promettre d'allocations fermes.

Zones a corriger:
- Title: Titre trop générique, format et promesse à optimiser pour CTR sans être trompeur (YMYL).
  Pourquoi: Le title est le premier levier d'amélioration du CTR sur Google; une bonne formulation augmente les clics et donne plus de trafic qualifié. Pour une page YMYL, il faut être précis et prudent (éviter promesses définitives).
  Instruction Claude: Proposer 2 variantes optimisées (max ~60 caractères) : une orientée CTR et une neutre/institutionnelle. Exemple d'orientation : « Simulateur AAH 2026 — Estimation indicative en 2 min (CAF/MDPH) ». Indiquer longueur en caractères, éviter emojis sauf si cohérent avec site.
- Meta description: Description actuelle contient emojis et formulation marketing (« résultat immédiat ! ») — gagner en clarté et en confiance en exposant bénéfices et limites (YMYL).
  Pourquoi: La meta doit encourager le clic tout en préparant l'utilisateur au caractère indicatif de l'estimation. Eviter affirmations contractuelles pour YMYL.
  Instruction Claude: Proposer une meta de 120–155 caractères qui : 1) mentionne simulateur gratuit, 2) indique durée estimée (ex. 2 min), 3) rappelle caractère indicatif et références (CAF/MDPH), 4) inclut appel à l'action doux. Fournir 2 options (CTA vs neutre).
- Hero / Above the fold (H1 + accroche): H1 ok, mais absence d'une 'réponse directe' courte et sourcée visible immédiatement (featured-snippet candidate).
  Pourquoi: Google privilégie les pages qui donnent une réponse courte et structurée en haut de page; cela aide au passage en position zéro et augmente le taux de clics internes.
  Instruction Claude: Proposer un bloc de 1–2 phrases placé directement sous H1 : réponse synthétique (eligibilité courte + action recommandée). Expliquer formulation non-numérique ou vérifier montants avant d'afficher nombres (YMYL). Ajouter source(s) entre parenthèses et date de mise à jour.
- Bloc calcul / simulateur: Le simulateur existe mais le contenu autour manque de microcopies rassurantes (sécurité des données, caractère indicatif, délais, date des barèmes).
  Pourquoi: Pour YMYL, les utilisateurs doivent savoir si le résultat est fiable et quelles sources sont utilisées. Clarifier évite méfiance et réduit rebond.
  Instruction Claude: Ajouter microcopies visibles : « Estimation indicative — résultat non contractuel », « Basé sur barèmes CAF 2026 (mise à jour JJ/MM/2026) », durée approximative (ex. 2 min), et bouton CTA explicite « Lancer la simulation — estimation en 2 min ». Vérifier que le simulateur n'enregistre pas de données sensibles; si oui, afficher politique de confidentialité et anonymisation.
- CTA principal: CTA existant trop neutre; il faut renforcer promesse d'usage sans exagération.
  Pourquoi: Une CTA claire et utile augmente le taux d'engagement sur l'outil principal (objectif business du hub).
  Instruction Claude: Proposer 2 variantes de libellé court : 1) conversion rapide « Lancer la simulation — 2 min (estimation indicative) », 2) rassurant « Estimer mon AAH — gratuit et non contractuel ». Positionner CTA répété en sticky ou après chaque explication courte.
- FAQ (bloc ciblé): FAQ peu structurée et absence de balisage FAQ schema.org; questions peu orientées featured snippets.
  Pourquoi: FAQ bien formulée + balisage augmente chances d'apparition en rich results sur Google et Bing, répond directement aux requêtes utilisateurs (YMYL).
  Instruction Claude: Fournir 6–8 questions courtes et leurs réponses (40–70 mots) prêtes à l'emploi : ex. « Qui peut recevoir l'AAH ? », « Comment est calculée l'AAH ? », « Quels justificatifs pour la MDPH ? », « L'AAH est-elle imposable ? ». Ajouter FAQ schema JSON‑LD et indiquer sources pour chaque réponse (CAF, Service‑Public).
- Maillage interne (liens hub): Liens internes vers pages connexes (MDPH, CAF, MVA, aides proches) insuffisants ou pas optimisés avec ancres riches.
  Pourquoi: Renforce l'autorité du hub, aide Google à comprendre l'intention et répartit le jus SEO vers pages transactionnelles/pSEO.
  Instruction Claude: Lister 6 pages à lier obligatoirement avec texte d'ancrage exact : « Guide MDPH », « Barèmes CAF 2026 », « Majoration pour Vie Autonome (MVA) », « APL / RSA simulateurs », « Formulaire AAH », « FAQ administrative AAH ». Préconiser ajout d'un lien retour (breadcrumb) vers la page hub des simulateurs.
- Hn et structure du contenu: H2 trop nombreux et partiellement redondants (double 'Résumé rapide').
  Pourquoi: Une structure claire aide le crawl et la compréhension par les moteurs; les Hn sont utilisés pour snippets.
  Instruction Claude: Normaliser H2/H3 : garder H1, H2 pour sections majeures (Résumé, Éligibilité, Calcul, Exemple, FAQ, Sources), H3 pour étapes du calcul/inputs. Supprimer doublons et remplacer 'Résumé rapide (old)' par une version courte actualisée.

Keywords Bing a injecter:
-  -> none (Aucune requête Bing fournie; se concentrer sur requêtes Google et on‑page signals.)
- simulateur AAH 2026 -> title, meta, hero, H2 (Même si Bing ne propose pas de keywords, injecter la requête principale naturellement dans title, meta, et H2 pour cohérence multi‑moteurs.)

Safe changes first:
- Corriger title et meta (A/B deux variantes) — modifications à faible risque.
- Ajouter microcopy indiquant caractère indicatif, sources et date de mise à jour en haut de page.
- Modifier libellé du CTA principal pour préciser durée et caractère gratuit/indicatif.
- Nettoyer H2 redondants et harmoniser la hiérarchie des titres.
- Ajouter FAQ schema JSON‑LD simple (sans modifier substantiellement le contenu).

Brief Claude:
- Objectif: Fournir un plan d'actions SEO/UX concret et priorisé pour améliorer CTR, lisibilité et conformité YMYL de la page Simulateur AAH 2026, sans réécrire l'intégralité de la page. Tous les changements doivent renforcer la confiance (sources, date, disclaimer) et préparer la page aux featured snippets/rich results.
- A conserver:
  - Le H1 actuel (Simulation AAH 2026 : estimation du montant selon la CAF et la MDPH) — à conserver ou reformuler très légèrement si nécessaire.
  - Le simulateur lui‑même et son emplacement principal sur la page.
  - Les mentions indiquant que le résultat est indicatif et que les organismes officiels restent décisionnaires (doivent être clarifiées, pas supprimées).
  - Sources officielles (CAF, Service‑Public, MDPH) visibles et citées.
- A corriger:
  - Title : proposer variantes optimisées, courte, CTR‑friendly, sans promesses fermes.
  - Meta description : version claire, limitant promesses, indiquant durée et sources.
  - Hero : insérer 'réponse directe' courte et sourcée sous H1 (snippet candidate).
  - CTA : libellés plus explicites et répétés; ajouter CTA secondaire vers pages officielles.
  - Bloc calcul : ajouter microcopy sur durée, caractère indicatif, date des barèmes et confidentialité des données; vérifier qu'aucune donnée sensible n'est stockée ou, si stockée, afficher politique.
  - FAQ : ajouter 6–8 Q/R concises et implémenter FAQ schema.
  - Hn : supprimer redondances et normaliser structure H2/H3.
  - Maillage : ajouter liens internes prioritaires avec ancres riches vers MDPH, CAF, MVA, simulateurs proches et formulaire AAH.

## /pages/apl/apl-chomage-loyer-moyen
- Fichier local: `src\pages\apl\apl-chomage-loyer-moyen.html`
- Type: pseo
- Score fusionne: 136.04
- Resume priorite: Améliorer le Title/Meta, rendre le hero (réponse directe) visible et orienté featured snippet, renforcer CTA vers le simulateur et le hub, expliciter hypothèses du bloc calcul et ajouter balisage FAQ. Respecter la nature YMYL : garder la mention « estimation indicative » et un lien vers CAF. Ces changements sont prioritaires pour augmenter CTR et capter le featured snippet sans promettre de résultats définitifs.

Zones a corriger:
- Title: Titre actuel trop neutre et peu orienté CTR / featured snippet ; n'inclut pas un format chiffré immédiat.
  Pourquoi: Le title est le premier élément qui influence le CTR sur Google/Bing. Un titre contenant un chiffre/estimation et l'intention exacte (personne au chômage) augmente les clics et la probabilité de rich result.
  Instruction Claude: Remplacer le title par une version plus clicable qui garde la prudence YMYL. Exemple recommandé (ne pas promettre) : « Estimation APL 2026 — personne au chômage (loyer moyen) ≈312 €/mois (indicatif) ». Veiller à rester < 60–70 caractères si possible. Conserver année 2026.
- Meta description: Description trop courte et peu engageante ; n'incite pas au clic ni à l'utilisation du simulateur.
  Pourquoi: Une meta descriptive et orientée action augmente le CTR et guide les utilisateurs vers le simulateur ou la vérification officielle (CAF), important en pSEO YMYL.
  Instruction Claude: Remplacer la meta par une phrase informative + CTA. Exemple : « Estimation indicative APL 2026 pour une personne au chômage avec loyer moyen — ≈312 €/mois. Utilisez notre simulateur complet et vérifiez vos droits sur caf.fr. » Inclure 'indicatif' et 'verifiez sur caf.fr' pour prudence YMYL.
- Hero / Zone visible en haut (réponse directe): Le hero ne met pas assez en avant la réponse directe sous forme snippetable (une ligne claire avec le montant + contexte). Les hypothèses de calcul ne sont pas immédiatement visibles.
  Pourquoi: Les featured snippets privilégient une réponse concise + chiffre placé haut dans la page. Les utilisateurs doivent voir la réponse immédiate (=> meilleur CTR, meilleure présence SERP).
  Instruction Claude: Créer un bloc hero compact en haut du contenu avec : (1) une phrase directe en une ligne : « Estimation APL ≈312 €/mois pour une personne seule au chômage (loyer moyen) — montant indicatif. » (2) un mini-ligne d'explication en 1–2 phrases mentionnant les principales variables (loyer, zone, ressources, situation administrative) et un lien conspicue vers le simulateur complet et vers caf.fr. Utiliser un H2 ou un paragraphe juste après le H1 pour favoriser le featured snippet.
- H1 / Titres: H1 identique au title, bonne cohérence mais perdre l'occasion d'avoir un H1 légèrement plus naturel/longtail et d'utiliser un H2 pour la réponse directe.
  Pourquoi: Conserver un H1 cohérent et réserver un H2 proche pour la 'one-line answer' favorise l'extraction par les moteurs pour featured snippet.
  Instruction Claude: Conserver le H1 actuel ou l'ajuster en version naturelle : « APL au chômage : estimation indicative (loyer moyen, 2026) ». Immédiatement après le H1, ajouter un H2 contenant la réponse directe (voir instruction hero).
- Réponse directe / Featured snippet: La page commence par du texte descriptif long ; pas d'encadré court et formaté pour featured snippet.
  Pourquoi: Les extraits optimisés apparaissent souvent quand une question reçoit une réponse courte et structurée en début de page (1-2 phrases + chiffre).
  Instruction Claude: Ajouter un paragraphe de 1 phrase (max 20–30 mots) contenant le chiffre et la formule 'pour qui' : « ≈312 €/mois pour une personne seule au chômage (loyer moyen) — estimation indicative ». Entourer ce paragraphe d'un balisage HTML simple (p ou div avec classe 'answer-snippet') et le placer avant tout long texte explicatif.
- Bloc calcul / hypothèses visibles: Le montant est affiché mais les hypothèses précises (loyer retenu, zone, ressources prises en compte) sont peu visibles et pas synthétiques.
  Pourquoi: Pour la confiance utilisateur et pour répondre aux exigences YMYL, il faut exposer clairement les hypothèses. Cela réduit les retours négatifs et les visites courtes.
  Instruction Claude: Ajouter sous le montant un petit encadré 'Hypothèses utilisées' listant en bullet points : personne seule, chômage, loyer moyen = X € (indiquer valeur), zone = 'zone standard', ressources prises = 0€/mois (ou préciser). Ajouter un lien 'Voir le détail du calcul' qui ouvre la section 'Méthodologie et sources' ou un modal. Indiquer la date de mise à jour du calcul.
- CTA principal et secondaire: CTA insuffisamment mis en valeur ; pas d'appel secondaire vers caf.fr. Aucune incitation mesurable (tracking).
  Pourquoi: Le but pSEO est de convertir le trafic vers le simulateur/hub tout en restant factuel; CTA clairs augmentent les conversions et aident l'algorithme à comprendre la valeur de la page.
  Instruction Claude: Mettre un CTA primaire bouton visible 'Ouvrir le simulateur APL complet' (texte exact à utiliser), et un CTA secondaire 'Vérifier sur caf.fr' (ouvre site officiel). Ajouter tracking data-attributes (data-ga/onclick) et couleur contrastée. Placer ces CTA dans le hero et en bas du bloc calcul.
- FAQ (Structured data): La FAQ existe mais manque d'optimisation pour le balisage JSON-LD et de réponses concises, sourcées et prudentes pour YMYL.
  Pourquoi: Balisage FAQPage augmente la probabilité d'apparition en rich results et rassure les utilisateurs sur des sujets sensibles. Les réponses longues ou non sourcées peuvent nuire à la qualité perçue.
  Instruction Claude: Limiter la FAQ à 5–8 questions prioritaires (ex : 'Qui peut toucher l'APL au chômage ?', 'Comment le loyer est-il pris en compte ?', 'Faut-il déclarer le RSA ?', 'Où vérifier vos droits ?'). Rédiger réponses courtes (1–2 phrases), terminer par 'Estimation indicative — vérifiez sur caf.fr' lorsque nécessaire. Implémenter JSON-LD FAQPage avec ces Q/A.

Keywords Bing a injecter:
- aucun -> aucun (Aucun mot-clé Bing spécifique fourni — se concentrer sur intent utilisateur et featured snippet.)
-  ->  ()

Safe changes first:
- Mettre à jour Title et Meta description par les formulations recommandées (faible risque).
- Ajouter bloc hero 'réponse directe' (1 phrase + montant) juste après H1.
- Afficher les hypothèses visibles sous le montant (bullets courts) et date de mise à jour.
- Rendre CTA principal bien visible et ajouter CTA secondaire vers caf.fr.
- Ajouter JSON-LD FAQPage pour 5–8 questions prioritaires.

Brief Claude:
- Objectif: Augmenter le CTR et la visibilité en SERP (incl. featured snippet) pour la page pSEO tout en respectant la prudence requise pour un contenu YMYL : fournir une estimation claire, sourcée, et conduite vers le simulateur/hub et la vérification officielle.
- A conserver:
  - Mention explicite 'Estimation indicative' et lien visible vers caf.fr.
  - Le montant estimé actuel (~312 €/mois) si basé sur le moteur interne (conserver si vérifié).
  - La méthodologie et sources existantes (ne pas supprimer les détails).
- A corriger:
  - Title et meta description pour améliorer CTR (propositions fournies).
  - Ajouter un bloc réponse courte formatée pour featured snippet.
  - Rendre les hypothèses du calcul immédiatement visibles et traçables.
  - CTA clair vers le simulateur et CTA secondaire vers CAF; ajouter tracking.
  - FAQ courte, sourcée et JSON-LD pour rich results.

