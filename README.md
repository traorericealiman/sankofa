# Sankofa

**La forge des développeurs africains. Par les devs, pour les devs.**

Sankofa est une plateforme d'échange pour les développeurs : chacun y publie ses projets, échange directement avec les autres, partage des capsules vidéo et réutilise du code en créditant toujours son auteur.

Projet réalisé pour le Systalink Challenge (Coupe d'Afrique des Développeurs 2026), sur le thème « Construire la plateforme d'échange africaine, pour les devs, par les devs ».

## Le problème

- Les projets des développeurs africains restent dispersés et peu visibles.
- Les juniors manquent de personnes accessibles pour poser leurs questions : les vidéos ne suffisent pas.
- Le code réutilisé, par des humains ou par des agents IA, l'est souvent sans crédit pour son auteur.
- Les connexions instables rendent beaucoup d'outils pénibles à utiliser.

## Ce que fait Sankofa

| Module | Description |
|---|---|
| **Explorer** | Recherche de projets par mot-clé, technologie et tri. Licence et résultats des tests visibles sur chaque projet. |
| **Projet** | Description, technologies, dépôt, avis, capsules vidéo liées, bouton « Réutiliser » et crédit de l'auteur à copier. |
| **Crédit automatique** | Chaque réutilisation est comptée et notifiée à l'auteur. |
| **Messagerie** | Discussions privées et groupes, fichiers, notes vocales. **File d'attente hors ligne** : les messages partent dès le retour du réseau. |
| **Capsules vidéo** | Explications courtes rattachées aux projets, avec chapitres. |
| **Mentorat** | Réservation de créneaux de 30 minutes avec des développeurs seniors. |
| **API & accès** | Points d'accès documentés pour les outils et les agents IA, recherche testable, générateur de configuration qui impose licence et attribution. |
| **Profils** | Projets, capsules, langues, fuseau horaire, disponibilité pour le mentorat. |

## Lancer le projet

Aucune installation n'est nécessaire : HTML, CSS et JavaScript, sans dépendance.

1. Ouvrir `index.html` dans un navigateur, ou servir le dossier avec n'importe quel serveur statique.
2. Se connecter avec `awa@exemple.dev` (compte de démonstration) ou avec n'importe quelle adresse pour créer un compte.

## Démo vidéo

Le film de présentation (1 min 24) est joint à la [release v1.0](../../releases).

## État actuel et limites

C'est un prototype frontend réalisé en temps limité :

- Les données sont stockées dans le navigateur (`localStorage`) ; il n'y a pas encore de backend.
- Les personnes, projets et discussions de démonstration sont fictifs.
- Les réponses automatiques dans la messagerie, les notes vocales et la coupure réseau sont simulées pour la démonstration.
- Les points d'accès de l'API sont documentés et la recherche est simulée côté client ; le serveur reste à construire.
- Les résultats de tests sont déclarés par l'auteur ; leur exécution automatique est prévue.

## Prochaines étapes

1. Backend (Supabase) : comptes, projets, messages en temps réel.
2. API publique réelle pour les agents et les outils.
3. Exécution des tests des projets dans un environnement isolé.
4. Messagerie hors ligne avec synchronisation réelle (service worker).

## Structure

```
index.html         Point d'entrée
css/styles.css     Styles (thème clair et sombre)
js/data.js         Données de démonstration
js/store.js        État et persistance locale
js/app.js          Routeur, coquille, accueil, explorer, projets, profils, paramètres
js/messages.js     Messagerie
js/capsules.js     Capsules, mentorat, API
```
