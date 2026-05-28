import { Link, Outlet } from "react-router-dom"

export default function MainLayout(){
    return(
        <div className="min-h-screen bg-zinc-950 text-white">
            <nav className="border-b border-zinc-800 px-6 py-4 flex gap-6">
                <Link to="/">Dashboard</Link>
                <Link to="/explorer">Explorer</Link>
                <Link to="/send">Send</Link>
            </nav>

            <main className="p-6">
                <Outlet/>
            </main>
        </div>
    )
}