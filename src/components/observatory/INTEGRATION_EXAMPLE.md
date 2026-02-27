# Intégration de l'Observatoire - Guide d'implémentation

## Installation

### 1. Créer les tables Supabase

Dans l'éditeur SQL de Supabase (votre projet: `bwabwcfyyipfllvmomzx`), exécutez :

```sql
-- Copier/coller le contenu de supabase/observatory_schema.sql
```

### 2. Ajouter au build (vite.config.ts)

```typescript
export default defineConfig({
  // ... existing config
  optimizeDeps: {
    include: ['observatory']
  }
});
```

## Usage dans une page (ex: RSA)

### HTML - Ajouter les conteneurs

```html
<!-- Dans src/pages/rsa.html, après les résultats de simulation -->

<!-- Section Observatoire -->
<section id="observatory-section" class="mt-8" style="display: none;">
  <!-- Stats affichées -->
  <div id="observatory-stats"></div>
  
  <!-- Formulaire de feedback -->
  <div id="observatory-feedback" class="mt-6"></div>
</section>
```

### TypeScript - Initialisation

```typescript
// Dans src/pages/scripts/rsa.ts

import { 
  initFeedbackForm, 
  initStatsDisplay,
  generateProfileHash 
} from '../../components/observatory';

// Après le calcul de simulation
async function showObservatory(simulationData: any) {
  const section = document.getElementById('observatory-section');
  if (!section) return;
  
  section.style.display = 'block';
  
  // Générer le hash du profil
  const profile = {
    situation: simulationData.situation, // 'celibataire', 'couple', etc.
    revenus: getRevenuBracket(simulationData.revenus), // '0-500', '500-1000', etc.
    logement: simulationData.logement, // 'locataire', 'proprietaire', etc.
    enfants: simulationData.enfants || 0
  };
  
  const profileHash = await generateProfileHash(profile);
  
  // Afficher les stats existantes
  initStatsDisplay('observatory-stats', {
    profileHash,
    simulatorType: 'rsa',
    profileDescription: getProfileDescription(profile)
  });
  
  // Afficher le formulaire
  initFeedbackForm('observatory-feedback', {
    simulatorType: 'rsa',
    profile,
    onSubmitted: () => {
      // Rafraichir les stats après soumission
      setTimeout(() => {
        initStatsDisplay('observatory-stats', {
          profileHash,
          simulatorType: 'rsa'
        });
      }, 1000);
    },
    onCancel: () => {
      document.getElementById('observatory-feedback')!.style.display = 'none';
    }
  });
}

// Helper: tranche de revenus
function getRevenuBracket(revenus: number): string {
  if (revenus < 500) return '0-500';
  if (revenus < 1000) return '500-1000';
  if (revenus < 1500) return '1000-1500';
  if (revenus < 2000) return '1500-2000';
  return '2000+';
}

// Helper: description lisible
function getProfileDescription(profile: any): string {
  const parts = [
    profile.situation,
    profile.enfants > 0 ? `${profile.enfants} enfant(s)` : null,
    profile.logement
  ].filter(Boolean);
  return parts.join(', ');
}
```

## Option: Mode "Stats Seulement" (sans formulaire)

Si vous voulez juste afficher les stats sans demander de feedback :

```typescript
// Afficher uniquement les stats
initStatsDisplay('observatory-stats', {
  profileHash,
  simulatorType: 'rsa'
});
```

## Option: Page Observatoire Globale

Créer une page dédiée `/observatoire` avec les stats globales :

```typescript
// src/pages/observatoire.ts

import { getGlobalStats, getTotalFeedbackCount } from '../components/observatory';

async function loadGlobalObservatory() {
  const rsaStats = await getGlobalStats('rsa');
  const rsaCount = await getTotalFeedbackCount('rsa');
  
  // Afficher dans des graphiques Chart.js
  // ...
}
```

## Personnalisation CSS

Les composants utilisent Tailwind CSS. Vous pouvez override les styles :

```css
/* Custom styles */
.observatory-feedback {
  /* Vos styles */
}

.observatory-stats {
  /* Vos styles */
}
```

## Désactiver temporairement

Pour désactiver sans supprimer le code :

```typescript
// Ne pas appeler initFeedbackForm/initStatsDisplay
// ou
const section = document.getElementById('observatory-section');
if (section) section.style.display = 'none';
```

## Debugging

Activer les logs dans la console :

```typescript
// Vérifier la connexion Supabase
console.log('Profile hash:', profileHash);
console.log('Stats:', await getProfileStats(profileHash, 'rsa'));
console.log('Total feedbacks:', await getTotalFeedbackCount('rsa'));
```

## Performance

- Les stats sont pré-calculées (table `profile_stats`)
- Fallback calcul à la volée si pas encore de stats
- Une seule requête par affichage
- Mise à jour async après soumission
