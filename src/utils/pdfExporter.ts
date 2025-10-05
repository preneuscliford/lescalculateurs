/**
 * Module PDF Export - LesCalculateurs.fr
 * Génération de PDF côté client avec watermark
 */

import jsPDF from "jspdf";

export interface PDFExportData {
  title: string;
  subtitle?: string;
  calculatorName: string;
  userInputs: Record<string, any>;
  results: Record<string, any>;
  explanations?: string[];
  additionalNotes?: string[];
}

export class PDFExporter {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private leftMargin: number = 20;
  private rightMargin: number = 20;

  constructor() {
    this.pdf = new jsPDF("p", "mm", "a4");
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  /**
   * Génère et télécharge un PDF des résultats de calcul
   */
  async exportToPDF(data: PDFExportData): Promise<void> {
    try {
      // En-tête avec logo et titre
      this.addHeader(data.title, data.subtitle);

      // Informations du calculateur
      this.addCalculatorInfo(data.calculatorName);

      // Données saisies par l'utilisateur
      this.addUserInputs(data.userInputs);

      // Résultats du calcul
      this.addResults(data.results);

      // Explications si disponibles
      if (data.explanations && data.explanations.length > 0) {
        this.addExplanations(data.explanations);
      }

      // Notes additionnelles si disponibles
      if (data.additionalNotes && data.additionalNotes.length > 0) {
        this.addAdditionalNotes(data.additionalNotes);
      }

      // Watermark et footer
      this.addWatermarkAndFooter();

      // Téléchargement
      const fileName = `${data.calculatorName
        .toLowerCase()
        .replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
      this.pdf.save(fileName);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      throw new Error("Impossible de générer le PDF. Veuillez réessayer.");
    }
  }

  private addHeader(title: string, subtitle?: string): void {
    // Titre principal
    this.pdf.setFontSize(20);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(44, 82, 130); // Bleu foncé
    this.pdf.text(title, this.leftMargin, this.currentY);
    this.currentY += 12;

    // Sous-titre si disponible
    if (subtitle) {
      this.pdf.setFontSize(14);
      this.pdf.setFont("helvetica", "normal");
      this.pdf.setTextColor(107, 114, 128); // Gris
      this.pdf.text(subtitle, this.leftMargin, this.currentY);
      this.currentY += 8;
    }

    // Date de génération
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(107, 114, 128);
    const currentDate = new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    this.pdf.text(`Généré le ${currentDate}`, this.leftMargin, this.currentY);
    this.currentY += 15;

    // Ligne de séparation
    this.pdf.setDrawColor(229, 231, 235);
    this.pdf.line(
      this.leftMargin,
      this.currentY,
      this.pageWidth - this.rightMargin,
      this.currentY
    );
    this.currentY += 10;
  }

  private addCalculatorInfo(calculatorName: string): void {
    this.pdf.setFontSize(12);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.text("Calculateur utilisé:", this.leftMargin, this.currentY);

    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(75, 85, 99);
    this.pdf.text(calculatorName, this.leftMargin + 40, this.currentY);
    this.currentY += 15;
  }

  private addUserInputs(inputs: Record<string, any>): void {
    this.addSectionTitle("📝 Données saisies");

    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "normal");

    Object.entries(inputs).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        const label = this.formatLabel(key);
        const formattedValue = this.formatValue(value);

        this.pdf.setTextColor(31, 41, 55);
        this.pdf.text(`${label}:`, this.leftMargin, this.currentY);

        this.pdf.setTextColor(75, 85, 99);
        this.pdf.text(formattedValue, this.leftMargin + 60, this.currentY);

        this.currentY += 6;
        this.checkPageBreak();
      }
    });

    this.currentY += 5;
  }

  private addResults(results: Record<string, any>): void {
    this.addSectionTitle("🎯 Résultats du calcul");

    this.pdf.setFontSize(10);

    Object.entries(results).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        const label = this.formatLabel(key);
        const formattedValue = this.formatValue(value);

        // Mise en évidence des résultats principaux
        if (
          key.toLowerCase().includes("total") ||
          key.toLowerCase().includes("final") ||
          key.toLowerCase().includes("net")
        ) {
          this.pdf.setFont("helvetica", "bold");
          this.pdf.setTextColor(16, 185, 129); // Vert
        } else {
          this.pdf.setFont("helvetica", "normal");
          this.pdf.setTextColor(31, 41, 55);
        }

        this.pdf.text(`${label}:`, this.leftMargin, this.currentY);
        this.pdf.text(formattedValue, this.leftMargin + 60, this.currentY);

        this.currentY += 6;
        this.checkPageBreak();
      }
    });

    this.currentY += 5;
  }

  private addExplanations(explanations: string[]): void {
    this.addSectionTitle("💡 Explications");

    this.pdf.setFontSize(9);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(75, 85, 99);

    explanations.forEach((explanation, index) => {
      const lines = this.pdf.splitTextToSize(
        explanation,
        this.pageWidth - this.leftMargin - this.rightMargin - 10
      );
      this.pdf.text(`${index + 1}. `, this.leftMargin, this.currentY);
      this.pdf.text(lines, this.leftMargin + 8, this.currentY);
      this.currentY += lines.length * 4 + 3;
      this.checkPageBreak();
    });

    this.currentY += 5;
  }

  private addAdditionalNotes(notes: string[]): void {
    this.addSectionTitle("📋 Notes importantes");

    this.pdf.setFontSize(9);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(185, 28, 28); // Rouge pour les avertissements

    notes.forEach((note) => {
      const lines = this.pdf.splitTextToSize(
        note,
        this.pageWidth - this.leftMargin - this.rightMargin - 5
      );
      this.pdf.text(lines, this.leftMargin, this.currentY);
      this.currentY += lines.length * 4 + 3;
      this.checkPageBreak();
    });
  }

  private addSectionTitle(title: string): void {
    this.checkPageBreak(15);

    this.pdf.setFontSize(12);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(44, 82, 130);
    this.pdf.text(title, this.leftMargin, this.currentY);
    this.currentY += 10;
  }

  private addWatermarkAndFooter(): void {
    const totalPages = this.pdf.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);

      // Watermark
      this.pdf.setFontSize(30);
      this.pdf.setFont("helvetica", "bold");
      this.pdf.setTextColor(229, 231, 235, 0.3); // Gris très clair avec transparence
      this.pdf.text(
        "LesCalculateurs.fr",
        this.pageWidth / 2,
        this.pageHeight / 2,
        { align: "center", angle: 45 }
      );

      // Footer
      this.pdf.setFontSize(8);
      this.pdf.setFont("helvetica", "normal");
      this.pdf.setTextColor(107, 114, 128);

      // URL du site
      this.pdf.text(
        "Réalisé avec LesCalculateurs.fr - Calculateurs gratuits",
        this.leftMargin,
        this.pageHeight - 10
      );

      // Numéro de page
      this.pdf.text(
        `Page ${i}/${totalPages}`,
        this.pageWidth - this.rightMargin,
        this.pageHeight - 10,
        { align: "right" }
      );

      // Avertissement
      const disclaimer =
        "Les résultats sont indicatifs. Consultez un professionnel pour des conseils personnalisés.";
      this.pdf.text(disclaimer, this.pageWidth / 2, this.pageHeight - 5, {
        align: "center",
      });
    }
  }

  private formatLabel(key: string): string {
    // Convertit camelCase ou snake_case en texte lisible
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  }

  private formatValue(value: any): string {
    if (typeof value === "number") {
      // Formatage des nombres avec virgules pour les milliers
      if (value > 1000) {
        return value.toLocaleString("fr-FR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      }
      return value.toString();
    }

    if (typeof value === "boolean") {
      return value ? "Oui" : "Non";
    }

    if (value instanceof Date) {
      return value.toLocaleDateString("fr-FR");
    }

    return value.toString();
  }

  private checkPageBreak(additionalSpace: number = 0): void {
    if (this.currentY + additionalSpace > this.pageHeight - 30) {
      this.pdf.addPage();
      this.currentY = 20;
    }
  }
}

/**
 * Fonction utilitaire pour export PDF rapide
 */
export async function exportCalculationToPDF(
  data: PDFExportData
): Promise<void> {
  const exporter = new PDFExporter();
  await exporter.exportToPDF(data);
}
