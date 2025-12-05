// api.js
import axios from 'axios';

// Use environment variable or default to relative URL for same-host deployment
// For development, you can set VUE_APP_API_URL to http://localhost:5001/api
const baseURL = process.env.VUE_APP_API_URL || 
                (window.location.origin.includes('localhost:8080') 
                    ? 'http://localhost:5001/api'  // Development mode with Vue dev server
                    : `${window.location.protocol}//${window.location.hostname}:5001/api`); // Production or LAN access

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
