import axios from 'axios';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  async (config) => {
    const isTrialExpired = localStorage.getItem('isTrialExpired') === 'true';

    if (isTrialExpired) {
      // Cancel the request if trial is expired
      return Promise.reject({ message: "Trial expired" });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
