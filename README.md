# MASI Quant Risk Engine

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](#)
[![Python Version](https://img.shields.io/badge/python-3.12-blue.svg)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](#)
[![React](https://img.shields.io/badge/React-18.x-cyan.svg)](#)

Le **MASI Quant Risk Engine** est une plateforme d'évaluation et de gestion des risques financiers de marché dédiée à l'indice boursier marocain **MASI (Moroccan All Shares Index)**.

Le système combine des méthodes quantitatives avancées issues des modèles stochastiques (simulations de Monte Carlo multi-step reposant sur le Mouvement Brownien Géométrique) et des techniques d'Intelligence Artificielle modernes (Régression Quantile via LightGBM) pour calculer la **Value at Risk (VaR)** et l'**Expected Shortfall (ES)** sur différents horizons temporels et niveaux de confiance.

---

## 🚀 Fonctionnalités Clés

- 📊 **Modélisation Stochastique Monte Carlo** : Simulation de trajectoires d'actifs via Mouvement Brownien Géométrique (MBG) multi-step avec calibration dynamique des paramètres.
- 🤖 **Intelligence Artificielle & Régression Quantile** : Estimation non-paramétrique de la VaR et de l'ES conditionnel via LightGBM (optimisation de la *Pinball Loss*).
- ⚖️ **Backtesting Réglementaire (Test de Kupiec)** : Évaluation statistique de la précision des modèles via le test de ratio de vraisemblance POF (*Proportion of Failures*).
- 🚦 **Conformité Bâle III / FRTB & Approche "Traffic Light"** : Classification dynamique en zones réglementaires (Verte, Jaune, Rouge) sur fenêtre glissante de 250 jours avec calcul des surcharges de capital.
- 🎨 **Dashboard Temps Réel Glassmorphic** : Interface utilisateur moderne développée en React, offrant un design sombre glassmorphique, des graphiques temps réel et une réactivité maximale.
- 🔍 **Traçabilité & Audite de Risque** : Transparence des modèles grâce à un système d'explicabilité et de traçabilité liant les formules théoriques, les notebooks R&D et le code de production.

---

## 💻 Stack Technique

### Backend & Core Quantitatif
- **Python 3.12**
- **FastAPI** — Framework API REST asynchrone et hautement performant
- **LightGBM** — Algorithme de Gradient Boosting appliqué à la Régression Quantile
- **NumPy / Pandas / SciPy** — Calcul scientifique, algèbre linéaire et traitement de séries temporelles
- **Pytest** — Suite de tests automatisés et validation de non-régression

### Frontend & UI
- **React 18** — Bibliothèque pour l'interface utilisateur web
- **Tailwind CSS & Lucide Icons** — Système de design moderne avec effets Glassmorphic
- **Recharts** — Visualisation interactive de données et séries temporelles

### Déploiement & DevOps
- **Docker & Docker Compose** — Containerisation multi-services et orchestration
- **Nginx** — Serveur web reverse proxy pour la distribution du frontend

---

## ⚡ Guide de Démarrage (Quickstart)

### Prérequis
- [Docker Desktop](https://www.docker.com/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/) (version 2.0+)
- *Optionnel pour exécution locale sans Docker* : Python 3.12+ et Node.js 18+

### Instructions de Lancement

1. **Cloner le dépôt git :**
   ```bash
   git clone https://github.com/votre-org/masi-quant-risk-engine.git
   cd masi-quant-risk-engine
   ```

2. **Lancer les services via Docker Compose :**
   ```bash
   docker-compose up -d --build
   ```

3. **Vérifier le statut des conteneurs :**
   ```bash
   docker-compose ps
   ```

### URLs d'Accès

- 🌐 **Frontend Application Web :** [http://localhost:3000](http://localhost:3000)
- 📚 **Documentation API (Swagger UI) :** [http://localhost:8000/docs](http://localhost:8000/docs)
- ⚙️ **API Healthcheck :** [http://localhost:8000/api/masi/overview](http://localhost:8000/api/masi/overview)

### Exécution en Mode Développement (sans Docker)

#### Backend FastAPI :
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend React :
```bash
cd frontend
npm install
npm start
```

---

## 🏗️ Architecture System

Le projet adopte une **architecture micro-services découpée**, séparant clairement le moteur analytique de l'interface utilisateur interactive :

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND REACT (Port 3000)                      │
│        (UI Glassmorphic, Visualisations Recharts, Dashboard)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND FASTAPI (Port 8000)                     │
├────────────────────────────────────────────────────────────────────────┤
│ • MonteCarloEngine  : Simulation MBG & calibration stochastique        │
│ • MLEngine          : Inférence LightGBM & ES Conditionnel             │
│ • BacktestingEngine : Tests de Kupiec & Conformité Bâle III            │
│ • Data Pipeline     : Traitement des séries temporelles MASI           │
└────────────────────────────────────────────────────────────────────────┘
```

Cette séparation garantit :
- **Isolation du moteur analytique** : Le backend traite les calculs lourds (simulations Monte Carlo, inférence ML) indépendamment du rendu visuel.
- **Réactivité du frontend** : L'application web consomme l'API REST asynchrone pour mettre à jour les métriques, jauges et graphiques en temps réel.
- **Scalabilité & Modularité** : Possibilité d'ajouter de nouveaux modèles de risque ou de modifier la présentation UI sans impacter le cœur quantitatif.
