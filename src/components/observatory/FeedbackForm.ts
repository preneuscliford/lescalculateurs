/**
 * Composant formulaire de feedback post-simulation
 * Collecte anonyme des experiences utilisateurs
 * Avec protections anti-spam (honeypot, rate limiting, fingerprint)
 */

import { RSA_FEEDBACK_QUESTIONS, type FeedbackQuestion, type UserFeedback } from '../../types/observatory';
import { submitFeedbackSafe, generateProfileHash } from '../../services/observatory-simple';
import {
  validateSubmission,
  recordSubmission,
  startFormTimer,
  getTimeRemaining,
  resetProtection,
} from '../../services/spamProtection';

interface FeedbackFormProps {
  simulatorType: 'rsa' | 'apl' | 'aah' | 'are' | 'prime-activite';
  profile: {
    situation: string;
    revenus: string;
    logement: string;
    enfants: number;
  };
  onSubmitted?: () => void;
  onCancel?: () => void;
}

export class FeedbackForm {
  private container: HTMLElement;
  private props: FeedbackFormProps;
  private answers: {
    obtention?: UserFeedback['obtention'];
    delai?: UserFeedback['delai'];
    controle?: UserFeedback['controle'];
    satisfaction?: number;
  } = {};
  private isSubmitting = false;
  private profileHash: string | null = null;
  private formStartTime: number = 0;

  constructor(container: HTMLElement, props: FeedbackFormProps) {
    this.container = container;
    this.props = props;
    this.init();
  }

  private async init(): Promise<void> {
    // Generer le hash du profil
    this.profileHash = await generateProfileHash(this.props.profile);
    
    // Verifier si deja soumis recemment
    const timeCheck = getTimeRemaining(this.profileHash);
    
    if (!timeCheck.canSubmit) {
      this.renderCooldown(timeCheck.remainingText);
      return;
    }
    
    // Démarrer le timer de remplissage
    startFormTimer(this.profileHash);
    this.formStartTime = Date.now();
    
    // Rendre le formulaire
    this.render();
  }

  private renderCooldown(remainingText: string): void {
    this.container.innerHTML = `
      <div class="observatory-feedback bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Merci pour votre contribution !</h3>
            <p class="text-sm text-gray-600">Vous avez deja partage votre experience.</p>
          </div>
        </div>
        
        <div class="bg-white rounded-lg p-4 border border-gray-100 text-center">
          <p class="text-gray-600 mb-2">Prochaine contribution possible dans:</p>
          <p class="text-2xl font-bold text-blue-600">${remainingText}</p>
        </div>
        
        <p class="mt-4 text-xs text-gray-500 text-center">
          Cette limitation permet d'eviter les abus et garantir la qualite des donnees.
        </p>
      </div>
    `;
  }

  private render(): void {
    const questions = RSA_FEEDBACK_QUESTIONS;
    
    this.container.innerHTML = `
      <div class="observatory-feedback bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Aidez la communaute</h3>
            <p class="text-sm text-gray-600">Partagez votre experience (anonyme)</p>
          </div>
        </div>

        <!-- Honeypot: champ cache pour detecter les bots -->
        <div class="hp-field" style="position: absolute; left: -9999px; opacity: 0;">
          <label for="hp-website">Ne pas remplir ce champ</label>
          <input type="text" id="hp-website" name="website" tabindex="-1" autocomplete="off">
        </div>

        <div class="space-y-4" id="feedback-questions">
          ${questions.map(q => this.renderQuestion(q)).join('')}
        </div>

        <div class="mt-6 flex gap-3">
          <button 
            id="submit-feedback"
            class="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            ${!this.isValid() ? 'disabled' : ''}
          >
            <span>Partager mon experience</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <button 
            id="cancel-feedback"
            class="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Ignorer
          </button>
        </div>

        <p class="mt-3 text-xs text-gray-500 text-center">
          100% anonyme • Les donnees aident les futurs demandeurs
        </p>
        
        <!-- Debug: reset (a enlever en production) -->
        <button 
          id="debug-reset"
          class="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
          style="display: none;"
        >
          [Debug] Reinitialiser
        </button>
      </div>
    `;

    this.attachEventListeners();
    
    // Afficher le bouton debug si en mode dev (localhost)
    if (window.location.hostname === 'localhost') {
      const debugBtn = this.container.querySelector('#debug-reset') as HTMLElement;
      if (debugBtn) debugBtn.style.display = 'block';
    }
  }

  private renderQuestion(question: FeedbackQuestion): string {
    const required = question.required ? '<span class="text-red-500">*</span>' : '';
    
    if (question.type === 'radio' && question.options) {
      return `
        <div class="feedback-question" data-question-id="${question.id}">
          <p class="font-medium text-gray-800 mb-2">${question.question} ${required}</p>
          <div class="space-y-2">
            ${question.options.map(opt => `
              <label class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <input 
                  type="radio" 
                  name="${question.id}" 
                  value="${opt.value}"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  ${question.required ? 'required' : ''}
                >
                <span class="text-gray-700">${opt.label}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (question.type === 'rating') {
      return `
        <div class="feedback-question" data-question-id="${question.id}">
          <p class="font-medium text-gray-800 mb-2">${question.question} ${required}</p>
          <div class="flex gap-2">
            ${[1, 2, 3, 4, 5].map(star => `
              <button 
                type="button"
                class="rating-star w-10 h-10 rounded-lg border-2 border-gray-200 text-gray-400 hover:border-yellow-400 hover:text-yellow-500 transition-colors text-xl"
                data-value="${star}"
              >
                ★
              </button>
            `).join('')}
          </div>
          <input type="hidden" name="${question.id}" id="rating-${question.id}">
        </div>
      `;
    }

    return '';
  }

  private attachEventListeners(): void {
    // Radio buttons
    this.container.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.setRadioAnswer(target.name, target.value);
        this.updateSubmitButton();
      });
    });

    // Rating stars
    this.container.querySelectorAll('.rating-star').forEach(star => {
      star.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const value = target.dataset.value;
        const questionId = target.closest('.feedback-question')?.getAttribute('data-question-id');
        
        if (questionId && value) {
          // Update visual state
          target.parentElement?.querySelectorAll('.rating-star').forEach((s, i) => {
            if (i < parseInt(value)) {
              s.classList.add('bg-yellow-100', 'border-yellow-400', 'text-yellow-500');
              s.classList.remove('border-gray-200', 'text-gray-400');
            } else {
              s.classList.remove('bg-yellow-100', 'border-yellow-400', 'text-yellow-500');
              s.classList.add('border-gray-200', 'text-gray-400');
            }
          });

          this.setRatingAnswer(questionId, parseInt(value, 10));
          this.updateSubmitButton();
        }
      });
    });

    // Submit button
    const submitBtn = this.container.querySelector('#submit-feedback');
    submitBtn?.addEventListener('click', () => this.submit());

    // Cancel button
    const cancelBtn = this.container.querySelector('#cancel-feedback');
    cancelBtn?.addEventListener('click', () => {
      this.props.onCancel?.();
    });
    
    // Debug reset button
    const debugBtn = this.container.querySelector('#debug-reset');
    debugBtn?.addEventListener('click', () => {
      if (this.profileHash) {
        resetProtection(this.profileHash);
        window.location.reload();
      }
    });
  }

  private isValid(): boolean {
    const requiredQuestions = RSA_FEEDBACK_QUESTIONS.filter(q => q.required);
    return requiredQuestions.every((q) => {
      switch (q.id) {
        case 'obtention':
          return this.answers.obtention !== undefined;
        case 'controle':
          return this.answers.controle !== undefined;
        case 'delai':
          return this.answers.delai !== undefined;
        case 'satisfaction':
          return this.answers.satisfaction !== undefined;
        default:
          return true;
      }
    });
  }

  private updateSubmitButton(): void {
    const submitBtn = this.container.querySelector('#submit-feedback') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = !this.isValid() || this.isSubmitting;
    }
  }

  private async submit(): Promise<void> {
    if (this.isSubmitting || !this.isValid() || !this.profileHash) return;
    
    this.isSubmitting = true;
    this.updateSubmitButton();

    try {
      // Recuperer la valeur du honeypot
      const honeypotInput = document.getElementById('hp-website') as HTMLInputElement;
      const honeypotValue = honeypotInput?.value || null;
      
      // Valider les protections anti-spam
      const validation = validateSubmission(this.profileHash, honeypotValue);
      
      if (!validation.valid) {
        this.showError(validation.reason || 'Validation echouee');
        this.isSubmitting = false;
        this.updateSubmitButton();
        return;
      }

      if (!this.answers.obtention || !this.answers.controle) {
        this.showError('Veuillez repondre aux questions obligatoires');
        this.isSubmitting = false;
        this.updateSubmitButton();
        return;
      }
      
      const feedback: Omit<UserFeedback, 'id' | 'created_at'> = {
        profile_hash: this.profileHash,
        simulator_type: this.props.simulatorType,
        obtention: this.answers.obtention,
        delai: this.answers.delai,
        controle: this.answers.controle,
        satisfaction: this.answers.satisfaction,
      };

      // Données de validation pour l'Edge Function
      const validationData = {
        fingerprint: validation.fingerprint || '',
        honeypot: honeypotValue || undefined,
        form_start_time: this.formStartTime,
      };

      const result = await submitFeedbackSafe(feedback, validationData);

      if (result.success) {
        // Enregistrer la soumission pour rate limiting
        recordSubmission(this.profileHash);
        this.showSuccess();
        this.props.onSubmitted?.();
      } else {
        this.showError(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      this.showError('Erreur lors de l\'envoi');
    } finally {
      this.isSubmitting = false;
      this.updateSubmitButton();
    }
  }

  private showSuccess(): void {
    this.container.innerHTML = `
      <div class="observatory-feedback bg-green-50 rounded-xl p-6 border border-green-200 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-green-900 mb-2">Merci pour votre aide !</h3>
        <p class="text-green-700">Votre retour va aider d\'autres personnes dans leur demarche.</p>
        
        <div class="mt-4 p-3 bg-white rounded-lg border border-green-100">
          <p class="text-sm text-green-800">
            Prochaine contribution possible dans <strong>24 heures</strong>.
          </p>
        </div>
      </div>
    `;
  }

  private showError(message: string): void {
    // Supprimer les messages d'erreur precedents
    this.container.querySelectorAll('.error-message').forEach(el => el.remove());
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm';
    errorDiv.textContent = message;
    this.container.querySelector('.observatory-feedback')?.appendChild(errorDiv);
  }

  private setRadioAnswer(name: string, value: string): void {
    switch (name) {
      case 'obtention':
        if (value === 'oui' || value === 'refuse' || value === 'en_cours' || value === 'pas_demande') {
          this.answers.obtention = value;
        }
        break;
      case 'delai':
        if (value === 'moins_2_semaines' || value === '2_4_semaines' || value === '1_2_mois' || value === 'plus_2_mois') {
          this.answers.delai = value;
        }
        break;
      case 'controle':
        if (value === 'oui' || value === 'non') {
          this.answers.controle = value;
        }
        break;
      default:
        break;
    }
  }

  private setRatingAnswer(questionId: string, rating: number): void {
    if (questionId === 'satisfaction' && Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      this.answers.satisfaction = rating;
    }
  }
}

// Fonction d'initialisation pour usage simple
export function initFeedbackForm(
  containerId: string, 
  props: FeedbackFormProps
): FeedbackForm | null {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} non trouve`);
    return null;
  }
  return new FeedbackForm(container, props);
}
