
import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import ModelPredictionsTable from "./ModelPredictionsTable";

interface AQIAnalysisResultProps {
  result: {
    metrics: Record<string, number>;
    apiResponse: {
      predictions: Array<{
        Model: string;
        "Predicted Efficiency Category": string;
      }>;
      metrics: Record<string, {
        Accuracy: number;
        Precision: number;
        Recall: number;
        "F1-Score": number;
      }>;
      final_recommendation: string;
    };
  };
}

const AQIAnalysisResult: React.FC<AQIAnalysisResultProps> = ({ result }) => {
  if (!result || !result.apiResponse) {
    return <div>No analysis data available</div>;
  }

  const { predictions, metrics, final_recommendation } = result.apiResponse;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-4 bg-white/5 border-white/10">
        <h3 className="text-lg font-medium text-white mb-4">Machine Learning Analysis Results</h3>
        
        <Alert className="bg-blue-500/10 border-blue-500/30 mb-6">
          <InfoIcon className="h-4 w-4 text-blue-400" />
          <AlertTitle className="text-white">Analysis Complete</AlertTitle>
          <AlertDescription className="text-blue-300">
            Multiple machine learning models have analyzed your air quality data to determine efficiency categories and provide recommendations.
          </AlertDescription>
        </Alert>
        
        <Separator className="my-4 bg-white/10" />
        
        <ModelPredictionsTable 
          predictions={predictions} 
          metrics={metrics}
          recommendation={final_recommendation}
        />
      </Card>
    </div>
  );
};

export default AQIAnalysisResult;
