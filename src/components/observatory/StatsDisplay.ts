/**
 * Composant d'affichage des statistiques observatoire
 * Affiche les données agrégées pour un profil similaire
 */

import type { ProfileStats } from '../../types/observatory';
import { getProfileStats, calculateProfileStats, getGlobalStats } from '../../services/observatory';

interface StatsDisplayProps {
  profileHash: string;
  simulatorType: string;
  profileDescription?: string;
}

export class StatsDisplay {
  private container: HTMLElement;
  private props: StatsDisplayProps;
  private stats: ProfileStats | null = null;
  private isLoading = true;

  constructor(container: HTMLElement, props: StatsDisplayProps) {
    this.container = container;
    this.props = props;
    this.loadStats();
  }

  private async loadStats(): Promise<void> {
    this.renderLoading();
    
    try {
      // Essayer d'abord les stats pré-calculées
      let stats = await getProfileStats(this.props.profileHash, this.props.simulatorType);
      
      // Fallback: calculer à la volée
      if (!stats) {
        stats = await calculateProfileStats(this.props.profileHash, this.props.simulatorType);
      }
      
      this.stats = stats;
      this.isLoading = false;
      this.render();
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      this.isLoading = false;
      this.renderError();
    }
  }

  private renderLoading(): void {
    this.container.innerHTML = `
      <div class="observatory-stats bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="space-y-3">
            <div class="h-8 bg-gray-200 rounded"></div>
            <div class="h-8 bg-gray-200 rounded"></div>
            <div class="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    `;
  }

  private renderError(): void {
    this.container.innerHTML = `
      <div class="observatory-stats bg-gray-50 rounded-xl p-6 border border-gray-200">
        <p class="text-gray-500 text-center">Impossible de charger les statistiques</p>
      </div>
    `;
  }

  private render(): void {
    if (this.isLoading) return;

    if (!this.stats || this.stats.total_responses === 0) {
      this.renderEmpty();
      return;
    }

    const { stats } = this;
    const hasEnoughData = stats.total_responses >= 10;
    
    this.container.innerHTML = `
      <div class="observatory-stats bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Observatoire communautaire</h3>
            <p class="text-sm text-gray-600">
              ${stats.total_responses} experience${stats.total_responses > 1 ? 's' : ''} partagee${stats.total_responses > 1 ? 's' : ''} pour un profil similaire
            </p>
          </div>
        </div>

        ${!hasEnoughData ? `
          <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-sm text-yellow-800">
              <span class="font-medium">Donnees en cours de collecte.</span> 
              Partagez votre experience pour enrichir les statistiques !
            </p>
          </div>
        ` : ''}

        <div class="grid grid-cols-3 gap-4 mb-4">
          <!-- Taux d'obtention -->
          <div class="bg-white rounded-lg p-4 text-center border border-gray-100">
            <div class="text-3xl font-bold ${this.getRateColor(stats.approval_rate)}">
              ${stats.approval_rate}%
            </div>
            <div class="text-xs text-gray-500 mt-1">Taux d'obtention</div>
            ${stats.last_7d_approval_rate !== stats.approval_rate ? `
              <div class="text-xs mt-1 ${stats.last_7d_approval_rate > stats.approval_rate ? 'text-green-600' : 'text-red-600'}">
                ${stats.last_7d_approval_rate > stats.approval_rate ? '↑' : '↓'} 
                ${Math.abs(stats.last_7d_approval_rate - stats.approval_rate)}% cette semaine
              </div>
            ` : ''}
          </div>

          <!-- Delai moyen -->
          <div class="bg-white rounded-lg p-4 text-center border border-gray-100">
            <div class="text-3xl font-bold text-gray-800">
              ${stats.avg_delay_days > 0 ? `${stats.avg_delay_days}j` : 'N/A'}
            </div>
            <div class="text-xs text-gray-500 mt-1">Delai moyen</div>
          </div>

          <!-- Taux de controle -->
          <div class="bg-white rounded-lg p-4 text-center border border-gray-100">
            <div class="text-3xl font-bold ${stats.control_rate > 30 ? 'text-orange-600' : 'text-gray-800'}">
              ${stats.control_rate}%
            </div>
            <div class="text-xs text-gray-500 mt-1">Controles</div>
          </div>
        </div>

        <!-- Details -->
        <div class="bg-white rounded-lg p-4 border border-gray-100">
          <h4 class="font-medium text-gray-800 mb-3">Repartition des resultats</h4>
          
          <!-- Barre d'obtention -->
          <div class="mb-3">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Acceptes</span>
              <span class="font-medium text-green-600">${stats.approval_count}</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full transition-all duration-500" 
                   style="width: ${(stats.approval_count / stats.total_responses) * 100}%"></div>
            </div>
          </div>

          <!-- Barre de refus -->
          <div class="mb-3">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Refuses</span>
              <span class="font-medium text-red-600">${stats.refusal_count}</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-red-500 rounded-full transition-all duration-500" 
                   style="width: ${(stats.refusal_count / stats.total_responses) * 100}%"></div>
            </div>
          </div>

          <!-- Barre en cours -->
          ${stats.pending_count > 0 ? `
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">En cours</span>
                <span class="font-medium text-amber-600">${stats.pending_count}</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-amber-500 rounded-full transition-all duration-500" 
                     style="width: ${(stats.pending_count / stats.total_responses) * 100}%"></div>
              </div>
            </div>
          ` : ''}
        </div>

        <p class="mt-4 text-xs text-gray-500 text-center">
          Donnees anonymises • Mises a jour en temps reel
        </p>
      </div>
    `;
  }

  private renderEmpty(): void {
    this.container.innerHTML = `
      <div class="observatory-stats bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Observatoire communautaire</h3>
            <p class="text-sm text-gray-600">Soyez le premier a partager votre experience !</p>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-gray-100 text-center">
          <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <p class="text-gray-600 text-sm">
            Aucune donnee disponible pour ce profil. <br>
            <span class="font-medium text-indigo-600">Partagez votre experience</span> pour aider les futurs demandeurs.
          </p>
        </div>
      </div>
    `;
  }

  private getRateColor(rate: number): string {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    if (rate >= 30) return 'text-orange-600';
    return 'text-red-600';
  }

  // Rafraichir les stats
  public async refresh(): Promise<void> {
    await this.loadStats();
  }
}

// Fonction d'initialisation simple
export function initStatsDisplay(
  containerId: string,
  props: StatsDisplayProps
): StatsDisplay | null {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} non trouve`);
    return null;
  }
  return new StatsDisplay(container, props);
}
