import { calculerAPL } from "../../utils/aplCalculEngine";
import { calculerRSA } from "../../utils/rsaCalculEngine";
import { calculerPrimeActivite } from "../../utils/primeActiviteCalculEngine";

type Situation = "seul" | "couple" | "monoparental";
type Region = "idf" | "province" | "dom";
type Logement = "loue" | "proprio" | "gratuit";
type Activite = "actif" | "chomage" | "inactif";
type TypeActivite = "salarie" | "independant" | "apprenti";

function euro(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)));
}

function readNumber(id: string): number {
  const input = document.getElementById(id) as HTMLInputElement | null;
  if (!input) return 0;
  const value = Number(input.value);
  return Number.isFinite(value) ? value : 0;
}

function readSelect<T extends string>(id: string, fallback: T): T {
  const input = document.getElementById(id) as HTMLSelectElement | null;
  if (!input || !input.value) return fallback;
  return input.value as T;
}

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

const form = document.getElementById("multi-aides-form") as HTMLFormElement | null;
const resultSection = document.getElementById("multi-aides-result");
const errorBox = document.getElementById("multi-aides-error");

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const situation = readSelect<Situation>("ma-situation", "seul");
    const enfants = Math.max(0, Math.floor(readNumber("ma-enfants")));
    const revenus = Math.max(0, readNumber("ma-revenus"));
    const loyer = Math.max(0, readNumber("ma-loyer"));
    const region = readSelect<Region>("ma-region", "province");
    const logement = readSelect<Logement>("ma-logement", "loue");
    const activite = readSelect<Activite>("ma-activite", "actif");
    const typeActivite = readSelect<TypeActivite>("ma-type-activite", "salarie");
    const revenusPro = Math.max(0, readNumber("ma-revenus-pro"));
    const autresRevenus = Math.max(0, readNumber("ma-autres-revenus"));

    if (loyer <= 0) {
      if (errorBox) {
        errorBox.textContent = "Veuillez renseigner un loyer ou une mensualite superieur(e) a 0.";
        errorBox.classList.remove("hidden");
      }
      return;
    }

    if (errorBox) {
      errorBox.textContent = "";
      errorBox.classList.add("hidden");
    }

    const rsa = calculerRSA({
      situation,
      enfants,
      revenus,
      logement,
      activite,
    });

    const apl = calculerAPL({
      situation,
      enfants,
      revenus_mensuels: revenus,
      loyer_mensuel: loyer,
      region,
      type_logement: logement === "loue" ? "location" : logement === "proprio" ? "accession" : "colocation",
      economie: 0,
    });

    const prime = calculerPrimeActivite({
      situation,
      enfants,
      revenusProf: revenusPro,
      autresRevenus,
      logement,
      typeActivite,
    });

    const rsaMontant = rsa.success ? rsa.montantEstime : 0;
    const aplMontant = apl.success && apl.data ? apl.data.apl_estimee : 0;
    const primeMontant = prime.success ? prime.montantEstime : 0;
    const total = rsaMontant + aplMontant + primeMontant;

    setText("ma-rsa-montant", euro(rsaMontant));
    setText("ma-apl-montant", euro(aplMontant));
    setText("ma-prime-montant", euro(primeMontant));
    setText("ma-total-montant", euro(total));

    setText("ma-rsa-status", rsa.eligibilite || "Estimation indisponible");
    setText(
      "ma-apl-status",
      apl.success && apl.data
        ? apl.data.apl_estimee > 0
          ? "Probablement eligible"
          : "Montant nul probable"
        : apl.error || "Estimation indisponible",
    );
    setText("ma-prime-status", prime.eligibilite || "Estimation indisponible");

    setText("ma-rsa-expl", rsa.explication || "Consultez la CAF pour confirmer.");
    setText(
      "ma-apl-expl",
      apl.success && apl.data
        ? apl.data.raison_zero || "Montant indicatif base sur votre loyer, zone et revenus."
        : apl.error || "Consultez la CAF pour confirmer.",
    );
    setText("ma-prime-expl", prime.explication || "Consultez la CAF pour confirmer.");

    if (resultSection) {
      resultSection.classList.remove("hidden");
      resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.dispatchEvent(
      new CustomEvent("multi-aides-calculated", {
        detail: {
          input: {
            situation,
            enfants,
            revenus,
            loyer,
            region,
            logement,
            activite,
            typeActivite,
            revenusPro,
            autresRevenus,
          },
          output: {
            rsaMontant,
            aplMontant,
            primeMontant,
            total,
          },
        },
      }),
    );
  });
}
