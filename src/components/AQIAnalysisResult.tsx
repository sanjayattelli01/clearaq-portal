
import React from "react";
import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import ModelPredictionsTable from "./ModelPredictionsTable";

interface AQIAnalysisResultProps {
  result: {
    aqiScore?: number;
    classification?: { label: string; color: string };
    metrics?: Record<string, number>;
    apiResponse?: {
      predictions: {
        Model: string;
        "Predicted Efficiency Category": string;
      }[];
      metrics: {
        [key: string]: {
          Accuracy: number;
          Precision: number;
          Recall: number;
          "F1-Score": number;
        };
      };
      final_recommendation: string;
    };
  };
}

const AQIAnalysisResult: React.FC<AQIAnalysisResultProps> = ({ result }) => {
  // Check if we have API response data
  if (!result.apiResponse) {
    return (
      <div className="text-center py-10 text-blue-300">
        No analysis results available. Please perform an analysis first.
      </div>
    );
  }

  return (
    <Card className="p-6 glass-card border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Award className="h-5 w-5 text-yellow-500" />
        <h3 className="text-xl font-semibold text-white">Model Analysis Results</h3>
      </div>
      
      <ModelPredictionsTable 
        predictions={result.apiResponse.predictions}
        metrics={result.apiResponse.metrics}
        recommendation={result.apiResponse.final_recommendation}
      />
    </Card>
  );
};

export default AQIAnalysisResult;
