# MASI Quant Risk Engine — TODOS & Éléments Différés

## Hors Périmètre Immédiat (Différé par /autoplan - Phase 1 CEO Review)
* [ ] **Génération automatisée de rapports Bâle III exportables en PDF (Approche C) :** Reporté à une itération post-stage pour concentrer 100% de l'effort actuel sur l'exactitude mathématique interactive et la traçabilité en direct.
* [ ] **Support Multi-Portefeuilles / Multi-Classes d'Actifs :** Le moteur se concentre exclusivement sur l'indice MASI et les portefeuilles actions marocains affiliés pour garantir la conformité Bâle III locale.
* [ ] **Connexion flux de marché en temps réel (API Bourse de Casablanca) :** En dehors du blast radius actuel (les 3 notebooks R&D figés constituent la source de données de référence).

## Sécurité & Dette Technique (Identifié par /cso & /qa)
* [ ] **[SÉCURITÉ - HIGH] Authentification sur les Endpoints API de Risque (A01:2021) :** Actuellement différé pour la phase de test interne. Pour le passage en production, implémenter une dépendance de vérification d'API Key ou de jeton JWT sur `app.include_router()` afin d'empêcher les lancements de simulation non autorisés sur le réseau interne.
* [ ] **[SÉCURITÉ - MEDIUM] Abstraction des origines CORS par variable d'environnement (A05:2021) :** Remplacer l'origine hardcodée `http://localhost:3000` par la lecture de `os.getenv("ALLOWED_ORIGINS")` avant le déploiement sur serveur UAT/Production.
