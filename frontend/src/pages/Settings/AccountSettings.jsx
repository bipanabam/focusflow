import { useEffect, useState } from "react";
import { FiUser, FiMail, FiClock, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import API from "../../api/axiosInstance";

import Breadcrumbs from "../../components/_partials/Breadcrumbs";
import FormInput from "../../components/FormInput";
import TimezoneSelect from "../../components/_partials/TimeSelect";
import Spinner from "../../components/Spinner";
import { getUserProfile, updateUserProfile} from "../../api/apiEndpoints";

const ProfileInfoCard = ({ label, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex gap-3">
        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600">
            <Icon size={20} />
        </div>
        <div>
            <p className="text-[11px] uppercase text-gray-400 font-bold">{label}</p>
            <p className="text-sm font-semibold">{value || "—"}</p>
        </div>
    </div>
);

const AccountSettings = () => {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate()
    const [timezones, setTimezones] = useState([]);

    useEffect(() => {
        API.get("/auth/timezones/").then(res => setTimezones(res.data));
    }, []);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        const data = await getUserProfile();
        setUser(data);
        setForm({
            first_name: data.first_name,
            last_name: data.last_name,
            timezone: data.timezone
        });
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try{
            setSaving(true);
            const updatedUser = await updateUserProfile(form);
            setUser(updatedUser);
            setForm(updatedUser); 
            setIsEditing(false);
            toast.success("Account updated successfully");
        } catch {
            toast.error("Failed to update account");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <>
            <Breadcrumbs items={[
                { label: "Settings", path: "/settings" },
                { label: "Account", active: true }
            ]} />

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Account Settings</h2>

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-1.5 text-sm rounded-lg bg-indigo-600 text-white"
                        >
                            Edit
                        </button>
                    )}

                </div>

                {!isEditing && (
                    <div className="grid md:grid-cols-2 gap-4">
                        <ProfileInfoCard
                            label="First Name"
                            value={user.first_name}
                            icon={FiUser}
                        />
                        <ProfileInfoCard
                            label="Last Name"
                            value={user.last_name}
                            icon={FiUser}
                        />
                        <ProfileInfoCard
                            label="Email"
                            value={user.email}
                            icon={FiMail}
                        />
                        <ProfileInfoCard
                            label="Timezone"
                            value={user.timezone}
                            icon={FiClock}
                        />
                    </div>
                )}

                {/* Form */}
                {isEditing && (
                    <form 
                        onSubmit={handleSave}
                        className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                        <FormInput
                            label="First Name"
                            value={form.first_name}
                            onChange={e => setForm({ ...form, first_name: e.target.value })}
                        />
                        <FormInput
                            label="Last Name"
                            value={form.last_name}
                            onChange={e => setForm({ ...form, last_name: e.target.value })}
                        />
                        <TimezoneSelect
                            value={form.timezone}
                            timezones={timezones}
                            onChange={e => setForm({ ...form, timezone: e.target.value })}
                        />

                        <div className="flex items-center pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
                            <div className="ml-auto flex items-center gap-3">

                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all active:scale-95 border border-gray-200 dark:border-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all active:scale-95 shadow-md shadow-blue-500/20 flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Spinner size="sm" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
                {/* Security Section */}
                {!isEditing && (
                    <div className="mt-5 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Security
                        </h3>

                        <button
                            onClick={() => navigate("/settings/account/change-password")}
                            className="w-full flex items-center gap-4 p-4 rounded-xl
                        border dark:border-gray-700
                        hover:border-indigo-500 dark:hover:border-indigo-400
                        hover:shadow-sm transition"
                        >
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900
                                text-indigo-600 dark:text-indigo-300
                                flex items-center justify-center">
                                <FiLock size={18} />
                            </div>

                            <div className="flex-1 text-left">
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Change Password
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Update your account password for better security
                                </p>
                            </div>
                        </button>
                    </div>
                )}
            </div>

        </>
    );
};

export default AccountSettings;
