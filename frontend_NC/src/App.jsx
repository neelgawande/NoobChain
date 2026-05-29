import {useEffect,useState} from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import Explorer from "./pages/Explorer"
import SendTransaction from "./pages/SendTransaction"
import Mine from "./pages/Mine"

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
                </Route>
            </Routes>
        </BrowserRouter>
        </>
    )
}

export default App