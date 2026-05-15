"use client";

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface PendingProfile {
  id: number;
  employee_id: number;
  uploaded_at: string;
  employee_name: string;
  designation: string;
  department: string;
  status: string;
}

interface QueueListProps {
  items: PendingProfile[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function QueueList({
  items,
  selectedId,
  onSelect,
}: QueueListProps) {
  return (
    <div className="border-r border-gray-200 bg-gray-50 h-full overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Review Queue</h2>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
            {items.length} pending
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {items.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No pending profiles
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full text-left p-4 hover:bg-gray-100 transition-colors ${
                selectedId === item.id
                  ? "bg-teal-50 border-l-4 border-teal-500"
                  : ""
              }`}
            >
              <p className="font-medium text-gray-900">{item.employee_name}</p>
              <p className="text-sm text-gray-600">{item.designation}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                  {item.department}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formatTimeAgo(item.uploaded_at)}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
