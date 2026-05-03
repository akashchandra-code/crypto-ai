import axios from 'axios'


const api = axios.create({
    baseURL: "https://crypto-ai-gq4m.onrender.com",
    withCredentials: true,
})

export async function register({ email, username, password }) {
    try {
        const response = await api.post("/api/auth/register", { email, username, password })
        return response.data
    } catch (error) {
        console.log("BACKEND ERROR:", error.response?.data); 
        throw error;
    }
}
export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", { email, password })
    return response.data
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me")
    return response.data
}