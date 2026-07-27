# Stage unique pour le backend FastAPI quantitatif
FROM python:3.10-slim

WORKDIR /app

# Installation de libgomp1 nécessaire pour LightGBM sur Debian/Ubuntu slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copie et installation des dépendances Python (optimisation du cache Docker)
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Copie du code backend et des données de référence R&D (Option 2A)
COPY backend/ /app/
COPY data/ /data/
COPY data/ /app/data/

# Variables d'environnement pour l'exécution Python
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Exposition du port 8000
EXPOSE 8000

# Démarrage de l'API FastAPI via Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
