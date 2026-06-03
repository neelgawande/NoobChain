import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/user/Dashboard"
import Explorer from "./pages/user/Explorer"
import SendTransaction from "./pages/user/SendTransaction"
import Mine from "./pages/admin/Mine"
import Login from "./pages/public/Login"
import Register from "./pages/public/Register"
import ProtectedRoute from "./components/layout/ProtectedRoute"
import AuthRoute from "./components/layout/AuthRoute"
import Wallets from "./pages/user/Wallets"
import CreateWallet from "./pages/user/CreateWallet"
import WalletDetail from "./pages/user/WalletDetail"
import BlockDetail from "./pages/user/BlockDetail"

function App() {

    return (
        <BrowserRouter>
            <Routes>

                {/* PUBLIC ONLY (blocked if logged in) */}
                <Route
                    path="/login"
                    element={
                        <AuthRoute>
                            <Login/>
                        </AuthRoute>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <AuthRoute>
                            <Register/>
                        </AuthRoute>
                    }
                />

                {/* PROTECTED APP */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <MainLayout/>
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard/>}/>
                    <Route path="explorer" element={<Explorer/>}/>
                    <Route path="send" element={<SendTransaction/>}/>
                    <Route path="mine" element={<Mine/>}/>
                    <Route path="wallets" element={<Wallets/>}/>
                    <Route path="wallets/create" element={<CreateWallet/>}/>
                    <Route path="wallet/:address" element={<WalletDetail/>}/>
                    <Route path="block/:height" element={<BlockDetail/>}/>
                </Route>

            </Routes>
        </BrowserRouter>
    )
}

export default App