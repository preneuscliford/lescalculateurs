/**
 * Observatoire Communautaire - Module d'export
 * 
 * Systeme de collecte anonyme de feedbacks post-simulation
 * Permet d'afficher des statistiques par profil similaire
 * 
 * Usage:
 *   import { initFeedbackForm, initStatsDisplay } from './components/observatory';
 *   
 *   // Apres simulation
 *   initFeedbackForm('feedback-container', {
 *     simulatorType: 'rsa',
 *     profile: { situation: 'celibataire', revenus: '0-500', logement: 'locataire', enfants: 0 },
 *     onSubmitted: () => console.log('Feedback envoye !')
 *   });
 *   
 *   // Afficher les stats
 *   initStatsDisplay('stats-container', {
 *     profileHash: 'abc123...',
 *     simulatorType: 'rsa'
 *   });
 */

export { FeedbackForm, initFeedbackForm } from './FeedbackForm';
export { StatsDisplay, initStatsDisplay } from './StatsDisplay';

// Re-exports des types pour faciliter l'usage
export type { 
  UserFeedback, 
  ProfileStats, 
  GlobalObservatoryStats,
  FeedbackQuestion 
} from '../../types/observatory';

export { RSA_FEEDBACK_QUESTIONS } from '../../types/observatory';

// Re-exports des services
export {
  submitFeedback,
  getProfileStats,
  getGlobalStats,
  generateProfileHash,
  hasUserFeedback,
  getTotalFeedbackCount,
} from '../../services/observatory';
