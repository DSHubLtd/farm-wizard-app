import axios from "axios";

export const API_BASE = "https://farm-wizard-api-n68r.onrender.com";
// export const API_BASE = "${API_BASE}/api/v1";

// export default axios.create({ baseURL: "http://192.168.1.73:5000/api/v1" });
export default axios.create({
  baseURL: `${API_BASE}/api/v1`,
});
