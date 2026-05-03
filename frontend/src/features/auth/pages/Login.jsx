import React, { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)
   

    const { handleLogin } = useAuth()
    const navigate = useNavigate()

    const submitForm = async (event) => {
        event.preventDefault()

        const payload = { email, password }

        console.log("LOGIN PAYLOAD:", payload) // ✅ debug

        try {
            const res = await handleLogin(payload)

            console.log("LOGIN SUCCESS:", res) // ✅ debug

            navigate("/") // ✅ only on success

        } catch (err) {
            console.log("LOGIN FAILED:", err.response?.data) // ✅ debug
        }
    }

    // ✅ already logged in → redirect
    if (!loading && user) {
        return <Navigate to="/" replace />
    }

    return (
        <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur">

                    <h1 className="text-3xl font-bold text-[#31b8c6]">
                        Welcome Back
                    </h1>

                    <p className="mt-2 text-sm text-zinc-300">
                        Sign in with your email and password.
                    </p>

                    

                    <form onSubmit={submitForm} className="mt-8 space-y-5">

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-200">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none focus:border-[#31b8c6]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-200">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none focus:border-[#31b8c6]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-zinc-950 hover:bg-[#45c7d4] disabled:opacity-50"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-zinc-300">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="font-semibold text-[#31b8c6]">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Login