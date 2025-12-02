const fs = require("fs");
const path = require("path");

/**
 * Charge la liste des départements (code -> région) depuis src/data/departements.json
 */
function loadDepartements() {
  const p = path.resolve(__dirname, "../src/data/departements.json");
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  const byCode = new Map();
  for (const d of data) byCode.set(String(d.code), d);
  return byCode;
}

/**
 * Retourne une image Wikimedia représentative pour une région donnée
 */
function regionImage(region) {
  const catalog = {
    "Hauts-de-France": "https://commons.wikimedia.org/wiki/Special:FilePath/Grande%20Place,%20Bourse%20du%20travail%20et%20beffroi%20Lille%202.JPG",
    "Île-de-France": "https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg",
    "Provence-Alpes-Côte d'Azur": "https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_port_de_Marseille.JPG",
    "Auvergne-Rhône-Alpes": "https://commons.wikimedia.org/wiki/Special:FilePath/Basilique_de_Fourvi%C3%A8re-Lyon.JPG",
    "Occitanie": "https://commons.wikimedia.org/wiki/Special:FilePath/Capitole%20de%20Toulouse%20(France).JPG",
    "Nouvelle-Aquitaine": "https://commons.wikimedia.org/wiki/Special:FilePath/Bordeaux_place_de_la_bourse_with_tram.JPG",
    "Bourgogne-Franche-Comté": "https://commons.wikimedia.org/wiki/Special:FilePath/Palais%20des%20Ducs%20de%20Bourgogne4.JPG",
    "Grand Est": "https://commons.wikimedia.org/wiki/Special:FilePath/Cathedrale_Notre-Dame-de-Strasbourg.jpg",
    "Pays de la Loire": "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau_des_ducs_de_Bretagne_(Nantes)_-_2014_-_02.JPG",
    "Centre-Val de Loire": "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Sainte-Croix_d%27Orl%C3%A9ans%202008%20PD%2033.JPG",
    "Normandie": "https://commons.wikimedia.org/wiki/Special:FilePath/Rouen_Cathedral,_West_Facade.JPG",
    "Bretagne": "https://commons.wikimedia.org/wiki/Special:FilePath/PlaceParlementBretagne.jpg",
    "Corse": "https://commons.wikimedia.org/wiki/Special:FilePath/Ajaccio%20Citadelle%20et%20plage%20Saint-Fran%C3%A7ois.jpg",
    "Guadeloupe": "https://commons.wikimedia.org/wiki/Special:FilePath/Rue%20Maurice%20Marie%20Claire%20-%20Basse-Terre.JPG",
    "Martinique": "https://commons.wikimedia.org/wiki/Special:FilePath/Fort_de_France_1.JPG",
    "Guyane": "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%8Ele%20du%20Diable%20Dreyfus.jpg",
    "La Réunion": "https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_l%E2%80%99Hermitage_%E2%80%94_La_R%C3%A9union.jpg",
    "Mayotte": "https://commons.wikimedia.org/wiki/Special:FilePath/2004%2012%2012%2018-24-04%20rose%20sea%20in%20mamoudzou%20mayotte%20island.jpg",
    "Saint-Pierre-et-Miquelon": "https://commons.wikimedia.org/wiki/Special:FilePath/Ship_in_the_harbour_of_saint-pierre,_SPM.JPG",
  };
  return catalog[region] || "https://lescalculateurs.fr/assets/android-chrome-512x512.png";
}

/**
 * Échappe les caractères XML réservés dans une valeur texte
 */
function xmlEscape(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Insère <image:image> pour chaque page départementale dans le sitemap.xml
 */
function addImagesToSitemap() {
  const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");
  let xml = fs.readFileSync(sitemapPath, "utf-8");

  if (!xml.includes("xmlns:image")) {
    xml = xml.replace(
      /<urlset\s+xmlns="[^"]+">/,
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
    );
  }

  xml = xml.replace(/<url>\s*<loc>(https:\/\/lescalculateurs\.fr\/pages\/blog\/departements\/frais-notaire-([^<]+)\.html)<\/loc>([\s\S]*?)<\/url>/g, (m, loc, code, rest) => {
    const localPath = path.resolve(__dirname, `../src/pages/blog/departements/frais-notaire-${code}.html`);
    let img = "https://lescalculateurs.fr/assets/android-chrome-512x512.png";
    if (fs.existsSync(localPath)) {
      const html = fs.readFileSync(localPath, "utf-8");
      const mmContentA = html.match(/<img[^>]*class=\"[^\"]*object-cover[^\"]*\"[^>]*src=\"([^\"]+)\"/i);
      const mmContentB = html.match(/<img[^>]*src=\"([^\"]+)\"[^>]*class=\"[^\"]*object-cover[^\"]*\"/i);
      const mmAny = html.match(/<img[^>]*src=\"([^\"]+)\"/i);
      const mmContent = mmContentA || mmContentB;
      if (mmContent && mmContent[1]) img = mmContent[1];
      else if (mmAny && mmAny[1]) img = mmAny[1];
    }
    const safeImg = xmlEscape(img);
    const imageNode = `\n    <image:image>\n      <image:loc>${safeImg}</image:loc>\n    </image:image>`;
    if (rest.includes("<image:image>")) {
      return m.replace(/<image:loc>[^<]+<\/image:loc>/, `<image:loc>${safeImg}<\/image:loc>`);
    }
    return `<url>\n    <loc>${loc}</loc>${imageNode}${rest}\n  </url>`;
  });

  fs.writeFileSync(sitemapPath, xml, "utf-8");
}

/**
 * Point d’entrée
 */
function main() {
  addImagesToSitemap();
  console.log("Sitemap enrichi avec images pour pages départementales.");
}

main();