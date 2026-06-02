import {useEffect,useState} from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/user/Dashboard"
import Explorer from "./pages/user/Explorer"
import SendTransaction from "./pages/user/SendTransaction"
import Mine from "./pages/admin/Mine"
import Login from "./pages/public/Login"
import Register from "./pages/public/Register"

function App() {

    return (
        <>

         <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout/>}>
                    <Route index element={<Dashboard/>}/>
                    <Route path="explorer" element={<Explorer/>}/>
                    <Route path="send" element={<SendTransaction/>}/>
                    <Route path="mine" element={<Mine/>}/>
                    <Route path="login" element={<Login/>}/>
                    <Route path="register" element={<Register/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
        </>
    )
}

export default App