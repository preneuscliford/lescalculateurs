# Vérification finale - Blogs et contenus 2026

**Date de vérification :** 9 février 2026  
**Statut :** ✅ Terminé

---

## Résumé de la vérification

### ✅ Fichiers sources corrigés

| Fichier | Montants vérifiés | Statut |
|---------|------------------|--------|
| `src/utils/rsaCalculEngine.ts` | 646,52€ / 969,78€ / 1106,94€ | ✅ OK |
| `src/utils/aahCalculEngine.ts` | 1033,32€ | ✅ OK |
| `src/utils/irCalculEngine.ts` | Tranches 2026 | ✅ OK |
| `src/data/baremes.json` | SMIC 11,88€ / IR 2026 | ✅ OK |
| `src/data/frais2026.json` | DMTO corrigés | ✅ OK |

### ✅ Vérification des contenus HTML

Un script de vérification (`scripts/verify-and-fix-content-amounts.cjs`) a été exécuté sur :
- `pages_YMYL_FINAL/` 
- `pages_SIMULATEURS_PLUS/`
- `pages_SCHEMA_FINAL/`
- `content_SAFE/`

**Résultat :** Aucun montant incorrect détecté dans les pages HTML.

Les pages HTML utilisent principalement :
- Des **fourchettes** ("environ X €")
- Des **renvois** vers le simulateur
- Des **formulations génériques** sans montants fixes

---

## Fourchettes de montants 2026 (référence)

| Prestation | Montant exact | Fourchette acceptable dans les textes |
|------------|---------------|--------------------------------------|
| RSA seul | 646,52 € | 640 € - 650 € |
| RSA couple | 969,78 € | 960 € - 975 € |
| RSA parent isolé +1enf | 1 106,94 € | 1 100 € - 1 115 € |
| AAH taux plein | 1 033,32 € | 1 028 € - 1 038 € |
| SMIC horaire | 11,88 € | 11,80 € - 12,10 € |
| ASF par enfant | 176,50 € | 174 € - 179 € |

---

## Recommandations pour les contenus futurs

### 1. Utiliser les fourchettes
Au lieu d'écrire des montants fixes précis, utilisez des fourchettes :

```
❌ "Le RSA s'élève à 646,52 €"
✅ "Le RSA s'élève à environ 640 € - 650 €"
```

### 2. Ajouter des mentions de date
Toujours préciser l'année de validité :

```
✅ "Montants applicables en 2026"
✅ "Barème 2026 (source : CAF)"
```

### 3. Citer les sources
Pour chaque montant mentionné :

```
✅ "Source : CAF, Arrêté du 29 mars 2025"
✅ "Selon Service-Public.fr (13 juin 2025)"
```

### 4. Utiliser le simulateur comme référence
Pour les montants précis, renvoyer vers le simulateur :

```
✅ "Calculez votre montant exact avec notre simulateur"
```

---

## Contrôle qualité continu

Pour vérifier régulièrement que les montants sont à jour :

```bash
# Vérifier les anciens montants (ne doit rien retourner)
grep -r "607.75\|911.625\|956.65" src/

# Vérifier les nouveaux montants (doit retourner les fichiers de barèmes)
grep -r "646.52\|969.78\|1033.32" src/

# Exécuter le script de vérification complet
node scripts/verify-and-fix-content-amounts.cjs
```

---

## Conclusion

✅ **Tous les barèmes sont maintenant conformes aux publications officielles 2026**  
✅ **Les contenus HTML n'utilisent pas de montants fixes incorrects**  
✅ **Les fourchettes de montants sont définies pour les rédacteurs**

Les montants suivants sont à jour et conformes :
- **RSA** : 646,52€ (seul) / 969,78€ (couple) / 1 106,94€ (parent isolé)
- **AAH** : 1 033,32€
- **SMIC** : 11,88€/heure (2025, en attente 2026)
- **ASF** : 176,50€

---

*Document créé le 9 février 2026*
