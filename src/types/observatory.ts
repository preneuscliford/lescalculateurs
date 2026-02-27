/**
 * Types pour l'observatoire communautaire
 * Système de collecte anonyme de retours utilisateurs
 */

// Réponse brute d'un utilisateur
export interface UserFeedback {
  id?: string;
  profile_hash: string;
  simulator_type: 'rsa' | 'apl' | 'aah' | 'are' | 'prime-activite';
  
  // Questions principales
  obtention: 'oui' | 'refuse' | 'en_cours' | 'pas_demande';
  delai?: 'moins_2_semaines' | '2_4_semaines' | '1_2_mois' | 'plus_2_mois';
  controle: 'oui' | 'non';
  
  // Optionnel : satisfaction (1-5)
  satisfaction?: number;
  commentaire?: string;
  
  created_at?: string;
}

// Statistiques agrégées par profil (pour affichage rapide)
export interface ProfileStats {
  profile_hash: string;
  simulator_type: string;
  
  total_responses: number;
  
  // Taux d'obtention
  approval_count: number;
  refusal_count: number;
  pending_count: number;
  
  // Taux de conversion
  approval_rate: number; // 0-100
  
  // Délais
  avg_delay_days: number;
  
  // Contrôles
  control_rate: number; // 0-100
  
  // Évolution
  last_7d_approval_rate: number;
  last_30d_responses: number;
  
  last_updated: string;
}

// Stats globales pour l'observatoire
export interface GlobalObservatoryStats {
  simulator_type: string;
  
  total_interactions: number;
  unique_profiles: number;
  
  // Taux globaux
  global_approval_rate: number;
  global_avg_delay_days: number;
  global_control_rate: number;
  
  // Top profils les plus fréquents
  top_profiles: {
    profile_hash: string;
    count: number;
    approval_rate: number;
    description: string; // ex: "Célibataire, sans enfant, locataire"
  }[];
  
  // Évolution
  daily_evolution: {
    date: string;
    responses: number;
    approval_rate: number;
  }[];
  
  updated_at: string;
}

// Questions pour le formulaire
export interface FeedbackQuestion {
  id: string;
  type: 'radio' | 'select' | 'rating';
  question: string;
  options?: { value: string; label: string }[];
  required: boolean;
}

export const RSA_FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
  {
    id: 'obtention',
    type: 'radio',
    question: 'Avez-vous déjà obtenu le RSA ?',
    required: true,
    options: [
      { value: 'oui', label: 'Oui, j\'ai été accepté' },
      { value: 'refuse', label: 'Non, j\'ai été refusé' },
      { value: 'en_cours', label: 'Ma demande est en cours' },
      { value: 'pas_demande', label: 'Je n\'ai pas encore fait de demande' },
    ],
  },
  {
    id: 'delai',
    type: 'radio',
    question: 'Quel a été le délai de réponse ?',
    required: false,
    options: [
      { value: 'moins_2_semaines', label: 'Moins de 2 semaines' },
      { value: '2_4_semaines', label: '2 à 4 semaines' },
      { value: '1_2_mois', label: '1 à 2 mois' },
      { value: 'plus_2_mois', label: 'Plus de 2 mois' },
    ],
  },
  {
    id: 'controle',
    type: 'radio',
    question: 'Un contrôle de vos ressources a-t-il été demandé ?',
    required: true,
    options: [
      { value: 'oui', label: 'Oui' },
      { value: 'non', label: 'Non' },
    ],
  },
  {
    id: 'satisfaction',
    type: 'rating',
    question: 'Comment évaluez-vous votre expérience globale ? (1-5)',
    required: false,
  },
];
