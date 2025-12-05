import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';

const app = createApp(App);

// Use environment variable or default to dynamic URL for LAN access
// For development, you can set VUE_APP_API_BASE to http://localhost:5001
const apiBase = process.env.VUE_APP_API_BASE || 
                (window.location.origin.includes('localhost:8080')
                    ? 'http://localhost:5001'  // Development mode with Vue dev server
                    : `${window.location.protocol}//${window.location.hostname}:5001`); // Production or LAN access

axios.defaults.baseURL = apiBase; // Set the baseURL

// Add request interceptor
axios.interceptors.request.use(
    function (config) {
        console.log('Request:', config);
        return config;
    },
    function (error) {
        console.log('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
axios.interceptors.response.use(
    function (response) {
        console.log('Response:', response);
        return response;
    },
    function (error) {
        console.log('Response Error:', error);
        return Promise.reject(error);
    }
);

app.use(router);
app.use(store);
app.config.globalProperties.$http = axios;
app.mount('#app');