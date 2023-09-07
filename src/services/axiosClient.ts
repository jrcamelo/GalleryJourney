import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_BACK_API,
    withCredentials: true
})