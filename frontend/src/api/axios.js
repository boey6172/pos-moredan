import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://yggdrasilsolution.com/backend_pos',
});

export default instance; 