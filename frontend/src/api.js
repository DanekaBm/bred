// frontend/src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api', // <-- CHANGE THIS LINE to 5001
  withCredentials: true,
});

export default API;