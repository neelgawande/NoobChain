import { NavLink, Outlet } from "react-router-dom"
import logo from "../assets/wallet-dark.svg"

export default function MainLayout(){
    return(
        <>
        <div className="min-h-screen bg-zinc-950 text-white">
            <nav className="border-b bg-amber-950 border-zinc-800 px-6 py-4 flex gap-6">
                <img src={logo} alt="logo" className="w-10 h-10"/>

                <h1 className="text-4xl font-mono font-bold pr-7 pl-2">
                    NoobChain
                </h1>

                <NavLink
                    to="/"
                    className={({isActive})=>
                        `pt-2 transition ${
                            isActive
                            ? "text-pink-300 text-2xl"
                            : "hover:text-pink-300 hover:underline"
                        }`
                    }>
                    Dashboard
                </NavLink>

                <NavLink
                    to="/explorer"
                    className={({isActive})=>
                        `pt-2 transition ${
                            isActive
                            ? "text-pink-300 text-2xl"
                            : "hover:text-pink-300 hover:underline"
                        }`
                    }>
                    Explorer
                </NavLink>

                <NavLink
                    to="/send"
                    className={({isActive})=>
                        `pt-2 transition ${
                            isActive
                            ? "text-pink-300 text-2xl"
                            : "hover:text-pink-300 hover:underline"
                        }`
                    }>
                    Send
                </NavLink>

            </nav>

            <main className="p-5">
                <Outlet/>
            </main>
        </div>
        </>
    )
}