import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import PasswordStrength from "../components/PasswordStrength";
import Spinner from "../components/Spinner";
import PasswordRulesTooltip from "../components/PasswordRulesTooltip";
import GoogleAuthButton from "../components/GoogleAuthButton";

import { registerUser } from "../api/apiEndpoints";

const Register = () => {
    const [form, setForm] = useState({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
    });
    const [showRules, setShowRules] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const passwordMismatch =
        form.confirmPassword &&
        form.password !== form.confirmPassword;


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    const handleRegister = async () => {

        setLoading(true);

        try {
            await registerUser(
                form.email,
                form.firstName,
                form.lastName,
                form.password
            );
            toast.success('Account Successfully registered.')
            toast.success('Login to your account')
            navigate('/login')
        } catch (error) {
            console.log("Register data:", form);
            toast.error('Registration failed. Please try again.')
        } finally {
            setLoading(false);
        }
    };

    const handleNav = () => {
        navigate('/login')
    }

    return (
        <div className="min-h-[calc(100vh-90px)] flex items-center justify-center py-10">
            <AuthCard
                title="Create Account"
                footer={
                    <>
                        Already have an account?{" "}
                        <span className="text-blue-500 cursor-pointer" onClick={handleNav}>
                            Login
                        </span>
                    </>
                }
            >
                <div className="flex flex-col gap-3">
                    <form
                        className="flex flex-col gap-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleRegister();
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
                            label="First Name"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                        />

                        <FormInput
                            label="Last Name"
                            name="lastName"
                            value={form.lastName}
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
                            onMouseEnter={() => setShowRules(true)}
                            onMouseLeave={() => setShowRules(false)}
                        >
                            <div className="relative">
                                <PasswordStrength password={form.password} />

                                {showRules && (
                                    <PasswordRulesTooltip password={form.password} />
                                )}
                            </div>
                        </FormInput>

                        <FormInput
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                        >
                            {passwordMismatch && (
                                <span className="text-xs text-red-500">
                                    Passwords do not match
                                </span>
                            )}
                        </FormInput>

                        {/* <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 mt-2"
                        >
                            Register
                        </button> */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-md py-2 mt-2 flex justify-center items-center gap-2"
                        >
                            {loading && <Spinner />}
                            {loading ? "Registering..." : "Register"}
                        </button>

                    </form>
                    <GoogleAuthButton text="signup_with" />
                </div>
            </AuthCard>
        </div>
    );
};

export default Register;
