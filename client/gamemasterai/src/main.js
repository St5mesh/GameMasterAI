import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import api from './api';

const app = createApp(App);

// Use the same base URL as the api instance for consistency
axios.defaults.baseURL = api.defaults.baseURL;

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