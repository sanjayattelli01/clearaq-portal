
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";

type MetricType = {
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

interface ModelPerformanceChartsProps {
  metrics: Record<string, MetricType>;
  bestModel: string;
}

const ModelPerformanceCharts: React.FC<ModelPerformanceChartsProps> = ({ metrics, bestModel }) => {
  // Prepare data for line chart (performance across metrics)
  const lineChartData = Object.entries(metrics).map(([model, modelMetrics]) => ({
    model,
    Accuracy: modelMetrics.Accuracy * 100,
    Precision: modelMetrics.Precision * 100,
    Recall: modelMetrics.Recall * 100,
    "F1-Score": modelMetrics["F1-Score"] * 100
  }));

  // Prepare data for bar comparison
  const prepareBarData = (metricKey: keyof MetricType) => {
    return Object.entries(metrics).map(([model, modelMetrics]) => ({
      model,
      value: modelMetrics[metricKey] * 100,
      isHighest: model === bestModel
    }));
  };

  // Prepare accuracy data for final bar chart
  const accuracyData = prepareBarData('Accuracy');
  
  // Color variables for the charts
  const COLORS = {
    accuracy: "#4dabf5",
    precision: "#82ca9d",
    recall: "#ff8042",
    f1: "#8884d8",
    bar: "#4facfe",
    bestBar: "#19de7b"
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="line" className="w-full">
        <TabsList className="bg-white/10 text-white">
          <TabsTrigger value="line">Performance Trends</TabsTrigger>
          <TabsTrigger value="bars">Metric Comparison</TabsTrigger>
          <TabsTrigger value="best">Best Model</TabsTrigger>
        </TabsList>

        <TabsContent value="line" className="p-2">
          <Card className="p-4 bg-white/5 border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Model Performance Trends</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="model" stroke="#ccc" tick={{fill: '#ddd'}} />
                  <YAxis stroke="#ccc" tick={{fill: '#ddd'}} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#ddd' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Accuracy" stroke={COLORS.accuracy} activeDot={{ r: 8 }} strokeWidth={2} />
                  <Line type="monotone" dataKey="Precision" stroke={COLORS.precision} activeDot={{ r: 8 }} strokeWidth={2} />
                  <Line type="monotone" dataKey="Recall" stroke={COLORS.recall} activeDot={{ r: 8 }} strokeWidth={2} />
                  <Line type="monotone" dataKey="F1-Score" stroke={COLORS.f1} activeDot={{ r: 8 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bars" className="p-2">
          <Card className="p-4 bg-white/5 border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Model Comparison by Metric</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-[250px]">
                <h5 className="text-xs text-center text-white mb-2">Accuracy (%)</h5>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={prepareBarData('Accuracy')}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                    <XAxis dataKey="model" stroke="#ccc" tick={{fill: '#ddd'}} />
                    <YAxis stroke="#ccc" tick={{fill: '#ddd'}} />
                    <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
                    <Bar dataKey="value" name="Accuracy" fill={COLORS.accuracy}>
                      {prepareBarData('Accuracy').map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isHighest ? COLORS.bestBar : COLORS.accuracy} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-[250px]">
                <h5 className="text-xs text-center text-white mb-2">Precision (%)</h5>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={prepareBarData('Precision')}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                    <XAxis dataKey="model" stroke="#ccc" tick={{fill: '#ddd'}} />
                    <YAxis stroke="#ccc" tick={{fill: '#ddd'}} />
                    <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
                    <Bar dataKey="value" name="Precision" fill={COLORS.precision} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-[250px]">
                <h5 className="text-xs text-center text-white mb-2">Recall (%)</h5>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={prepareBarData('Recall')}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                    <XAxis dataKey="model" stroke="#ccc" tick={{fill: '#ddd'}} />
                    <YAxis stroke="#ccc" tick={{fill: '#ddd'}} />
                    <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
                    <Bar dataKey="value" name="Recall" fill={COLORS.recall} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-[250px]">
                <h5 className="text-xs text-center text-white mb-2">F1-Score (%)</h5>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={prepareBarData('F1-Score')}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                    <XAxis dataKey="model" stroke="#ccc" tick={{fill: '#ddd'}} />
                    <YAxis stroke="#ccc" tick={{fill: '#ddd'}} />
                    <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
                    <Bar dataKey="value" name="F1-Score" fill={COLORS.f1} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="best" className="p-2">
          <Card className="p-4 bg-white/5 border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Best Performing Model (Accuracy)</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={accuracyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="model" stroke="#ccc" tick={{fill: '#ddd'}} />
                  <YAxis stroke="#ccc" tick={{fill: '#ddd'}} label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#ddd' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
                  <Bar dataKey="value" name="Accuracy" fill={COLORS.bar}>
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isHighest ? COLORS.bestBar : COLORS.bar} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelPerformanceCharts;
