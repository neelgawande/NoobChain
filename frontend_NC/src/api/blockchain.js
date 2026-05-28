import axios from "axios"

const API = "http://localhost:3000"

export async function getChain(){
    const res = await axios.get(`${API}/chain`)
    return res.data
}