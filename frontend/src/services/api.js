const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Handle API responses globally
 */
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API (${response.status}): ${errorText}`);
    }
    return response.json();
};

/**
 * GET /masi/summary
 */
export const fetchMasiSummary = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/masi/summary`);
        return await handleResponse(response);
    } catch (error) {
        console.error("fetchMasiSummary Error:", error);
        throw error;
    }
};

/**
 * GET /masi/history
 */
export const fetchMasiHistory = async (startDate, endDate) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE_URL}/masi/history${queryString}`);
        return await handleResponse(response);
    } catch (error) {
        console.error("fetchMasiHistory Error:", error);
        throw error;
    }
};

/**
 * GET /montecarlo/calibration
 */
export const fetchMonteCarloCalibration = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/montecarlo/calibration`);
        return await handleResponse(response);
    } catch (error) {
        console.error("fetchMonteCarloCalibration Error:", error);
        throw error;
    }
};

/**
 * POST /montecarlo/simulate
 * Payload map: 
 * confidence_level (ex: 0.95) -> alpha (ex: 0.05)
 * portfolio_value -> S0
 */
export const runMonteCarlo = async ({ portfolio_value, confidence_level, alpha, horizon_days, n_simulations, mu, sigma, custom_params = false, seed = 42 }) => {
    try {
        // Prepare backend payload mapping
        const payload = {
            n_simulations: n_simulations || 100000,
            horizon_days: horizon_days || 1,
            alpha: confidence_level !== undefined ? (1 - confidence_level) : (alpha !== undefined ? alpha : 0.05),
            custom_params: custom_params,
            seed: seed
        };

        if (custom_params && portfolio_value !== undefined && mu !== undefined && sigma !== undefined) {
            payload.S0 = portfolio_value;
            payload.mu = mu;
            payload.sigma = sigma;
        }

        const response = await fetch(`${API_BASE_URL}/montecarlo/simulate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("runMonteCarlo Error:", error);
        throw error;
    }
};

/**
 * GET /ml/var-predictions
 */
export const fetchMLPredictions = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/ml/var-predictions`);
        return await handleResponse(response);
    } catch (error) {
        console.error("fetchMLPredictions Error:", error);
        throw error;
    }
};

/**
 * GET /ml/feature-importance
 */
export const fetchMLFeatureImportance = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/ml/feature-importance`);
        return await handleResponse(response);
    } catch (error) {
        console.error("fetchMLFeatureImportance Error:", error);
        throw error;
    }
};

/**
 * GET /backtesting/kupiec
 */
export const fetchKupiecTest = async (model, alpha = 0.05) => {
    try {
        const params = new URLSearchParams({ model, alpha });
        const response = await fetch(`${API_BASE_URL}/backtesting/kupiec?${params.toString()}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(`fetchKupiecTest (${model}) Error:`, error);
        throw error;
    }
};

/**
 * GET /backtesting/comparison
 */
export const fetchBacktestingComparison = async (alpha = 0.05) => {
    try {
        const params = new URLSearchParams({ alpha });
        const response = await fetch(`${API_BASE_URL}/backtesting/comparison?${params.toString()}`);
        return await handleResponse(response);
    } catch (error) {
        console.error("fetchBacktestingComparison Error:", error);
        throw error;
    }
};

/**
 * GET /regulatory/traffic-light
 */
export const fetchTrafficLight = async (model, window_size = 250, alpha = 0.01) => {
    try {
        const params = new URLSearchParams();
        if (model) params.append('model', model);
        if (window_size) params.append('window_size', window_size);
        if (alpha) params.append('alpha', alpha);

        const response = await fetch(`${API_BASE_URL}/regulatory/traffic-light?${params.toString()}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(`fetchTrafficLight (${model}) Error:`, error);
        throw error;
    }
};
