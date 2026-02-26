import axios from "axios";

const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export default axiosServices;
