import Breadcrumbs from "../../components/_partials/Breadcrumbs";

const PomodoroSettings = () => (
    <>
        <Breadcrumbs items={[
            { label: "Settings" },
            { label: "Pomodoro", active: true }
        ]} />

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Pomodoro Settings</h2>
            {/* inputs here */}
        </div>
    </>
);

export default PomodoroSettings;