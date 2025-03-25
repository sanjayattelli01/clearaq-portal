
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Award, BarChart, Check, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModelPrediction {
  Model: string;
  "Predicted Efficiency Category": string;
}

interface ModelMetrics {
  [key: string]: {
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
  };
}

interface ModelPredictionsTableProps {
  predictions: ModelPrediction[];
  metrics: ModelMetrics;
  recommendation: string;
}

const ModelPredictionsTable: React.FC<ModelPredictionsTableProps> = ({ 
  predictions, 
  metrics, 
  recommendation 
}) => {
  if (!predictions || predictions.length === 0) {
    return <div className="text-center py-10 text-blue-300">No predictions available</div>;
  }

  // Find best model based on accuracy
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
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="h-4 w-4 text-blue-400" />
          <h3 className="text-lg font-medium text-white">Model Predictions</h3>
        </div>
        
        <div className="rounded-md border border-white/10 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5">
                <TableHead className="text-white">Model</TableHead>
                <TableHead className="text-white">Predicted Efficiency Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((prediction, index) => (
                <TableRow key={index} className="hover:bg-white/5">
                  <TableCell className="font-medium text-blue-300 flex items-center gap-2">
                    {prediction.Model === bestModel.model && (
                      <Badge variant="outline" className="bg-green-900/30 border-green-500/30 text-green-400">
                        <Check className="h-3 w-3 mr-1" /> Best
                      </Badge>
                    )}
                    {prediction.Model}
                  </TableCell>
                  <TableCell>
                    <span className={getPredictionColor(prediction["Predicted Efficiency Category"])}>
                      {prediction["Predicted Efficiency Category"]}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          <h3 className="text-lg font-medium text-white">Model Performance Metrics</h3>
        </div>
        
        <div className="rounded-md border border-white/10 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5">
                <TableHead className="text-white">Model</TableHead>
                <TableHead className="text-white">Accuracy</TableHead>
                <TableHead className="text-white">Precision</TableHead>
                <TableHead className="text-white">Recall</TableHead>
                <TableHead className="text-white">F1-Score</TableHead>
                {Object.values(metrics)[0]["ROC-AUC"] !== undefined && (
                  <TableHead className="text-white">ROC-AUC</TableHead>
                )}
                {Object.values(metrics)[0]["R²"] !== undefined && (
                  <TableHead className="text-white">R²</TableHead>
                )}
                {Object.values(metrics)[0]["MAE"] !== undefined && (
                  <TableHead className="text-white">MAE</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(metrics).map(([model, modelMetrics], index) => (
                <TableRow key={index} className={`hover:bg-white/5 ${model === bestModel.model ? 'bg-green-900/20' : ''}`}>
                  <TableCell className="font-medium text-blue-300 flex items-center gap-2">
                    {model === bestModel.model && (
                      <Badge variant="outline" className="bg-green-900/30 border-green-500/30 text-green-400">
                        <Check className="h-3 w-3 mr-1" /> Best
                      </Badge>
                    )}
                    {model}
                  </TableCell>
                  <TableCell className={model === bestModel.model ? 'text-green-400 font-medium' : ''}>
                    {(modelMetrics.Accuracy * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    {(modelMetrics.Precision * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    {(modelMetrics.Recall * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    {(modelMetrics["F1-Score"] * 100).toFixed(2)}%
                  </TableCell>
                  {modelMetrics["ROC-AUC"] !== undefined && (
                    <TableCell>
                      {(modelMetrics["ROC-AUC"] * 100).toFixed(2)}%
                    </TableCell>
                  )}
                  {modelMetrics["R²"] !== undefined && (
                    <TableCell>
                      {modelMetrics["R²"].toFixed(3)}
                    </TableCell>
                  )}
                  {modelMetrics["MAE"] !== undefined && (
                    <TableCell>
                      {modelMetrics["MAE"].toFixed(3)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="p-4 border border-white/10 rounded-md bg-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-medium text-white">Final Recommendation</h3>
        </div>
        
        <div className="bg-black/20 p-3 rounded-md border border-white/5">
          <p className="text-blue-300 whitespace-pre-line">{recommendation}</p>
          {bestModel.model && (
            <div className="mt-3 p-2 bg-green-900/30 border border-green-500/30 rounded-md">
              <p className="text-green-400 font-medium">
                ✅ The best-performing model is '{bestModel.model}' with an accuracy of {(bestModel.accuracy * 100).toFixed(2)}%.
              </p>
              <p className="text-green-300 text-sm mt-1">
                This model provides the most accurate air quality prediction and should be used for future analyses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to color code prediction categories
const getPredictionColor = (category: string): string => {
  if (category.toLowerCase().includes('high')) {
    return 'text-green-500';
  } else if (category.toLowerCase().includes('medium')) {
    return 'text-yellow-500';
  } else if (category.toLowerCase().includes('low')) {
    return 'text-red-500';
  }
  return 'text-blue-300';
};

export default ModelPredictionsTable;
