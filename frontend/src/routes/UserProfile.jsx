import React, { useEffect, useState } from "react";
import { getUserProfile } from "../api/apiEndpoints";

const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUserProfile();
                setProfile(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!profile) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                    {profile.first_name?.[0]}
                    {profile.last_name?.[0]}
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {profile.first_name} {profile.last_name}
                    </h1>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 mb-6">
                <h2 className="text-lg font-semibold mb-4">Account Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <Info label="First Name" value={profile.first_name} />
                    <Info label="Last Name" value={profile.last_name} />
                    <Info label="Email" value={profile.email} />
                    <Info label="Timezone" value={profile.timezone || "Not set"} />
                </div>
            </div>

            {/* Pomodoro Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Pomodoro Preferences</h2>

                <div className="grid grid-cols-3 gap-4 text-sm">
                    <Info label="Focus" value={`${profile.pomodoro_settings?.focus_minutes} min`} />
                    <Info label="Short Break" value={`${profile.pomodoro_settings?.short_break_minutes} min`} />
                    <Info label="Long Break" value={`${profile.pomodoro_settings?.long_break_minutes} min (after every ${profile.pomodoro_settings.long_break_every} pomodoro)`} />
                </div>
            </div>
        </div>
    );
};

const Info = ({ label, value }) => (
    <div>
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
);

export default UserProfile;
