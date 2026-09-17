"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { profileAPI } from "@/lib/api";
import { calculateBMI, getBMICategory } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gender, ActivityLevel, Goal } from "@/types";

const STEPS = ["Personal", "Body", "Lifestyle", "Review"];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", age: "", gender: "" as Gender | "",
    weight: "", height: "", activity_level: "" as ActivityLevel | "", goal: "" as Goal | "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const bmi = form.weight && form.height ? calculateBMI(parseFloat(form.weight), parseFloat(form.height)) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  function canProceed() {
    if (step === 0) return form.name && form.age && form.gender;
    if (step === 1) return form.weight && form.height;
    if (step === 2) return form.activity_level && form.goal;
    return true;
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.getSession();
      await profileAPI.create(form);
      toast({ title: "Profile saved!" });
      router.push("/dashboard");
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Error", description: err instanceof Error ? err.message : "Could not save profile" });
    } finally {
      setLoading(false);
    }
  }

  const progressPct = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-surface overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-secondary-container/20 blur-[150px] rounded-full" />
      </div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="p-1.5 bg-primary rounded-lg">
              <Leaf className="h-5 w-5 text-on-primary" />
            </div>
            <span className="font-bold text-primary text-lg">NutriVision AI</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-on-surface-variant mb-2">
            <span>Personalizing your experience</span>
            <span>Step {step + 1} of {STEPS.length}</span>
          </div>
          <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest/95 backdrop-blur-sm border border-outline-variant/50 rounded-2xl shadow-sm p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-3xl font-bold text-on-surface">Welcome.</h2>
                <p className="text-on-surface-variant text-sm mt-1">Let&apos;s get to know you a bit better to tailor your AI coaching.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-on-surface-variant">What should we call you?</Label>
                <Input placeholder="Your name" value={form.name} onChange={(e) => update("name", e.target.value)}
                  className="border-outline-variant focus:border-primary focus-visible:ring-primary-container rounded-lg h-11" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm text-on-surface-variant">Age</Label>
                  <Input type="number" placeholder="Years" value={form.age} onChange={(e) => update("age", e.target.value)}
                    className="border-outline-variant focus:border-primary rounded-lg h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-on-surface-variant">Biological Sex</Label>
                  <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                    <SelectTrigger className="border-outline-variant rounded-lg h-11">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-3xl font-bold text-on-surface">Body Stats.</h2>
                <p className="text-on-surface-variant text-sm mt-1">We use this to calculate your BMI and calorie needs.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-on-surface-variant">Weight (kg)</Label>
                <Input type="number" placeholder="e.g. 70" value={form.weight} onChange={(e) => update("weight", e.target.value)}
                  className="border-outline-variant focus:border-primary rounded-lg h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-on-surface-variant">Height (cm)</Label>
                <Input type="number" placeholder="e.g. 170" value={form.height} onChange={(e) => update("height", e.target.value)}
                  className="border-outline-variant focus:border-primary rounded-lg h-11" />
              </div>
              {bmi && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-on-surface-variant">Your BMI</p>
                      <p className="text-3xl font-bold text-primary">{bmi}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary text-on-primary text-xs font-medium rounded-full">{bmiCategory}</span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-gradient-to-r from-blue-300 via-green-400 to-red-400 relative">
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-surface-container-lowest border-2 border-on-surface shadow"
                      style={{ left: `${Math.min(Math.max(((bmi - 15) / 25) * 100, 0), 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                    <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-3xl font-bold text-on-surface">Lifestyle.</h2>
                <p className="text-on-surface-variant text-sm mt-1">This helps us personalize your recommendations.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-on-surface-variant">Activity Level</Label>
                <Select value={form.activity_level} onValueChange={(v) => update("activity_level", v)}>
                  <SelectTrigger className="border-outline-variant rounded-lg h-11">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (desk job, little exercise)</SelectItem>
                    <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-on-surface-variant">Your Goal</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "weight_loss", label: "Weight Loss", emoji: "📉" },
                    { value: "maintain", label: "Maintain", emoji: "⚖️" },
                    { value: "weight_gain", label: "Weight Gain", emoji: "📈" },
                  ].map(({ value, label, emoji }) => (
                    <button key={value} type="button" onClick={() => update("goal", value)}
                      className={cn("flex flex-col items-center p-3 rounded-xl border-2 transition-all text-xs font-medium",
                        form.goal === value ? "border-primary bg-primary/5 text-primary" : "border-outline-variant hover:border-outline")}>
                      <span className="text-2xl mb-1">{emoji}</span>{label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-3xl font-bold text-on-surface">Review.</h2>
                <p className="text-on-surface-variant text-sm mt-1">Confirm your details before we get started.</p>
              </div>
              <div className="space-y-2">
                {[
                  ["Name", form.name], ["Age", `${form.age} years`], ["Gender", form.gender],
                  ["Weight", `${form.weight} kg`], ["Height", `${form.height} cm`],
                  ["BMI", bmi ? `${bmi} (${bmiCategory})` : "-"],
                  ["Activity", form.activity_level?.replace("_", " ")],
                  ["Goal", form.goal?.replace("_", " ")],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2.5 border-b border-outline-variant/30 last:border-0">
                    <span className="text-sm text-on-surface-variant">{label}</span>
                    <span className="text-sm font-semibold capitalize text-on-surface">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 border border-outline-variant rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors">
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                className="flex-1 py-3 bg-primary-container text-on-primary-container rounded-lg text-sm font-medium hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3 bg-primary-container text-on-primary-container rounded-lg text-sm font-medium hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Get Started →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
