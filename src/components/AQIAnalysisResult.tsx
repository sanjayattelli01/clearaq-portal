
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Activity, Check, Award, Database, BarChart as BarChartIcon } from "lucide-react";
import ModelPredictionsTable from "./ModelPredictionsTable";
import ModelPerformanceCharts from "./ModelPerformanceCharts";

interface AQIAnalysisResultProps {
  result: {
    metrics: Record<string, number>;
    apiResponse: {
      predictions: Array<{
        Model: string;
        "Predicted Efficiency Category": string;
      }>;
      metrics: Record<string, Record<string, number>>;
      recommendation: string;
    };
  };
}

const AQIAnalysisResult: React.FC<AQIAnalysisResultProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<string>("predictions");
  
  if (!result || !result.apiResponse) {
    return (
      <div className="text-center py-10">
        <Activity className="h-10 w-10 mx-auto mb-4 text-yellow-500" />
        <p className="text-blue-300">No analysis results available</p>
      </div>
    );
  }
  
  const { predictions, metrics, recommendation } = result.apiResponse;
  
  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="glass-card overflow-hidden animate-fade-in border-white/10">
        <CardHeader className="p-4 bg-white/5">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            AQI Analysis Results
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full rounded-none flex bg-black/20">
              <TabsTrigger value="predictions" className="flex-1 flex items-center gap-1 rounded-none data-[state=active]:bg-blue-600/30">
                <Check className="h-4 w-4" />
                Model Predictions
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex-1 flex items-center gap-1 rounded-none data-[state=active]:bg-blue-600/30">
                <BarChartIcon className="h-4 w-4" />
                Visualizations
              </TabsTrigger>
              <TabsTrigger value="data" className="flex-1 flex items-center gap-1 rounded-none data-[state=active]:bg-blue-600/30">
                <Database className="h-4 w-4" />
                Input Data
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="predictions" className="p-4">
              <ModelPredictionsTable 
                predictions={predictions} 
                metrics={metrics} 
                recommendation={recommendation} 
              />
            </TabsContent>
            
            <TabsContent value="performance" className="p-4">
              <ModelPerformanceCharts metrics={metrics} />
            </TabsContent>
            
            <TabsContent value="data" className="p-4">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Input Data for Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(result.metrics).map(([key, value]) => (
                    <Card key={key} className="bg-black/20 backdrop-blur-sm border-white/5">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-medium text-white capitalize">
                            {key.replace('_', ' ')}
                          </h4>
                          <Badge variant="outline" className="bg-transparent text-xs">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <p className="text-sm text-blue-300">
                  These are the input values used to perform the air quality analysis and predictions.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AQIAnalysisResult;
