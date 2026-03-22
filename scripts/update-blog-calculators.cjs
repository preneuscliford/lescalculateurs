const fs = require("fs");
const path = require("path");

// Baremes de notaire
const baremes = {
  tranches: [
    { min: 0, max: 6500, taux: 0.03945 },
    { min: 6500, max: 17000, taux: 0.0165 },
    { min: 17000, max: 60000, taux: 0.011 },
    { min: 60000, max: 999999999, taux: 0.00825 },
  ],
  tva: 0.2,
  csi: { taux: 0.001, minimum: 15 },
};

// Taux de droits par departement
const tauxParDepartement = {
  75: 0.059,
  92: 0.059,
  93: 0.059,
  94: 0.059,
  78: 0.059,
  91: 0.059,
  95: 0.059,
  77: 0.058,
  13: 0.058,
  69: 0.058,
  59: 0.058,
  "06": 0.058,
  31: 0.058,
  33: 0.058,
  44: 0.058,
  34: 0.058,
  67: 0.058,
  35: 0.058,
  38: 0.058,
  83: 0.058,
  62: 0.058,
  76: 0.058,
  84: 0.058,
  30: 0.058,
  17: 0.058,
  "2A": 0.045,
  "2B": 0.045,
  default: 0.058,
};

// Frais par departement
const fraisParDepartement = {
  default: { cadastre: 125, conservation: 150, formalites: 200 },
};

function getCalculFunction(departement) {
  const tauxDroits =
    tauxParDepartement[departement] || tauxParDepartement.default;
  const frais = fraisParDepartement[departement] || fraisParDepartement.default;

  return `calculate: (values) => {
                  try {
                    const prixAchat = Number(values.prix_achat) || 0;
                    const montantMobilier = Number(values.montant_mobilier) || 0;
                    const typeBien = values.type_bien;
                    
                    if (!isFinite(prixAchat) || prixAchat <= 0) {
                      return { success: false, error: "Veuillez saisir un prix d'acquisition valide." };
                    }
                    if (montantMobilier < 0 || montantMobilier > prixAchat) {
                      return { success: false, error: "Le mobilier doit etre entre 0 et le prix d'acquisition." };
                    }

                    const prixNetImmobilier = prixAchat - montantMobilier;
                    
                    // Calcul des emoluments selon les tranches officielles
                    let emoluments = 0;
                    const tranches = [
                      { min: 0, max: 6500, taux: 0.03945 },
                      { min: 6500, max: 17000, taux: 0.0165 },
                      { min: 17000, max: 60000, taux: 0.011 },
                      { min: 60000, max: 999999999, taux: 0.00825 },
                    ];
                    for (const tranche of tranches) {
                      const largeur = Math.max(tranche.max - tranche.min, 0);
                      const applicable = Math.min(Math.max(prixNetImmobilier - tranche.min, 0), largeur);
                      if (applicable <= 0) continue;
                      emoluments += applicable * tranche.taux;
                    }
                    emoluments = Math.round(emoluments * 100) / 100;

                    // Debours et formalites selon le type de bien
                    let debours = 330;
                    let formalites = 120;
                    if (typeBien !== "neuf") {
                      debours = ${frais.cadastre} + ${frais.conservation};
                      formalites = ${frais.formalites};
                    }

                    // CSI (fixe)
                    const csi = 50;

                    // Droits d'enregistrement
                    let tauxDroits = ${tauxDroits};
                    let droitsEnregistrement = 0;
                    if (typeBien === "neuf") {
                      tauxDroits = 0.00715;
                    }
                    droitsEnregistrement = Math.round(prixNetImmobilier * tauxDroits * 100) / 100;

                    // TVA (20% sur emoluments + formalites)
                    const tva = Math.round((emoluments + formalites) * 0.2 * 100) / 100;

                    // Total
                    const total = Math.round((emoluments + droitsEnregistrement + debours + formalites + csi + tva) * 100) / 100;
                    const pourcentage = prixAchat > 0 ? Math.round((total / prixAchat) * 10000) / 100 : 0;

                    return {
                      success: true,
                      data: {
                        prixAchat,
                        prixNetImmobilier,
                        montantMobilier,
                        emoluments,
                        droitsEnregistrement,
                        debours,
                        formalites,
                        csi,
                        tva,
                        total,
                        pourcentage,
                        typeBien,
                        departement: values.departement,
                        tauxDroits,
                      },
                    };
                  } catch (e) {
                    console.error("Calcul notaire - erreur:", e);
                    return { success: false, error: "Erreur lors du calcul." };
                  }
                }`;
}

function getFormatResultFunction() {
  return `formatResult: (result) => {
                const d = result.data;
                const fmt = (n) => {
                  if (n === undefined || n === null || isNaN(n)) return "0 €";
                  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
                };
                return '<div class="space-y-2 text-sm">'
                  + '<div class="flex justify-between"><span>Emoluments du notaire :</span><span class="font-medium">' + fmt(d.emoluments) + '</span></div>'
                  + '<div class="flex justify-between"><span>Droits d'enregistrement :</span><span class="font-medium">' + fmt(d.droitsEnregistrement) + '</span></div>'
                  + '<div class="flex justify-between"><span>Debours :</span><span class="font-medium">' + fmt(d.debours) + '</span></div>'
                  + '<div class="flex justify-between"><span>Formalites diverses :</span><span class="font-medium">' + fmt(d.formalites) + '</span></div>'
                  + '<div class="flex justify-between"><span>CSI :</span><span class="font-medium">' + fmt(d.csi) + '</span></div>'
                  + '<div class="flex justify-between"><span>TVA (20%) :</span><span class="font-medium">' + fmt(d.tva) + '</span></div>'
                  + '<div class="flex justify-between border-t pt-2 font-bold"><span>Total frais de notaire :</span><span class="text-green-600">' + fmt(d.total) + '</span></div>'
                  + '<div class="text-xs text-gray-600 mt-1">' + d.pourcentage.toFixed(2) + '% du prix</div>'
                  + '</div>';
              }`;
}

// Pattern a chercher et remplacer
const oldCalculatePattern =
  /calculate:\s*\(values\)\s*=>\s*\{[\s\S]*?return\s*\{[\s\S]*?success:\s*true,[\s\S]*?data:[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}/;
const oldFormatPattern =
  /formatResult:\s*\(result\)\s*=>\s*\{[\s\S]*?return[\s\S]*?\};/;

function updateBlogFile(filePath, departement) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");

    const newCalculate = getCalculFunction(departement);
    const newFormat = getFormatResultFunction();

    // Remplacer la fonction calculate
    content = content.replace(oldCalculatePattern, newCalculate);

    // Remplacer la fonction formatResult
    content = content.replace(oldFormatPattern, newFormat + ",");

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Mise a jour: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur pour ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

// Traiter tous les fichiers de departement
const deptDir = path.join(__dirname, "../src/pages/blog/departements");
const files = fs
  .readdirSync(deptDir)
  .filter((f) => f.startsWith("frais-notaire-") && f.endsWith(".html"));

console.log(`\n🔄 Mise a jour de ${files.length} articles de departement...\n`);

let successCount = 0;
let failCount = 0;

files.forEach((file) => {
  // Extraire le numero du departement du nom de fichier
  const match = file.match(/frais-notaire-([^.]+)\.html/);
  if (match) {
    const departement = match[1];
    const filePath = path.join(deptDir, file);
    if (updateBlogFile(filePath, departement)) {
      successCount++;
    } else {
      failCount++;
    }
  }
});

console.log(
  `\n✨ Resultat: ${successCount}/${files.length} mises a jour reussies`
);
if (failCount > 0) {
  console.log(`⚠️  ${failCount} fichiers n'ont pas pu etre mis a jour`);
}
console.log(
  "\n📝 N'oubliez pas de commiter: git add -A && git commit -m 'refactor: update all blog calculators with detailed breakdown'"
);
