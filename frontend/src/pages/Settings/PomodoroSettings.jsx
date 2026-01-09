import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Breadcrumbs from "../../components/_partials/Breadcrumbs";
import FormInput from "../../components/FormInput";
import Spinner from "../../components/Spinner";
import { getPomodoroSettings, updatePomodoroSettings } from "../../api/apiEndpoints";

const PRESETS = [
    {
        key: "classic",
        label: "Classic 25 / 5",
        focus_minutes: 25,
        short_break_minutes: 5,
        long_break_minutes: 15,
        sessions_before_long_break: 4
    },
    {
        key: "extended",
        label: "Deep Work 50 / 10",
        focus_minutes: 50,
        short_break_minutes: 10,
        long_break_minutes: 30,
        sessions_before_long_break: 4
    },
    {
        key: "sprint",
        label: "Sprint 90 / 20",
        focus_minutes: 90,
        short_break_minutes: 20,
        long_break_minutes: 45,
        sessions_before_long_break: 2
    }
];

const PomodoroSettings = () => {
    const [settings, setSettings] = useState(null);
    const [form, setForm] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getPomodoroSettings();
            setSettings(data);
            setForm(data);
        } finally {
            setLoading(false);
        }
    };
    const validate = (data) => {
        if (data.focus_minutes < 10 || data.focus_minutes > 180)
            return "Focus duration must be between 10 and 180 minutes";

        if (data.short_break_minutes < 1 || data.short_break_minutes > 30)
            return "Short break must be between 1 and 30 minutes";

        if (data.long_break_minutes < data.short_break_minutes)
            return "Long break must be longer than short break";

        if (data.long_break_every < 2 || data.long_break_every > 10)
            return "Sessions before long break must be between 2 and 10";

        return null;
    };

    const handleSave = async () => {
        const error = validate(form);
        if (error) {
            toast.error(error);
            return;
        }

        try {
            setSaving(true);
            await updatePomodoroSettings(form);
            setSettings(form);
            setIsEditing(false);
            toast.success("Pomodoro settings updated");
        } catch {
            toast.error("Failed to update pomodoro settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <>
            <Breadcrumbs items={[
                { label: "Settings", path: "/settings" },
                { label: "Pomodoro", active: true }
            ]} />

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 space-y-6 max-w-xl">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Pomodoro Settings</h2>

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-1.5 text-sm rounded-lg bg-indigo-600 text-white"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {/* View mode */}
                {!isEditing && (
                    <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                        <SettingRow label="Focus Duration" value={`${settings.focus_minutes} minutes`} />
                        <SettingRow label="Short Break" value={`${settings.short_break_minutes} minutes`} />
                        <SettingRow label="Long Break" value={`${settings.long_break_minutes} minutes`} />
                        <SettingRow label="Sessions Before Long Break" value={settings.long_break_every} />
                    </div>
                )}

                {/* Edit mode */}
                {/* Presets */}
                {isEditing && (
                    <div className="flex flex-wrap gap-2">
                        {PRESETS.map(preset => (
                            <button
                                key={preset.key}
                                type="button"
                                onClick={() => setForm({
                                    focus_minutes: preset.focus_minutes,
                                    short_break_minutes: preset.short_break_minutes,
                                    long_break_minutes: preset.long_break_minutes,
                                    sessions_before_long_break: preset.sessions_before_long_break
                                })}
                                className="px-4 py-2 text-sm rounded-lg
                border border-gray-200 dark:border-gray-600
                hover:bg-indigo-50 dark:hover:bg-indigo-900/40
                hover:border-indigo-500 dark:hover:border-indigo-400
                transition"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                )}

                {isEditing && (
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            handleSave();
                        }}
                        className="space-y-4"
                    >
                        <FormInput
                            label="Focus Duration (minutes)"
                            type="number"
                            min={10}
                            max={180}
                            value={form.focus_minutes}
                            onChange={e => setForm({ ...form, focus_minutes: +e.target.value })}
                        />

                        <FormInput
                            label="Short Break (minutes)"
                            type="number"
                            value={form.short_break_minutes}
                            onChange={e => setForm({ ...form, short_break_minutes: +e.target.value })}
                        />

                        <FormInput
                            label="Long Break (minutes)"
                            type="number"
                            value={form.long_break_minutes}
                            onChange={e => setForm({ ...form, long_break_minutes: +e.target.value })}
                        />

                        <FormInput
                            label="Sessions before Long Break"
                            type="number"
                            value={form.long_break_every}
                            onChange={e => setForm({ ...form, long_break_every: +e.target.value })}
                        />

                        <div className="flex items-center pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
                            <div className="ml-auto flex gap-3">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setForm(settings);
                                        setIsEditing(false);
                                    }}
                                    className="px-6 py-2.5 text-sm font-semibold
                                    text-gray-700 dark:text-gray-300
                                    border border-gray-200 dark:border-gray-600
                                    rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700
                                    transition-all active:scale-95"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 text-sm font-semibold
                                    text-white bg-blue-600 hover:bg-blue-700
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    rounded-xl transition-all active:scale-95
                                    shadow-md shadow-blue-500/20
                                    flex items-center gap-2"
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
            </div>
        </>
    );
};

const SettingRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium">{value}</span>
    </div>
);

export default PomodoroSettings;
