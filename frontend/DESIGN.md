# Cahier des Charges Esthétique — Dashboard Risque (Standard CDG)

## 1. Principes de Design
- **Thème** : Dark Mode Institutionnel obligatoire (`#090D16` / `#111827`).
- **Densité** : Interface compacte à haute densité d'information. Marges et paddings réduits.
- **Typographie** : Monospace pour toutes les valeurs numériques (`JetBrains Mono`, `Roboto Mono`) afin de garantir l'alignement parfait des décimales.

## 2. Palette de Couleurs Sémantiques
- **Fond principal** : `#090D16`
- **Conteneurs / Cards** : `#111827`
- **Bordures / Séparateurs** : `#1F2937`
- **Conformité (Zone Verte / Bâle III)** : `#10B981` (Vert Émeraude)
- **Violation (Exception VaR / Kupiec)** : `#EF4444` (Rouge Écarlate)
- **Texte Neutre** : `#F9FAFB` (Principal), `#9CA3AF` (Secondaire)
- **Accentuation (Graphiques)** : `#3B82F6` (Bleu Royal)

## 3. Composants Clés
- **TradingView Lightweight Charts** : Pour les chandeliers MASI et la ligne de Value at Risk.
- **AG Grid (Dark Theme)** : Pour le registre d'audit et la Hit Sequence (1265 jours).
- **Traffic Light Widget** : Indicateur de conformité réglementaire (Zone Verte / Jaune / Rouge).