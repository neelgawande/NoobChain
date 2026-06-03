import { NavLink, Outlet, useNavigate } from "react-router-dom"
import logo from "../assets/wallet-dark.svg"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"

const navLinks = [
    { to: "/",        label: "Dashboard" },
    { to: "/explorer",label: "Explorer"  },
    { to: "/send",    label: "Send"      },
    { to: "/mine",    label: "Mine"      },
    { to: "/wallets", label: "Wallets"   },
]

export default function MainLayout() {
    const navigate = useNavigate()
    const { token, logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    function handleLogout() {
        logout()
        navigate("/login", { replace: true })
    }

    const linkClass = ({ isActive }) =>
        `text-sm font-semibold transition-colors ${
            isActive
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-200"
        }`

    const activeDot = ({ isActive }) => isActive

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col">

            {/* ── navbar ── */}
            <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="px-6 h-14 flex items-center gap-6">

                    {/* brand */}
                    <div
                        className="flex items-center gap-2.5 cursor-pointer shrink-0"
                        onClick={() => navigate("/")}
                    >
                        <img src={logo} alt="logo" className="w-7 h-7" />
                        <span className="font-black text-lg tracking-tight text-white">
                            Noob<span className="text-pink-400">Chain</span>
                        </span>
                    </div>

                    {/* desktop nav links */}
                    {token && (
                        <div className="hidden md:flex items-center gap-1 ml-4">
                            {navLinks.map(({ to, label }) => (
                                <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) =>
                                    `relative px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                        isActive
                                            ? "text-white bg-zinc-800"
                                            : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
                                    }`
                                }>
                                    {label}
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {!token && (
                        <div className="hidden md:flex items-center gap-1 ml-4">
                            {[{ to: "/login", label: "Login" }, { to: "/register", label: "Register" }].map(({ to, label }) => (
                                <NavLink key={to} to={to} className={({ isActive }) =>
                                    `px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                        isActive
                                            ? "text-white bg-zinc-800"
                                            : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
                                    }`
                                }>
                                    {label}
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* right side */}
                    <div className="ml-auto flex items-center gap-3">
                        {token && (
                            <button
                                onClick={handleLogout}
                                className="hidden md:block text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Sign out
                            </button>
                        )}

                        {/* mobile hamburger */}
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            className="md:hidden flex flex-col gap-1.5 p-1.5"
                            aria-label="Toggle menu"
                        >
                            <span className={`block h-0.5 w-5 bg-zinc-400 transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                            <span className={`block h-0.5 w-5 bg-zinc-400 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                            <span className={`block h-0.5 w-5 bg-zinc-400 transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* mobile menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-1">
                        {(token ? navLinks : [{ to: "/login", label: "Login" }, { to: "/register", label: "Register" }]).map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === "/"}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                        isActive
                                            ? "text-white bg-zinc-800"
                                            : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
                                    }`
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                        {token && (
                            <button
                                onClick={() => { setMenuOpen(false); handleLogout() }}
                                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-zinc-900 transition-colors"
                            >
                                Sign out
                            </button>
                        )}
                    </div>
                )}
            </nav>

            {/* ── page content ── */}
            <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
                <Outlet />
            </main>

        </div>
    )
}
