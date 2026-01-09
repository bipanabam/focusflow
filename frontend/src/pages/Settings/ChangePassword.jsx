import { useState } from "react";
import toast from "react-hot-toast";
import Breadcrumbs from "../../components/_partials/Breadcrumbs";
import FormInput from "../../components/FormInput";
import Spinner from "../../components/Spinner";
import { changePassword } from "../../api/apiEndpoints";
import { useAuth } from "../../contexts/AuthContext";
import { showApiError } from "../../helpers/showApiError";

const ChangePassword = () => {
    const [form, setForm] = useState({
        current_password: "",
        password: "",
        confirm_password: ""
    });
    const [saving, setSaving] = useState(false);
    const passwordMismatch =
        form.confirm_password &&
        form.password !== form.confirm_password;

    const { authLogout } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm_password) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            setSaving(true);
            await changePassword(form.current_password,
                form.password,form.confirm_password,
            );
            toast.success("Login to your account")
            toast.success("Password updated successfully");
            authLogout();
            // navigate("/settings/account");
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Breadcrumbs
                items={[
                    { label: "Settings", path: "/settings" },
                    { label: "Account", path: "/settings/account" },
                    { label: "Change Password", active: true }
                ]}
            />

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 max-w-xl space-y-4">
                <h2 className="text-lg font-semibold">Change Password</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Current Password"
                        type="password"
                        value={form.current_password}
                        onChange={e => setForm({ ...form, current_password: e.target.value })}
                        required
                    />

                    <FormInput
                        label="New Password"
                        type="password"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        required
                    />

                    <FormInput
                        label="Confirm Password"
                        type="password"
                        value={form.confirm_password}
                        onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                    >
                        {passwordMismatch && (
                            <span className="text-xs text-red-500">
                                Passwords do not match
                            </span>
                        )}
                    </FormInput>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-2 rounded-lg bg-indigo-600 text-white
                                    hover:bg-indigo-700 disabled:opacity-50 flex justify-center"
                    >
                        {saving ? <Spinner size="sm" /> : "Update Password"}
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChangePassword;
