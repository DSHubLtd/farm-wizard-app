import axios from "axios";

export default axios.create({ baseURL: "http://192.168.1.73:5000/api/v1" });
// export default axios.create({
//   baseURL: "https://farm-wizard-api.onrender.com/api/v1",
// });
