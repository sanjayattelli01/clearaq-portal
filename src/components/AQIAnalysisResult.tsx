
import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import ModelPredictionsTable from "./ModelPredictionsTable";
import ModelPerformanceCharts from "./ModelPerformanceCharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

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
        "ROC-AUC"?: number;
        "R²"?: number;
        "MAE"?: number;
        "MSE"?: number;
        "RMSE"?: number;
        "Log Loss"?: number;
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
  const [showCharts, setShowCharts] = React.useState(true);

  // Get the best model based on accuracy
  const bestModel = Object.entries(metrics).reduce(
    (best, [model, modelMetrics]) => {
      if (!best.model || modelMetrics.Accuracy > best.accuracy) {
        return { model, accuracy: modelMetrics.Accuracy };
      }
      return best;
    },
    { model: "", accuracy: 0 }
  );

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

        {bestModel.model && (
          <Alert className="bg-green-500/10 border-green-500/30 mb-6">
            <InfoIcon className="h-4 w-4 text-green-400" />
            <AlertTitle className="text-white flex items-center gap-2">
              Best Model 
              <Badge className="bg-green-600 text-white">
                {bestModel.model}
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-green-300">
              This model achieved the highest accuracy of {(bestModel.accuracy * 100).toFixed(2)}% and is recommended for future air quality predictions.
            </AlertDescription>
          </Alert>
        )}
        
        <Separator className="my-4 bg-white/10" />
        
        <ModelPredictionsTable 
          predictions={predictions} 
          metrics={metrics}
          recommendation={final_recommendation}
        />

        <Collapsible 
          open={showCharts} 
          onOpenChange={setShowCharts}
          className="mt-6 border border-white/10 rounded-md p-2"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-white hover:bg-white/5 rounded-md">
            <span className="font-medium flex items-center gap-2">
              <BarChart className="h-4 w-4 text-blue-400" />
              Graphical Analysis
            </span>
            {showCharts ? (
              <ChevronUp className="h-4 w-4 text-white/70" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white/70" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <ModelPerformanceCharts metrics={metrics} bestModel={bestModel.model} />
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default AQIAnalysisResult;
