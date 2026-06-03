import { NavLink, Outlet, useNavigate } from "react-router-dom"
import logo from "../assets/wallet-dark.svg"
import {useAuth} from "../context/AuthContext"

export default function MainLayout(){

    const navigate = useNavigate()
    const {token,logout} = useAuth()

    function handleLogout(){
        logout()
        navigate("/login",{replace:true})
    }

    return(
        <div className="min-h-screen bg-zinc-950 text-white">

            <nav className="border-b bg-amber-950 border-zinc-800 px-6 py-4 flex items-center gap-6">

                <img src={logo} alt="logo" className="w-10 h-10"/>

                <h1 className="text-3xl font-mono font-bold pr-6">
                    NoobChain
                </h1>

                {token && (
                    <>
                        <NavLink to="/" className={({isActive})=>isActive?"text-pink-300 text-xl":"hover:text-pink-300"}>Dashboard</NavLink>
                        <NavLink to="/explorer" className={({isActive})=>isActive?"text-pink-300 text-xl":"hover:text-pink-300"}>Explorer</NavLink>
                        <NavLink to="/send" className={({isActive})=>isActive?"text-pink-300 text-xl":"hover:text-pink-300"}>Send</NavLink>
                        <NavLink to="/mine" className={({isActive})=>isActive?"text-pink-300 text-xl":"hover:text-pink-300"}>Mine</NavLink>
                        <NavLink to="/wallets" className={({isActive})=>isActive?"text-pink-300 text-xl":"hover:text-pink-300"}>Wallets</NavLink>
                    </>
                )}

                {!token && (
                    <>
                        <NavLink to="/login" className={({isActive})=>isActive?"text-pink-300 text-xl":"hover:text-pink-300"}>Login</NavLink>
                        <NavLink to="/register" className={({isActive})=>isActive?"text-pink-300 text-xl":"hover:text-pink-300"}>Register</NavLink>
                    </>
                )}

                <div className="ml-auto">
                    {token && (
                        <button
                            onClick={handleLogout}
                            className="bg-red-900 hover:bg-red-800 transition px-4 py-2 rounded-lg text-sm"
                        >
                            Logout
                        </button>
                    )}
                </div>

            </nav>

            <main className="p-5">
                <Outlet/>
            </main>

        </div>
    )
}