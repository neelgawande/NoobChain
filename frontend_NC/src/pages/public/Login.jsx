import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()

            if (!data.ok) {
                setError(data.reason || "Login failed")
                return
            }

            const meRes = await fetch("http://localhost:3000/me", {
                headers: { Authorization: data.token }
            })
            const meData = await meRes.json()

            if (!meData.ok) {
                setError("Failed to load user after login")
                return
            }

            login(data.token, meData.info)
            navigate("/")
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                {/* ── brand ── */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white mb-2">NoobChain</h1>
                    <p className="text-zinc-500 text-sm">Sign in to your account</p>
                </div>

                {/* ── card ── */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-5">

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError("") }}
                            placeholder="you@example.com"
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError("") }}
                            placeholder="••••••••"
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !email || !password}
                        className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl transition-colors"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing in…
                            </span>
                        ) : "Sign In"}
                    </button>

                </div>

                <p className="text-center text-sm text-zinc-500 mt-6">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors">
                        Register here
                    </Link>
                </p>

            </div>
        </div>
    )
}
