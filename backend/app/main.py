from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Importation des moteurs et du pipeline de donnees
from app.data_pipeline import load_full_data, load_test_data
from app.services.ml_engine import MLEngine

# Importation des routers
from app.routers import (
    masi_router,
    montecarlo_router,
    ml_var_router,
    backtesting_router,
    regulatory_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-chargement (echauffement) des caches de donnees
    print("Chargement des donnees MASI en cache...")
    load_full_data()
    load_test_data()
    
    # Chargement en memoire du modele LightGBM
    print("Chargement du modele LightGBM en memoire...")
    app.state.ml_engine = MLEngine()
    
    print("Application prete.")
    yield
    
    # Clean up si necessaire
    print("Fermeture de l'application.")
    app.state.ml_engine = None

app = FastAPI(
    title="Risk Engine API - CDG Capital",
    description="API FastAPI dense pour les calculs de VaR, Expected Shortfall, Backtesting et Conformite Bale III.",
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS pour autoriser le front-end React local et Docker
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:80",
        "http://127.0.0.1:80",
        "http://localhost",
        "http://127.0.0.1"
    ],
    allow_origin_regex="https?://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montage des sous-routeurs
app.include_router(masi_router)
app.include_router(montecarlo_router)
app.include_router(ml_var_router)
app.include_router(backtesting_router)
app.include_router(regulatory_router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API CDG Risk Engine is running."}
