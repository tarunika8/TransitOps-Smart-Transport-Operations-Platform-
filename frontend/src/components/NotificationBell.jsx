import { Bell } from 'lucide-react';

export default function NotificationBell({ count = 0 }) {
  return (
    <button className="relative btn-ghost p-2 rounded-md">
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-semibold text-white grid place-items-center ring-2 ring-white">
          {count}
        </span>
      )}
    </button>
  );
}
