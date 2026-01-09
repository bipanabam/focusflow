const getOffset = (tz) =>
    new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "short"
    }).formatToParts(new Date())
        .find(p => p.type === "timeZoneName")?.value;
const TimezoneSelect = ({ value, onChange }) => {
    const timezones = Intl.supportedValuesOf("timeZone");

    return (
        <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-medium text-white">
                Timezone
            </label>

            <select
                value={value}
                onChange={onChange}
                className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm
                outline-none focus:ring-2 focus:ring-blue-400
                bg-white dark:bg-gray-800"
            >
                {timezones.map(tz => (
                    <option key={tz} value={tz}>
                        {tz} ({getOffset(tz)})
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TimezoneSelect;
