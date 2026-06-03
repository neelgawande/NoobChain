import { NavLink, Outlet, useNavigate } from "react-router-dom"
import logo from "../assets/wallet-dark.svg"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"

const userLinks = [
    { to: "/",         label: "Dashboard" },
    { to: "/explorer", label: "Explorer"  },
    { to: "/send",     label: "Send"      },
    { to: "/mine",     label: "Mine"      },
    { to: "/wallets",  label: "Wallets"   },
]

const adminLinks = [
    { to: "/admin",       label: "Admin"    },
    { to: "/admin/users", label: "Users"    },
]

const guestLinks = [
    { to: "/login",    label: "Login"    },
    { to: "/register", label: "Register" },
]

function NavLinks({ links, onNavigate }) {
    return links.map(({ to, label }) => (
        <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                        ? "text-white bg-zinc-800"
                        : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
                }`
            }
        >
            {label}
        </NavLink>
    ))
}

export default function MainLayout() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    const isAdmin = user?.role === "admin" || user?.role === "god"

    function handleLogout() {
        logout()
        navigate("/login", { replace: true })
    }

    // All links visible to the current user
    const activeLinks = token
        ? [...userLinks, ...(isAdmin ? adminLinks : [])]
        : guestLinks

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

                    {/* desktop links */}
                    <div className="hidden md:flex items-center gap-1 ml-4">
                        <NavLinks links={activeLinks} />
                    </div>

                    {/* right side */}
                    <div className="ml-auto flex items-center gap-3">
                        {token && isAdmin && (
                            <span className="hidden md:inline text-xs font-bold text-purple-300 bg-purple-950 border border-purple-800 px-2.5 py-1 rounded-lg">
                                {user.role.toUpperCase()}
                            </span>
                        )}

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
                        <NavLinks links={activeLinks} onNavigate={() => setMenuOpen(false)} />
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
