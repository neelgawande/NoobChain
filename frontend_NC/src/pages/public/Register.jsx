import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export default function Register() {
    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, role: "user" })
            })
            const data = await res.json()

            if (!data.ok) {
                setError(data.reason || "Registration failed")
                return
            }

            // Show success state briefly, then redirect — no alert()
            setSuccess(true)
            setTimeout(() => navigate("/login"), 1500)

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
                    <p className="text-zinc-500 text-sm">Create your account</p>
                </div>

                {/* ── success state ── */}
                {success ? (
                    <div className="bg-green-950 border border-green-800 rounded-2xl p-8 text-center">
                        <p className="text-2xl mb-2">✓</p>
                        <p className="font-black text-green-300 text-lg mb-1">Account Created</p>
                        <p className="text-zinc-500 text-sm">Redirecting to login…</p>
                    </div>
                ) : (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-5">

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                Username
                            </label>
                            <input
                                value={username}
                                onChange={e => { setUsername(e.target.value); setError("") }}
                                placeholder="satoshi"
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
                                required
                            />
                        </div>

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
                            disabled={loading || !username || !email || !password}
                            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl transition-colors"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account…
                                </span>
                            ) : "Create Account"}
                        </button>

                    </div>
                )}

                <p className="text-center text-sm text-zinc-500 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors">
                        Login here
                    </Link>
                </p>

            </div>
        </div>
    )
}
