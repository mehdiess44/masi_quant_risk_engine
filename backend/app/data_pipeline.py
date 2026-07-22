import pandas as pd
import numpy as np
import functools
import os

def clean_french_format(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # Corrige le nom des colonnes (supprime les espaces initiaux et remplace les espaces internes par _)
    df.columns = [col.strip().replace(' ', '_') for col in df.columns]
    
    # Nettoie les colonnes numériques au format français
    for col in df.columns:
        if col == 'Date':
            df[col] = pd.to_datetime(df[col]).dt.date
        elif pd.api.types.is_string_dtype(df[col]):
            # Check if it has percentage
            has_percent = df[col].astype(str).str.contains('%').any()
            
            # Remove percentage sign, remove thousands separator (.), replace decimal separator (,) with (.)
            cleaned_col = df[col].astype(str).str.replace('%', '', regex=False)
            cleaned_col = cleaned_col.str.replace('.', '', regex=False)
            cleaned_col = cleaned_col.str.replace(',', '.', regex=False)
            
            # Replace 'nan' strings that might have been formed
            cleaned_col = cleaned_col.replace('nan', np.nan)
            
            # Convert to float
            df[col] = pd.to_numeric(cleaned_col, errors='coerce')
            
            if has_percent:
                df[col] = df[col] / 100.0
                
    return df

def compute_ml_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    # Ensure the dataframe is sorted by date ascending for shift/rolling
    if 'Date' in df.columns:
        df = df.sort_values('Date').reset_index(drop=True)
        
    # We assume 'log_return' exists or we can compute it from Close. 
    # The instruction says "Calcule de manière déterministe les 8 features EXACTES requises..."
    # If log_return doesn't exist, we compute it first:
    if 'log_return' not in df.columns:
        df['log_return'] = np.log(df['Close'] / df['Close'].shift(1))
        
    # 1. return_lag_1
    df['return_lag_1'] = df['log_return'].shift(1)
    
    # 2. return_lag_2
    df['return_lag_2'] = df['log_return'].shift(2)
    
    # 3. return_lag_3
    df['return_lag_3'] = df['log_return'].shift(3)
    
    # 4. return_lag_5
    df['return_lag_5'] = df['log_return'].shift(5)
    
    # 5. Dist_SMA_20 = (Close - SMA_20) / SMA_20
    sma_20 = df['Close'].rolling(window=20).mean()
    df['Dist_SMA_20'] = (df['Close'] - sma_20) / sma_20
    
    # 6. Amplitude_Intraday = (Plus_Haut - Plus_Bas) / Close
    # Columns could be named Plus_Haut and Plus_Bas after stripping/replacing spaces
    df['Amplitude_Intraday'] = (df['Plus_Haut'] - df['Plus_Bas']) / df['Close']
    
    # 7. EWMA_Vol_10d = log_return.ewm(span=10).std()
    df['EWMA_Vol_10d'] = df['log_return'].ewm(span=10).std()
    
    # 8. EWMA_Vol_20d = log_return.ewm(span=20).std()
    df['EWMA_Vol_20d'] = df['log_return'].ewm(span=20).std()
    
    # Keep only the requested features and drop NaNs
    features_cols = [
        'return_lag_1', 'return_lag_2', 'return_lag_3', 'return_lag_5',
        'Dist_SMA_20', 'Amplitude_Intraday', 'EWMA_Vol_10d', 'EWMA_Vol_20d'
    ]
    
    df = df.dropna(subset=features_cols)
    return df

def get_data_path(filename: str) -> str:
    # Handle paths robustly assuming the script is run from project root or inside backend/app
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    data_path = os.path.join(base_dir, 'data', filename)
    if not os.path.exists(data_path):
        # Fallback if running from project root directly
        data_path_root = os.path.join(os.getcwd(), 'data', filename)
        if not os.path.exists(data_path_root):
            raise FileNotFoundError(f"Fichier introuvable: {data_path} ni {data_path_root}. Veuillez vérifier le répertoire 'data/'.")
        return data_path_root
    return data_path

@functools.lru_cache(maxsize=1)
def load_test_data() -> pd.DataFrame:
    filepath = get_data_path('masi_test_clean.csv')
    df = pd.read_csv(filepath)
    df = clean_french_format(df)
    return df

@functools.lru_cache(maxsize=1)
def load_full_data() -> pd.DataFrame:
    filepath = get_data_path('masi_full_clean.csv')
    df = pd.read_csv(filepath)
    df = clean_french_format(df)
    return df

def get_market_summary() -> dict:
    df = load_full_data()
    if df.empty:
        return {}
        
    last_record = df.iloc[-1]
    
    # Calcul des volatilités si elles ne sont pas déjà présentes ou pour s'en assurer
    if 'log_return' not in df.columns:
        df['log_return'] = np.log(df['Close'] / df['Close'].shift(1))
        
    vol_10d = df['log_return'].tail(10).std() * np.sqrt(252)
    vol_20d = df['log_return'].tail(20).std() * np.sqrt(252)
    vol_60d = df['log_return'].tail(60).std() * np.sqrt(252)
    
    # Rendement moyen annuel
    mean_return = df['log_return'].mean()
    annualized_return = mean_return * 252
    
    # Max Drawdown
    cumulative_returns = (1 + df['log_return']).cumprod()
    peak = cumulative_returns.cummax()
    drawdown = (cumulative_returns - peak) / peak
    max_drawdown = drawdown.min()
    
    return {
        "last_close": float(last_record['Close']),
        "mean_return": float(mean_return),
        "annualized_return": float(annualized_return),
        "max_drawdown": float(max_drawdown),
        "volatilities": {
            "10d": float(vol_10d),
            "20d": float(vol_20d),
            "60d": float(vol_60d)
        }
    }
