import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8888';

export const api = axios.create({
    baseURL
});
