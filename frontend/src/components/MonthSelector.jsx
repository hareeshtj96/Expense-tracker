
export default function MonthSelector({ value, onChange }) {
    const label = (val) => {
        if (!val) return "";
        const [y, m] = val.split("-");
        return new Date(y, parseInt(m, 10) - 1).toLocaleString(undefined, {
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 hidden sm:block">Month</div>

            <input aria-label="Select month" type="month" value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="text-sm text-gray-500">{label(value)}</div>
        </div>
    )
}