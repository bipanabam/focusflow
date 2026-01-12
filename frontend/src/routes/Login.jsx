import { useState } from "react";
import toast from "react-hot-toast";
import AuthCard from "../components/AuthCard"
import FormInput from "../components/FormInput";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { authLogin } = useAuth();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleNav = () => navigate("/register");

    const handleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await authLogin(form.email, form.password);
            if (!result.success) {
                toast.error(result.message);
                setError(result.message);
            } else {
                toast.success("Logged in successfully!")
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-90px)] flex items-center justify-center">
            <AuthCard
                title="Login"
                footer={
                    <>
                        Don't have an account?{" "}
                        <span className="text-blue-500 cursor-pointer" onClick={handleNav}>
                            Sign Up
                        </span>
                    </>
                }
            >
                <div className="flex flex-col gap-3">
                    <form className="flex flex-col gap-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
                    >
                        <FormInput
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        <FormInput
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-md py-2 mt-2 flex justify-center items-center gap-2"
                        >
                            {loading && <Spinner />}
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </AuthCard>
        </div>
    );
};
