"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recipeAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeUploader } from "@/components/recipe/recipe-uploader";
import { RecipeResults } from "@/components/recipe/recipe-results";
import {
  ChefHat, History, Loader2, Sparkles, MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default function RecipeGeneratorPage() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentResult, setCurrentResult] = useState<any>(null);

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["recipe-history"],
    queryFn: async () => {
      const res = await recipeAPI.getHistory();
      return res.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const res = await recipeAPI.generate(formData);
      return res.data;
    },
    onSuccess: (data) => {
      setCurrentResult(data);
      queryClient.invalidateQueries({ queryKey: ["recipe-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: "Recipes generated!", description: "Scroll down to see your personalized recipes." });
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Could not generate recipes",
      });
    },
  });

  function handleFilesSelected(files: File[]) {
    setCurrentResult(null);
    generateMutation.mutate(files);
  }

  function handleHistoryClick(item: any) {
    setCurrentResult({
      id: item.id,
      output: item.final_output,
      created_at: item.created_at,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-on-surface flex items-center gap-3">
          <div className="p-2 bg-tertiary-container/20 rounded-xl">
            <ChefHat className="h-6 w-6 text-tertiary" />
          </div>
          Recipe Generator
        </h1>
        <p className="text-on-surface-variant mt-1">
          Upload images of your ingredients. AI will identify them and generate 3 personalized recipes.
        </p>
      </div>

      {/* Uploader */}
      <RecipeUploader
        onFilesSelected={handleFilesSelected}
        isGenerating={generateMutation.isPending}
      />

      {/* Loading */}
      {generateMutation.isPending && (
        <Card className="rounded-2xl border-outline-variant/30 bg-surface-container-lowest">
          <CardContent className="pt-6 flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-10 w-10 text-tertiary animate-spin" />
            <p className="font-medium text-lg text-on-surface">Cooking up your recipes...</p>
            <p className="text-sm text-on-surface-variant">Detecting ingredients and crafting personalized options</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-on-surface-variant">
              <Sparkles className="h-3 w-3" />
              <span>This may take 10-20 seconds</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {currentResult && !generateMutation.isPending && (
        <>
          <RecipeResults result={currentResult} />
          <button
            onClick={() => {
              const recipeName = currentResult?.output?.best_match?.recipe?.name || "this recipe";
              const ingredients = currentResult?.output?.detected_ingredients?.join(", ") || "";
              const openers = [
                `${recipeName}, made with ${ingredients}.`,
                `I'm making ${recipeName} — using ${ingredients}.`,
                `Found a recipe: ${recipeName} (${ingredients}).`,
                `Got a recipe idea: ${recipeName} with ${ingredients}.`,
              ];
              const opener = openers[Math.floor(Math.random() * openers.length)];
              const msg = encodeURIComponent(`${opener} Can you give me nutrition tips or suggest healthier variations?`);
              router.push(`/chat?q=${msg}`);
            }}
            className="w-full py-3 bg-primary hover:bg-secondary text-on-primary font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4" /> Ask Coach about this Recipe
          </button>
        </>
      )}

      {/* History */}
      <Card className="rounded-2xl border-outline-variant/30 bg-surface-container-lowest">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-on-surface">
            <History className="h-5 w-5 text-on-surface-variant" />
            Past Generations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : history && history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {history.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="flex items-start gap-3 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest hover:border-tertiary/50 hover:bg-tertiary-container/10 transition-all text-left"
                >
                  <div className="p-2 bg-tertiary-container/20 rounded-lg shrink-0">
                    <ChefHat className="h-4 w-4 text-tertiary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-on-surface truncate">
                      {item.final_output?.best_match?.recipe?.name || "Recipes"}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {item.detected_ingredients?.slice(0, 3).map((ing: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{ing}</Badge>
                      ))}
                      {item.detected_ingredients?.length > 3 && (
                        <span className="text-xs text-on-surface-variant">+{item.detected_ingredients.length - 3} more</span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">{formatDate(item.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-on-surface-variant">
              <ChefHat className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No recipes yet. Upload ingredient images above!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}