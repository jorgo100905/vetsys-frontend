// ==========================================================================
// CLIENTE API UNIFICADO - VETSYS
// ==========================================================================

const API_BASE_URL = "https://localhost:7000/api";

// Métodos genéricos reutilizables
const API = {
    // PETICIÓN GET (Obtener datos)
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error en GET /${endpoint}:`, error);
            throw error;
        }
    },

    // PETICIÓN POST (Crear registros)
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error en POST /${endpoint}:`, error);
            throw error;
        }
    },

    // PETICIÓN PUT (Actualizar datos)
    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error en PUT /${endpoint}:`, error);
            throw error;
        }
    }
};