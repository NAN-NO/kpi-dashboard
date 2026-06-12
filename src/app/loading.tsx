import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-t-2 border-indigo-600 animate-spin w-16 h-16 mx-auto"></div>
        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full w-16 h-16 flex items-center justify-center animate-pulse">
          <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      <p className="mt-4 text-indigo-800 dark:text-indigo-200 font-semibold animate-pulse tracking-wide">
        กำลังโหลดข้อมูลภาพรวม...
      </p>
    </div>
  );
}
