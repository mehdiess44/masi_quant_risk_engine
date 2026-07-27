# 🏦 MASI Quant Risk Engine — Moteur de Risque & Conformité Bâle III / FRTB

![Release Version](https://img.shields.io/badge/version-0.1.0.0-blue.svg)
![Bâle III Compliance](https://img.shields.io/badge/Bâle_III-MAR20_|_MAR33_|_MAR50-green.svg)
![Python Backend](https://img.shields.io/badge/FastAPI-Python_3.12-lightgrey.svg)
![React Frontend](https://img.shields.io/badge/React-18.x-cyan.svg)

Le **MASI Quant Risk Engine** est la plateforme interactive de mesure, de backtesting et de pilotage du risque de marché pour l'indice **MASI (Moroccan All Shares Index)** développée pour les comités de risque bancaire et de gestion d'actifs (CDG / CDG Capital).

Le système interconnecte les modèles de recherche quantitative (trois notebooks Jupyter R&D figés) avec un dashboard temps réel moderne développé sous **FastAPI** et **React**.

---

## 📌 Table de Correspondance & Traçabilité R&D ↔ Production

Cette table constitue le **référentiel de traçabilité officiel** pour les auditeurs et reviewers du risque bancaire. Elle établit la correspondance exacte au chiffre près entre les notebooks de recherche quantitative (R&D) et le code du dashboard en production.

| Métrique / Indicateur | Libellé Dashboard | Notebook R&D Source | Cellule Notebook | Fichier / Endpoint Backend | Formule Mathématique | Référence Réglementaire Bâle III / FRTB |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`var_mc`** | VaR Monte Carlo (MAD) | `02_Moteur_MonteCarlo_VaR_MASI.ipynb` | Cellule 21 | `backend/app/models/moteur_mc_v3.json` | $\text{VaR}_\alpha = S_0 - P_{\alpha}(S_T)$ | Bâle III / FRTB (MAR20.4) |
| **`es_mc`** | Expected Shortfall Monte Carlo | `02_Moteur_MonteCarlo_VaR_MASI.ipynb` | Cellule 23 | `backend/app/models/moteur_mc_v3.json` | $\text{ES}_\alpha = E[S_0 - S_T \mid S_0 - S_T > \text{VaR}_\alpha]$ | FRTB (MAR33.1 - Transition VaR $\to$ ES) |
| **`mu_calibrated`** | Rendement Journalier Calibré ($\mu$) | `02_Moteur_MonteCarlo_VaR_MASI.ipynb` | Cellule 21 | `moteur_mc_v3.json` (`mu_journalier`: `0.00032432` $\approx$ 8.17% ann.) | $\mu = \frac{1}{N}\sum_{t=1}^N \ln\left(\frac{S_t}{S_{t-1}}\right)$ | Bâle III (MAR21.3 - Calibration historique) |
| **`sigma_calibrated`** | Volatilité Journalière Calibrée ($\sigma$) | `02_Moteur_MonteCarlo_VaR_MASI.ipynb` | Cellule 21 | `moteur_mc_v3.json` (`sigma_journalier`: `0.00788724` $\approx$ 12.52% ann.) | $\sigma = \sqrt{\frac{1}{N-1}\sum_{t=1}^N (r_t - \mu)^2}$ | Bâle III (MAR21.3 - Paramètres stochastiques) |
| **`s0_calibrated`** | Prix Initial Calibré ($S_0$) | `02_Moteur_MonteCarlo_VaR_MASI.ipynb` | Cellule 21 | `moteur_mc_v3.json` (`S0`: `12.38882`) | $S_0 = S_{t_{\text{max}}}$ | Bâle III (Valorisation Mark-to-Market) |
| **`seed_42`** | Graine Aléatoire Reproductible | `02_Moteur_MonteCarlo_VaR_MASI.ipynb` | Cellule 8 | `backend/app/routers/montecarlo.py` (`seed=42`) | $Z \sim \mathcal{N}(0,1), \quad \text{seed}=42$ | Bâle III (MAR50 - Auditalité & Reproductibilité) |
| **`var_ml`** | VaR Machine Learning (LightGBM) | `03_MASI_VaR_MachineLearning_QuantileRegression.ipynb` | Cellule 15 | `backend/app/models/lgb_var_model.txt` | $L_q(y,\hat{y}) = \max(q(y-\hat{y}), (q-1)(y-\hat{y}))$ | Bâle III / EBA Guidelines IA Explicable |
| **`es_ml`** | Expected Shortfall Conditionnel ML | `03_MASI_VaR_MachineLearning_QuantileRegression.ipynb` | Cellule 18 | `backend/app/services/ml_engine.py` | $\text{ES}_{\text{ML}} = E[L_{\text{réel}} \mid L_{\text{réel}} > \hat{\text{VaR}}_{\text{ML}}]$ | FRTB (MAR33.1 - Expected Shortfall Conditionnel) |
| **`feature_importance`** | Importance des Variables (SHAP / Gain) | `03_MASI_VaR_MachineLearning_QuantileRegression.ipynb` | Cellule 19 | `backend/app/services/ml_engine.py` | $\text{Gain}(j) = \sum_{T} \text{Gain scission}(j)$ | Bâle III (EBA/GL/2021/12 - Gouvernance IA) |
| **`kupiec_pof`** | Test de Kupiec (POF Likelihood Ratio) | `02_Moteur...` & `03_MASI...` | Cellule 25 | `backend/app/routers/backtesting.py` | $\text{LR}_{\text{POF}} = -2 \ln \left[ \frac{(1-\alpha)^{T-x}\alpha^x}{(1-\hat{p})^{T-x}\hat{p}^x} \right]$ | Bâle III (MAR50.2 - Backtesting Modèle Interne) |
| **`traffic_light`** | Approche Feux Tricolores Bâlois | `02_Moteur_MonteCarlo_VaR_MASI.ipynb` | Cellule 26 | `backend/app/services/monte_carlo_engine.py` | $P(X \le k) = \sum_{i=0}^k \binom{T}{i} \alpha^i (1-\alpha)^{T-i}$ | Bâle III (MAR50.4 à MAR50.8 - Loi Binomiale) |
| **`capital_penalty`** | Multiplicateur de Capital Bâlois ($m_c$) | `02_Moteur_MonteCarlo_VaR_MASI.ipynb` | Cellule 26 | `backend/app/services/monte_carlo_engine.py` | $K = m_c \cdot \text{VaR}_{60j} + \text{surcharge}$ | Bâle III (MAR50.4 - Majoration Zone Jaune/Rouge) |

---

## 🛠️ Synthèse des Correctifs d'Audit Quantitatif (Release `v0.1.0.0`)

L'audit de conformité R&D ↔ Production a permis de corriger 5 incohérences majeures :

1. **Bug #1 — Calibration Monte Carlo Interactive :**
   * **Problème :** L'interface affichait par défaut des valeurs génériques arrondies ($\mu=0\%$, $\sigma=15\%$, $S_0=1\,000\,000$).
   * **Correction :** Le backend et le frontend chargent désormais par défaut `moteur_mc_v3.json` ($\mu \approx 8.17\%$ ann., $\sigma \approx 12.52\%$ ann., $S_0 = 12.39$). L'utilisateur peut personnaliser les paramètres via les sliders UI tout en conservant la valeur de départ calibrée sur le MASI.
2. **Bug #2 — Expected Shortfall ML Rigoureux :**
   * **Problème :** L'ES ML dans le cartouche UI reposait sur un ratio statique fictif (-0.70%).
   * **Correction :** Remplacement par un calcul rigoureux d'ES Conditionnel calculé à partir de l'espérance de la queue des résidus du modèle LightGBM (`backend/app/services/ml_engine.py`).
3. **Bug #3 — Distinction des Horizons Réglementaires Bâle III :**
   * **Problème :** Confusion sur la page Conformité entre la fenêtre de calcul des feux tricolores (250j) et la période globale de test.
   * **Correction :** Modification des libellés UI pour distinguer explicitement la **Fenêtre Glissante Évaluée (250 jours)** pour la classification en Zone Verte/Jaune/Rouge de la **Période Totale de Backtesting (1265 jours / 5 ans)** utilisée par le test de ratio de vraisemblance de Kupiec.
4. **Bug #4 — Reproductibilité des Simulations Monte Carlo :**
   * **Problème :** Risque de non-reproductibilité des tirages stochastiques lors des réunions du comité de risque.
   * **Correction :** Fixation explicite de la graine pseudo-aléatoire `seed=42` dans l'API `/api/montecarlo/simulate` et ajout de l'option "Mode Audit" dans le formulaire UI.
5. **Bug #5 — Badges de Traçabilité Interactifs :**
   * **Problème :** Absence d'explicabilité directe pour les auditeurs sur l'origine des formules et des données R&D.
   * **Correction :** Création du composant `TraceabilityBadge.jsx` et du catalogue `traceability_catalog.js` affichant une info-bulle contextuelle (Notebook, Cellule, Formule, Référence Bâle III) pour chaque métrique du dashboard.

---

## 🏗️ Architecture Technique

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD REACT (Port 3000)                     │
├──────────────┬──────────────────┬─────────────────┬────────────────────┤
│ Vue Ensemble │ Simulation MC    │ Machine Learning│ Conformité Bâle III│
└──────┬───────┴────────┬─────────┴────────┬────────┴─────────┬──────────┘
       │                │                  │                  │
       │ GET            │ POST             │ GET              │ GET
       │ /api/masi/...  │ /api/montecarlo  │ /api/ml/var      │ /api/compliance
       ▼                ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       FASTAPI BACKEND (Port 8000)                      │
├────────────────────────────────────────────────────────────────────────┤
│ • MonteCarloEngine  (MBG, calibration moteur_mc_v3.json, seed=42)     │
│ • MLEngine          (LightGBM Pinball Loss, ES Conditionnel)           │
│ • BacktestingEngine (Kupiec POF, Traffic Light 250j, Pénalités Bâle III)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Suite de Tests & Non-Régression Automatisée

Le projet intègre une suite de tests unitaires et d'intégration validant les 4 métriques de non-régression au chiffre près :

```bash
# Exécution de la suite de tests backend
cd backend
venv\Scripts\python.exe -m pytest tests -v
```

### Métriques de Non-Régression Strictes (Validées par `test_qa_regressions.py`) :
* **MASI Last Close :** `15.886`
* **Volatilité Historique 20D :** `14.06%`
* **Monte Carlo (MAD) :** $\hat{p} = 4.51\%$, $\text{LR}_{\text{POF}} = 0.67$, $\text{p-value} = 0.413$ (Modèle Valide)
* **Machine Learning (LightGBM) :** $\hat{p} = 4.03\%$, $\text{LR}_{\text{POF}} = 2.67$, $\text{p-value} = 0.102$ (Modèle Valide)
* **Feature Importance Top 1 :** `Amplitude_Intraday` ($\approx 763.87$)

---

## 🚀 Démarrage Rapide (Environnement de Développement / UAT)

### 1. Démarrer le Backend FastAPI :
```bash
cd backend
venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
* Swagger UI de l'API : `http://localhost:8000/docs`

### 2. Démarrer le Frontend React :
```bash
cd frontend
npm start
```
* Application web : `http://localhost:3000`

---

## 📝 Contact & Maintenance
* **Département :** Gestion des Risques & Recherche Quantitative — CDG / CDG Capital
* **Documentation interne :** Consulter [TODOS.md](file:///c:/Users/mehdi/projet_risque_cdg/TODOS.md) pour les éléments de sécurité différés (Auth JWT, CORS).
