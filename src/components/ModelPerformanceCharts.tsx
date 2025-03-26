
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { X, BarChart as BarChartIcon, PieChart, Activity } from 'lucide-react';

interface ModelMetrics {
  [key: string]: {
    [key: string]: number;
  };
}

interface ModelPerformanceChartsProps {
  metrics: ModelMetrics;
}

// Define color scheme for models
const MODEL_COLORS = {
  'Random Forest': '#3b82f6', // Blue
  'KNN': '#ef4444', // Red 
  'Naive Bayes': '#10b981', // Green
  'SVM': '#a855f7', // Purple
  'Logistic Regression': '#f97316', // Orange
  'XGBoost': '#8b5cf6', // Indigo
  'Decision Tree': '#06b6d4', // Cyan
  'AdaBoost': '#f59e0b', // Amber
  'Gradient Boosting': '#ec4899', // Pink
  'Ridge': '#6366f1', // Indigo
  'Lasso': '#d946ef' // Fuchsia
};

const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#a855f7', '#f97316', 
  '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#6366f1'
];

// Categorize metrics into "higher is better" and "lower is better"
const METRIC_CATEGORIES = {
  higherBetter: [
    'Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC', 'R²', 'R² Score',
    'Balanced Accuracy', 'Cohen\'s Kappa', 'Gini Coefficient'
  ],
  lowerBetter: [
    'MAE', 'MSE', 'RMSE', 'Log Loss', 'Hinge Loss', 'Chi-Square (χ²)'
  ]
};

const METRIC_COLORS = {
  'Accuracy': '#3b82f6', // Blue
  'Precision': '#ef4444', // Red
  'Recall': '#10b981', // Green
  'F1-Score': '#a855f7', // Purple
  'ROC-AUC': '#f97316', // Orange
  'R²': '#8b5cf6', // Indigo
  'R² Score': '#8b5cf6', // Indigo (same as R²)
  'MAE': '#06b6d4', // Cyan
  'MSE': '#f59e0b', // Amber
  'RMSE': '#ec4899', // Pink
  'Log Loss': '#6366f1', // Indigo
  'Hinge Loss': '#d946ef', // Fuchsia
  'Chi-Square (χ²)': '#0891b2', // Cyan
  'Cohen\'s Kappa': '#4ade80', // Green
  'Balanced Accuracy': '#7dd3fc', // Light blue
  'Gini Coefficient': '#fbbf24' // Yellow
};

const ModelPerformanceCharts: React.FC<ModelPerformanceChartsProps> = ({ metrics }) => {
  // Extract models and metrics for selection
  const modelNames = Object.keys(metrics);
  const allMetricNames = useMemo(() => {
    const metricSet = new Set<string>();
    
    Object.values(metrics).forEach(modelMetric => {
      Object.keys(modelMetric).forEach(key => {
        metricSet.add(key);
      });
    });
    
    return Array.from(metricSet);
  }, [metrics]);
  
  const [selectedModel, setSelectedModel] = useState<string>(modelNames[0] || '');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    allMetricNames.slice(0, 4) // Default to first 4 metrics
  );
  
  // Function to prepare data for the comparison chart
  const getComparisonData = (metricKeys: string[]) => {
    return modelNames.map(model => {
      const result: Record<string, any> = { model };
      
      metricKeys.forEach(metric => {
        result[metric] = metrics[model][metric] !== undefined 
          ? metrics[model][metric] 
          : 0;
      });
      
      return result;
    });
  };
  
  // Function to prepare data for radar chart
  const getRadarData = (modelName: string) => {
    const modelData = metrics[modelName];
    if (!modelData) return [];
    
    return Object.entries(modelData).map(([metric, value]) => ({
      metric,
      value: value !== undefined ? value : 0,
      fullMark: METRIC_CATEGORIES.higherBetter.includes(metric) ? 1 : 0.5
    }));
  };
  
  // Function to prepare data for heatmap
  const getHeatmapData = () => {
    const data: Array<Record<string, any>> = [];
    
    for (const modelName of modelNames) {
      const modelData: Record<string, any> = { model: modelName };
      
      for (const metricName of allMetricNames) {
        modelData[metricName] = metrics[modelName][metricName] !== undefined 
          ? metrics[modelName][metricName] 
          : null;
      }
      
      data.push(modelData);
    }
    
    return data;
  };

  // Determine color based on metric value and category
  const getHeatmapColor = (value: number, metric: string) => {
    if (value === null || value === undefined) return '#333';
    
    const isHigherBetter = METRIC_CATEGORIES.higherBetter.includes(metric);
    
    // For "higher is better" metrics
    if (isHigherBetter) {
      if (value >= 0.95) return '#ef4444'; // Excellent - Red
      if (value >= 0.85) return '#f97316'; // Very good - Orange
      if (value >= 0.75) return '#f59e0b'; // Good - Amber
      if (value >= 0.65) return '#3b82f6'; // Fair - Blue
      return '#1e40af'; // Poor - Dark blue
    }
    // For "lower is better" metrics
    else {
      if (value <= 0.03) return '#ef4444'; // Excellent - Red 
      if (value <= 0.06) return '#f97316'; // Very good - Orange
      if (value <= 0.1) return '#f59e0b'; // Good - Amber
      if (value <= 0.15) return '#3b82f6'; // Fair - Blue
      return '#1e40af'; // Poor - Dark blue
    }
  };
  
  // Format value for display based on metric type
  const formatMetricValue = (value: number, metric: string) => {
    if (value === null || value === undefined) return 'N/A';
    
    if (['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC', 'R²', 'R² Score', 'Balanced Accuracy'].includes(metric)) {
      return (value * 100).toFixed(2) + '%';
    }
    
    return value.toFixed(3);
  };
  
  // Determine scale domain based on metric type
  const getAxisDomain = (metric: string) => {
    if (METRIC_CATEGORIES.higherBetter.includes(metric)) {
      return [0, 1];
    }
    
    if (METRIC_CATEGORIES.lowerBetter.includes(metric)) {
      return [0, 0.5]; // Adjust as needed
    }
    
    return [0, 'auto'];
  };
  
  // This will dynamically determine the colors using MODEL_COLORS if available, or fall back to DEFAULT_COLORS
  const getModelColor = (modelName: string, index: number) => {
    return MODEL_COLORS[modelName as keyof typeof MODEL_COLORS] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };
  
  const getMetricColor = (metricName: string, index: number) => {
    return METRIC_COLORS[metricName as keyof typeof METRIC_COLORS] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="comparison" className="w-full mt-4">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChartIcon className="h-4 w-4" />
            Comparison Charts
          </TabsTrigger>
          <TabsTrigger value="radar" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Radar Charts
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Metrics Heatmap
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comparison">
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl text-white">
                Comprehensive Model Performance Metrics
                <div className="flex gap-2">
                  <Select
                    value={selectedMetrics.join(',')}
                    onValueChange={(value) => setSelectedMetrics(value.split(','))}
                  >
                    <SelectTrigger className="w-44 text-xs bg-black/30 border-white/10">
                      <SelectValue placeholder="Select metrics" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10 text-white">
                      <div className="grid grid-cols-2 gap-2 p-2">
                        {allMetricNames.map((metric) => (
                          <div key={metric} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`metric-${metric}`}
                              checked={selectedMetrics.includes(metric)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMetrics([...selectedMetrics, metric]);
                                } else {
                                  setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                                }
                              }}
                              className="h-4 w-4"
                            />
                            <Label htmlFor={`metric-${metric}`} className="text-xs">{metric}</Label>
                          </div>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getComparisonData(selectedMetrics)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      dataKey="model" 
                      tick={{ fill: '#fff' }} 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis 
                      tick={{ fill: '#fff' }} 
                      domain={[0, 1]}
                      tickFormatter={(value) => (value * 100) + '%'}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                      formatter={(value: number, name: string) => {
                        if (METRIC_CATEGORIES.higherBetter.includes(name)) {
                          return [(value * 100).toFixed(2) + '%', name];
                        }
                        return [value.toFixed(4), name];
                      }}
                    />
                    <Legend wrapperStyle={{ bottom: -10 }} />
                    {selectedMetrics.map((metric, index) => (
                      <Bar 
                        key={metric} 
                        dataKey={metric} 
                        fill={getMetricColor(metric, index)} 
                        name={metric}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="radar">
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl text-white">
                <div className="flex items-center gap-2">
                  Model Performance Radar Charts
                </div>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                >
                  <SelectTrigger className="w-44 text-xs bg-black/30 border-white/10">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 border-white/10 text-white">
                    {modelNames.map((model) => (
                      <SelectItem key={model} value={model} className="text-white hover:bg-white/10">
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart 
                    outerRadius="75%" 
                    data={getRadarData(selectedModel)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <PolarGrid stroke="#444" />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ fill: '#fff', fontSize: 11 }} 
                      stroke="#fff"
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 1]} 
                      tick={{ fill: '#fff' }}
                      stroke="#444"
                      tickFormatter={(value) => value.toFixed(1)}
                    />
                    <Radar 
                      name={selectedModel} 
                      dataKey="value" 
                      stroke={getModelColor(selectedModel, modelNames.indexOf(selectedModel))} 
                      fill={getModelColor(selectedModel, modelNames.indexOf(selectedModel))} 
                      fillOpacity={0.6}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                      formatter={(value: number, name: string, entry: any) => {
                        const metricName = entry?.payload?.metric;
                        if (METRIC_CATEGORIES.higherBetter.includes(metricName)) {
                          return [(value * 100).toFixed(2) + '%', metricName];
                        }
                        return [value.toFixed(4), metricName];
                      }}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <h2 className="text-center mt-4 text-white text-xl font-bold">
                {selectedModel} Performance Metrics
              </h2>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="heatmap">
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Performance Metrics Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border-r border-b border-white/10 text-left text-white">Models</th>
                      {allMetricNames.map(metric => (
                        <th 
                          key={metric} 
                          className="p-2 border-r border-b border-white/10 text-white text-center whitespace-nowrap rotate-315 h-32"
                          style={{ minWidth: '100px' }}
                        >
                          <div className="transform rotate-315 origin-bottom-left translate-y-8 -translate-x-2">
                            {metric}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modelNames.map((model, idx) => (
                      <tr key={model} className={idx % 2 === 0 ? 'bg-black/20' : ''}>
                        <td className="p-2 border-r border-b border-white/10 text-left text-white font-medium">
                          {model}
                        </td>
                        {allMetricNames.map(metric => {
                          const value = metrics[model][metric];
                          const bgColor = getHeatmapColor(value, metric);
                          
                          return (
                            <td 
                              key={`${model}-${metric}`} 
                              className="p-2 border-r border-b border-white/10 text-center"
                              style={{ 
                                backgroundColor: bgColor,
                                color: '#fff',
                                fontWeight: 'bold'
                              }}
                            >
                              {formatMetricValue(value, metric)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-center">
                <div className="flex flex-wrap gap-2 justify-center">
                  <div className="text-white text-xs">Better</div>
                  {['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#1e40af'].map((color, i) => (
                    <div 
                      key={i} 
                      className="w-10 h-4" 
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                  <div className="text-white text-xs">Worse</div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-400 text-center">
                <p>Higher values are better for: Accuracy, Precision, Recall, F1-Score, ROC-AUC, R²</p>
                <p>Lower values are better for: MAE, MSE, RMSE, Log Loss</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelPerformanceCharts;
