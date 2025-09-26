


import axios from "axios";



const Axios = axios.create({
    baseURL : "http://localhost:51000",

})


Axios.interceptors.response.use(
  (response)  => {
    return response.data ;
  },
  (error) => {
    // Optionally you can normalize the error
    const normalizedError = error?.response?.data || { message: error.message };
    return Promise.reject(normalizedError); // This is important
  }
);


export default Axios