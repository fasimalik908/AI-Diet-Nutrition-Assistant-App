"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dashboardAPI, foodAPI } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, MessageCircle, User, ChefHat, PlusCircle } from "lucide-react";
import { formatGoal, formatDate } from "@/lib/utils";

function CircularProgress({ value, max, size = 140, strokeWidth = 12 }: {
  value: number; max: number; size?: number; strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((value / max) * circumference, circumference);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e6eeff" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#006c49" strokeWidth={strokeWidth}
        strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  );
}

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-on-surface-variant font-medium">{label}</span>
        <span className="text-on-surface-variant/60">{Math.round(value)}g / {goal}g</span>
      </div>
      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => { const res = await dashboardAPI.getStats(); return res.data; },
  });

  const { data: foodHistory } = useQuery({
    queryKey: ["food-history"],
    queryFn: async () => { const res = await foodAPI.getHistory(); return res.data; },
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-52" /><Skeleton className="h-52" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48" /><Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const { profile, recent_chats } = data;
  const calorieGoal = profile.goal === "weight_loss" ? 1800 : profile.goal === "weight_gain" ? 2800 : 2200;
  const proteinGoal = Math.round(profile.weight * 1.6);
  const carbsGoal = Math.round(calorieGoal * 0.45 / 4);
  const fatGoal = Math.round(calorieGoal * 0.3 / 9);

  const today = new Date().toDateString();
  const todayLogs = (foodHistory || []).filter((i: any) => new Date(i.created_at).toDateString() === today);
  const todayCalories = todayLogs.reduce((s: number, i: any) => s + (i.analysis_result?.total_calories || 0), 0);
  const todayProtein = todayLogs.reduce((s: number, i: any) => s + (i.analysis_result?.total_protein || 0), 0);
  const todayCarbs = todayLogs.reduce((s: number, i: any) => s + (i.analysis_result?.total_carbs || 0), 0);
  const todayFat = todayLogs.reduce((s: number, i: any) => s + (i.analysis_result?.total_fat || 0), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-on-surface tracking-tight">
          Good morning, {profile.name}! 🌞
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm">You&apos;re on track to hit your nutrition goals today.</p>
      </div>

      {/* Daily Calories ring card */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30">
        <div className="flex flex-col items-center">
          <div className="relative">
            <CircularProgress value={todayCalories} max={calorieGoal} size={176} strokeWidth={12} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold text-on-surface">{todayCalories.toLocaleString()}</span>
              <span className="text-xs text-on-surface-variant mt-1">/ {calorieGoal.toLocaleString()} kcal</span>
            </div>
          </div>
          <div className="w-full mt-6 grid grid-cols-3 gap-4">
            <MacroBar label="Protein" value={todayProtein} goal={proteinGoal} color="#10b981" />
            <MacroBar label="Carbs" value={todayCarbs} goal={carbsGoal} color="#ff7e2d" />
            <MacroBar label="Fats" value={todayFat} goal={fatGoal} color="#1b6b51" />
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/30 w-full flex justify-between text-xs text-on-surface-variant">
            <span>{formatGoal(profile.goal)}</span>
            <span>{profile.weight} kg · {profile.height} cm · BMI {profile.bmi}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions bento grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => router.push("/food-analysis")}
          className="bg-primary-container text-on-primary-container rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm">
          <div className="w-10 h-10 bg-on-primary-container/10 rounded-full flex items-center justify-center">
            <Camera className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">Snap Meal</span>
        </button>
        <button onClick={() => router.push("/chat")}
          className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm">
          <div className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-medium text-on-surface">AI Chat</span>
        </button>
        <button onClick={() => router.push("/recipe-generator")}
          className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm">
          <div className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center">
            <ChefHat className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-medium text-on-surface">Recipes</span>
        </button>
        <button onClick={() => router.push("/food-analysis")}
          className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm">
          <div className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center">
            <PlusCircle className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-medium text-on-surface">Log Food</span>
        </button>
      </div>

      {/* Recent Logs */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-on-surface">Recent Logs</p>
          <Link href="/food-analysis" className="text-xs text-primary font-medium hover:underline">View All</Link>
        </div>
        <div className="space-y-2">
          {foodHistory && foodHistory.length > 0 ? (
            foodHistory.slice(0, 4).map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-low transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center shrink-0">
                  <Camera className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{item.detected_food || "Food"}</p>
                  <p className="text-xs text-on-surface-variant">{formatDate(item.created_at)}</p>
                </div>
                <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full shrink-0">
                  {item.analysis_result?.total_calories || 0} kcal
                </span>
              </div>
            ))
          ) : recent_chats && recent_chats.length > 0 ? (
            recent_chats.slice(0, 4).map((chat: any) => (
              <div key={chat.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-low transition-colors">
                <div className="w-10 h-10 rounded-xl bg-secondary-container/40 flex items-center justify-center shrink-0">
                  {chat.role === "user" ? <User className="h-4 w-4 text-secondary" /> : <MessageCircle className="h-4 w-4 text-secondary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{chat.message}</p>
                  <p className="text-xs text-on-surface-variant">{formatDate(chat.created_at)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-on-surface-variant">
              <Camera className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No logs yet. Snap your first meal!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
