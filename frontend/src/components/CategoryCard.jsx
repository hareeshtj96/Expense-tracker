import ProgressBar from "./ProgressBar";

export default function CategoryCard({
  category,
  spent = 0,
  budget = 0,
  onOpen,
}) {
  const remaining = (budget || 0) - (spent || 0);
  const percent = budget ? Math.min(100, (spent / budget) * 100) : 0;
  const over = budget ? remaining < 0 : false;

  const format = (n) => {
    return (n ?? 0).toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{ background: category?.color || "#60a5fa" }}
            aria-hidden
          />
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              {category?.name}
            </h3>
            <p className="text-xs text-gray-500">
              Remaining:{" "}
              <span className="font-medium">{format(remaining)}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-gray-800">
            ₹{format(spent)}
          </div>
          <div className="text-xs text-gray-500">of ₹{format(budget || 0)}</div>
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar percent={percent} over={over} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        {over && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
            OVER BUDGET
          </span>
        )}
        {/* <div className="ml-auto">
          <button
            onClick={() => onOpen && onOpen(category)}
            className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Expense
          </button>
        </div> */}
      </div>
    </div>
  );
}
