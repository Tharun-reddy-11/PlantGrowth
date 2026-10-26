import axios from 'axios';
const client=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL||'http://localhost:8080/api'});
client.interceptors.request.use(c=>{const t=sessionStorage.getItem('accessToken');if(t)c.headers.Authorization=`Bearer ${t}`;return c});
export default client;
