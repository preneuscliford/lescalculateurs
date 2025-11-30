const fs = require("fs");
const path = require("path");

// Charger les données depuis departements.json
const deptDataPath = path.join(__dirname, "../src/data/departements.json");
const deptData = JSON.parse(fs.readFileSync(deptDataPath, "utf-8"));

function updateBlogFile(filePath, departement) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    const depInfo = deptData[departement];

    if (!depInfo) {
      console.log(
        `⚠️  Département ${departement} non trouvé dans departements.json`
      );
      return false;
    }

    const tauxDroits = depInfo.tauxDroits || 0.058;
    const cadastre = depInfo.fraisDivers.cadastre || 125;
    const conservation = depInfo.fraisDivers.conservation || 155;
    const formalites = depInfo.fraisDivers.formalites || 200;

    // Trouver et remplacer la fonction calculate
    const calculateStart = content.indexOf("calculate: (values) => {");
    const calculateEnd = content.indexOf("formatResult:", calculateStart);

    if (calculateStart === -1 || calculateEnd === -1) {
      console.log(`⚠️  Structure non trouvée dans ${path.basename(filePath)}`);
      return false;
    }

    const newCalculate = `calculate: (values) => {
                  try {
                    const prixAchat = Number(values.prix_achat) || 0;
                    const montantMobilier = Number(values.montant_mobilier) || 0;
                    const typeBien = values.type_bien;
                    
                    if (!isFinite(prixAchat) || prixAchat <= 0) {
                      return { success: false, error: "Veuillez saisir un prix d'acquisition valide." };
                    }
                    if (montantMobilier < 0 || montantMobilier > prixAchat) {
                      return { success: false, error: "Le mobilier doit être entre 0 et le prix d'acquisition." };
                    }

                    const prixNetImmobilier = prixAchat - montantMobilier;
                    
                    // Calcul des émoluments selon les tranches officielles (IDENTIQUE AU CALCULATEUR PRINCIPAL)
                    let emoluments = 0;
                    const tranches = [
                      { min: 0, max: 6500, taux: 0.0387 },
                      { min: 6500, max: 17000, taux: 0.01596 },
                      { min: 17000, max: 60000, taux: 0.01064 },
                      { min: 60000, max: 999999999, taux: 0.00799 },
                    ];
                    for (const tranche of tranches) {
                      const largeur = Math.max(tranche.max - tranche.min, 0);
                      const applicable = Math.min(Math.max(prixNetImmobilier - tranche.min, 0), largeur);
                      if (applicable <= 0) continue;
                      emoluments += applicable * tranche.taux;
                    }
                    emoluments = Math.round(emoluments * 100) / 100;

                    // Débours et formalités selon le type de bien ET le département
                    let debours = 330; // Neuf: frais d'acte
                    let formalites = 120; // Neuf: formalités
                    
                    if (typeBien !== "neuf") {
                      // Ancien: cadastre + conservation (données du département)
                      debours = ${cadastre} + ${conservation}; // = ${
      cadastre + conservation
    }
                      formalites = ${formalites}; // Données du département
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

                    // TVA (20% sur émoluments + formalités)
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
                },
              `;

    // Remplacer calculate
    const before = content.substring(0, calculateStart);
    const after = content.substring(calculateEnd);
    content = before + newCalculate + after;

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(
      `✅ ${path.basename(filePath).padEnd(30)} | Taux: ${(
        tauxDroits * 100
      ).toFixed(
        1
      )}% | Cadastre: ${cadastre}€ | Conservation: ${conservation}€ | Formalités: ${formalites}€`
    );
    return true;
  } catch (error) {
    console.error(`❌ Erreur pour ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

// Traiter tous les fichiers de département
const deptDir = path.join(__dirname, "../src/pages/blog/departements");
const files = fs
  .readdirSync(deptDir)
  .filter((f) => f.startsWith("frais-notaire-") && f.endsWith(".html"));

console.log(
  `\n🔄 Mise à jour des mini calculateurs avec données de departements.json...\n`
);

let successCount = 0;
let failCount = 0;

files.forEach((file) => {
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
  `\n✨ Résultat: ${successCount}/${files.length} mises à jour réussies`
);
if (failCount > 0) {
  console.log(`⚠️  ${failCount} fichiers n'ont pas pu être mis à jour`);
}
console.log(
  "\n📊 Les calculateurs mini utilisent maintenant les vrais tarifs par département depuis departements.json"
);
