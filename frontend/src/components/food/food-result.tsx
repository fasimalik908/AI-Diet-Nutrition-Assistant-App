"use client";

import { useRouter } from "next/navigation";
import { Sparkles, MessageCircle } from "lucide-react";

interface FoodResultProps {
  result: {
    id: string;
    analysis: {
      detected_foods: Array<{ name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; portion: string }>;
      total_calories: number;
      total_protein: number;
      total_carbs: number;
      total_fat: number;
      goal_assessment: string;
      is_suitable: boolean;
      explanation: string;
      alternatives: string[];
      recommendations: string;
    };
  };
}

function CircularScore({ score }: { score: number }) {
  const size = 64; const sw = 6;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ;
  return (
    <div className="relative w-16 h-16">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e6eeff" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#006c49" strokeWidth={sw}
          strokeDasharray={`${progress} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
    </div>
  );
}

export function FoodResult({ result }: FoodResultProps) {
  const { analysis } = result;
  const router = useRouter();
  const healthScore = analysis.is_suitable ? 85 : 45;
  const foods = analysis.detected_foods || [];

  function askCoach() {
    const foodList = foods.map(f => f.name).join(", ");
    const openers = [
      `${foodList} — ${analysis.total_calories} kcal.`,
      `Just had: ${foodList} (${analysis.total_calories} kcal).`,
      `Here's what I ate: ${foodList}, around ${analysis.total_calories} kcal.`,
      `Logged ${foodList} — came out to ${analysis.total_calories} kcal.`,
    ];
    const opener = openers[Math.floor(Math.random() * openers.length)];
    const msg = encodeURIComponent(`${opener} ${analysis.goal_assessment}`);
    router.push(`/chat?q=${msg}`);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Health Score */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Health Score</p>
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-on-surface">{healthScore}</span>
              <span className="text-lg text-on-surface-variant mb-1">/100</span>
            </div>
            <p className="text-sm font-medium text-primary">{analysis.is_suitable ? "Great Choice!" : "Be Mindful"}</p>
          </div>
          <CircularScore score={healthScore} />
        </div>
      </div>

      {/* Visual Breakdown */}
      {foods.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-on-surface">Visual Breakdown</p>
            <span className="text-xs text-on-surface-variant">{foods.length} item{foods.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {foods.slice(0, 4).map((food, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-surface-container-low">
                <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-sm shrink-0">
                  {["🥑","🍞","🥚","🌿","🥗","🍗","🥩","🍚"][i % 8]}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-on-surface truncate">{food.name}</p>
                  <p className="text-xs text-on-surface-variant">{food.calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="bg-surface-container-low rounded-xl p-2">
              <p className="text-xs text-on-surface-variant">Protein</p>
              <p className="text-sm font-bold text-primary">{analysis.total_protein}g</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-2">
              <p className="text-xs text-on-surface-variant">Carbs</p>
              <p className="text-sm font-bold text-tertiary">{analysis.total_carbs}g</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-2">
              <p className="text-xs text-on-surface-variant">Fats</p>
              <p className="text-sm font-bold text-secondary">{analysis.total_fat}g</p>
            </div>
          </div>
        </div>
      )}

      {/* Coach's Tip */}
      {analysis.recommendations && (
        <div className="bg-primary rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-on-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4 text-on-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary-container mb-1">COACH&apos;S TIP</p>
              <p className="text-sm text-on-primary leading-relaxed">
                {analysis.recommendations}{" "}
                {analysis.alternatives?.length > 0 && (
                  <span className="text-secondary-container font-medium">{analysis.alternatives[0]}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Button */}
      <button onClick={askCoach}
        className="w-full py-3 bg-primary hover:bg-secondary text-on-primary font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
        <MessageCircle className="h-4 w-4" /> Ask Coach about this
      </button>

      <p className="text-xs text-center text-on-surface-variant italic">
        AI GENERATED HEALTH INSIGHTS. NOT MEDICAL ADVICE.
      </p>
    </div>
  );
}
