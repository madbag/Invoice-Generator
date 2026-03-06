import axios from "axios";

export interface AuthFormData {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserProfile {
  token: string;
  result: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

//this runs before every request and adds the token to the header if it exists
API.interceptors.request.use((req) => {
  const profile = localStorage.getItem("profile");

  if (profile && req.headers) {
    req.headers.Authorization = `Bearer ${JSON.parse(profile).token}`;
  }
  return req;
});

//endpoints in one place
export const signIn = (formData: AuthFormData) =>
  API.post("/auth/login", formData);
export const signUp = (formData: any) => API.post("/auth/register", formData);

export const getProfile = () => API.get("/auth/profile");
export const updateProfile = (data: any) => API.put("/auth/profile", data);
export const deleteProfile = () => API.delete("/auth/profile");

// export const fetchInvoices = () => API.get("/invoices");
// export const createInvoice = (invoiceData: any) =>
  // API.post("/invoices", invoiceData);
