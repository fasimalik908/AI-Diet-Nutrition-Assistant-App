"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { foodAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodUploader } from "@/components/food/food-uploader";
import { FoodResult } from "@/components/food/food-result";
import {
  Camera, History, ChefHat, Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function FoodAnalysisPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<any>(null);

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["food-history"],
    queryFn: async () => {
      const res = await foodAPI.getHistory();
      return res.data;
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await foodAPI.analyzeImage(formData);
      return res.data;
    },
    onSuccess: (data) => {
      setCurrentResult(data);
      queryClient.invalidateQueries({ queryKey: ["food-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: "Analysis complete!", description: "Scroll down to see results." });
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: err instanceof Error ? err.message : "Could not analyze image",
      });
    },
  });

  function handleFileSelect(file: File) {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCurrentResult(null);
    analyzeMutation.mutate(file);
  }

  function handleHistoryClick(item: any) {
    setCurrentResult({ id: item.id, analysis: item.analysis_result, created_at: item.created_at });
    setPreviewUrl(null);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-on-surface flex items-center gap-3">
          <div className="p-2 bg-primary-container/20 rounded-xl">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          Food Analysis
        </h1>
        <p className="text-on-surface-variant mt-1">
          Upload a food image to get instant nutrition analysis personalized for your goals.
        </p>
      </div>

      {/* Uploader */}
      <FoodUploader
        onFileSelect={handleFileSelect}
        onClear={() => { setPreviewUrl(null); setCurrentResult(null); }}
        previewUrl={previewUrl}
        isAnalyzing={analyzeMutation.isPending}
      />

      {/* Loading state */}
      {analyzeMutation.isPending && (
        <Card className="rounded-2xl border-outline-variant/30 bg-surface-container-lowest">
          <CardContent className="pt-6 flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="font-medium text-on-surface">Analyzing your food...</p>
            <p className="text-sm text-on-surface-variant">This usually takes 5-10 seconds</p>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {currentResult && !analyzeMutation.isPending && (
        <FoodResult result={currentResult} />
      )}

      {/* History */}
      <Card className="rounded-2xl border-outline-variant/30 bg-surface-container-lowest">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-on-surface">
            <History className="h-5 w-5 text-on-surface-variant" />
            Past Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : history && history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {history.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="p-2 bg-primary-container/20 rounded-lg shrink-0">
                    <ChefHat className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-on-surface truncate">{item.detected_food || "Food"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={item.analysis_result?.is_suitable ? "success" : "warning"} className="text-xs">
                        {item.analysis_result?.total_calories || 0} kcal
                      </Badge>
                      <span className="text-xs text-on-surface-variant">{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-on-surface-variant">
              <Camera className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No analyses yet. Upload your first food image above!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}