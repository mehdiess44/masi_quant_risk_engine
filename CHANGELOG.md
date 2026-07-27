# Changelog
All notable changes to this project will be documented in this file.

## [0.1.0.0] - 2026-07-27
### Added
- Intégration de badges de traçabilité R&D (Bug #5) sur l'ensemble des indicateurs du dashboard avec info-bulles pointant vers les notebooks et fichiers de calibration.
- Suite de tests de non-régression automatisés (`backend/tests/test_qa_regressions.py`) couvrant les 4 points prioritaires Bâle III et FRTB.
- Fichier `TODOS.md` documentant les constats de sécurité différés (CORS, Auth) et les fonctionnalités futures.

### Fixed
- **Bug #1 (Calibration Monte Carlo) :** Chargement automatique par défaut des paramètres calibrés dans le R&D (`moteur_mc_v3.json` : µ ≈ 8.17%, σ ≈ 12.52%, S0 = 12.39, N = 100 000, graine fixe `seed=42`).
- **Bug #2 (Expected Shortfall ML) :** Remplacement de l'approximation statique par un vrai calcul d'ES Conditionnel issu des résidus de régression quantile LightGBM.
- **Bug #3 (Conformité Bâle III) :** Distinction claire dans l'interface entre la fenêtre glissante d'évaluation (250 jours) et l'historique de backtesting global (1265 jours / 5 ans).
- **Bug #4 (Reproductibilité Monte Carlo) :** Activation du mode audit avec graine fixe dans l'UI par défaut pour garantir la reproductibilité des simulations en comité de risque.
