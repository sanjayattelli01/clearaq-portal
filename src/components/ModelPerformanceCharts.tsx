
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Scatter,
  ScatterChart,
  ZAxis
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
  [key: string]: number | undefined;
};

interface ModelPerformanceChartsProps {
  metrics: Record<string, MetricType>;
  bestModel: string;
}

const ModelPerformanceCharts: React.FC<ModelPerformanceChartsProps> = ({ metrics, bestModel }) => {
  // Extract all available metrics excluding NaN values
  const allMetricsKeys = React.useMemo(() => {
    const keys = new Set<string>();
    
    Object.values(metrics).forEach(modelMetrics => {
      Object.entries(modelMetrics).forEach(([key, value]) => {
        if (value !== undefined && !isNaN(value)) {
          keys.add(key);
        }
      });
    });
    
    // Sort metrics in a logical order
    return Array.from(keys).sort((a, b) => {
      const metricOrder = [
        'Accuracy', 'Precision', 'Recall', 'F1-Score', 
        'ROC-AUC', 'R²', 'MAE', 'MSE', 'RMSE', 'Log Loss'
      ];
      const indexA = metricOrder.indexOf(a);
      const indexB = metricOrder.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [metrics]);

  // Prepare data for line chart (performance across metrics)
  const lineChartData = React.useMemo(() => {
    return Object.entries(metrics).map(([model, modelMetrics]) => {
      const data: Record<string, any> = { model };
      
      allMetricsKeys.forEach(key => {
        if (modelMetrics[key] !== undefined) {
          // Convert to percentage for visualization consistency
          const value = modelMetrics[key] as number;
          data[key] = isPercentageMetric(key) ? value * 100 : value;
        }
      });
      
      return data;
    });
  }, [metrics, allMetricsKeys]);

  // Prepare data for bar comparison
  const prepareBarData = (metricKey: string) => {
    return Object.entries(metrics).map(([model, modelMetrics]) => {
      const value = modelMetrics[metricKey];
      return {
        model,
        value: value !== undefined ? (isPercentageMetric(metricKey) ? value * 100 : value) : 0,
        isHighest: model === bestModel
      };
    });
  };

  // Prepare heatmap data
  const heatmapData = React.useMemo(() => {
    const data: Array<{ model: string; metric: string; value: number; normalizedValue: number }> = [];
    
    // Get min/max for each metric for normalization
    const metricRanges: Record<string, { min: number; max: number }> = {};
    
    allMetricsKeys.forEach(metric => {
      let min = Infinity;
      let max = -Infinity;
      
      Object.values(metrics).forEach(modelMetric => {
        const value = modelMetric[metric];
        if (value !== undefined && !isNaN(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
      
      if (min !== Infinity && max !== -Infinity) {
        metricRanges[metric] = { min, max };
      }
    });
    
    // Create heatmap data with normalized values
    Object.entries(metrics).forEach(([model, modelMetrics]) => {
      allMetricsKeys.forEach(metric => {
        const value = modelMetrics[metric];
        
        if (value !== undefined && !isNaN(value)) {
          const range = metricRanges[metric];
          const min = range.min;
          const max = range.max;
          
          // Calculate normalized value (0-1)
          let normalizedValue;
          
          if (isLowerBetterMetric(metric)) {
            // Invert for lower-is-better metrics
            normalizedValue = max === min ? 0.5 : 1 - ((value - min) / (max - min));
          } else {
            normalizedValue = max === min ? 0.5 : (value - min) / (max - min);
          }
          
          data.push({
            model,
            metric,
            value: isPercentageMetric(metric) ? value * 100 : value,
            normalizedValue
          });
        }
      });
    });
    
    return data;
  }, [metrics, allMetricsKeys]);

  // Prepare data for radar charts
  const radarChartData = React.useMemo(() => {
    const modelData: Record<string, Array<{ metric: string; value: number; fullMark: 100 }>> = {};
    
    // Normalize all metrics to a 0-100 scale for radar chart
    Object.entries(metrics).forEach(([model, modelMetrics]) => {
      modelData[model] = [];
      
      allMetricsKeys.forEach(metric => {
        const value = modelMetrics[metric];
        
        if (value !== undefined && !isNaN(value)) {
          // Handle lower-is-better metrics by inverting them for radar chart
          let normalizedValue;
          
          if (isLowerBetterMetric(metric)) {
            // Use a reasonable max value depending on metric type
            const maxValue = getMaxValueForMetric(metric);
            normalizedValue = Math.max(0, Math.min(100, (1 - (value / maxValue)) * 100));
          } else if (isPercentageMetric(metric)) {
            normalizedValue = value * 100; // Convert to percentage
          } else {
            // For other metrics, scale to 0-100 range
            const maxValue = getMaxValueForMetric(metric);
            normalizedValue = Math.min(100, (value / maxValue) * 100);
          }
          
          modelData[model].push({
            metric,
            value: normalizedValue,
            fullMark: 100
          });
        }
      });
    });
    
    return modelData;
  }, [metrics, allMetricsKeys]);

  // Color variables for the charts
  const COLORS = {
    accuracy: "#4dabf5",
    precision: "#82ca9d",
    recall: "#ff8042",
    f1: "#8884d8",
    bar: "#4facfe",
    bestBar: "#19de7b",
    metrics: [
      "#4dabf5",   // Blue
      "#82ca9d",   // Green
      "#ff8042",   // Orange
      "#8884d8",   // Purple
      "#ffc658",   // Yellow
      "#0088FE",   // Bright Blue
      "#00C49F",   // Teal
      "#FFBB28",   // Amber
      "#FF8042",   // Coral
      "#ff6b81",   // Pink
      "#a55eea",   // Violet
      "#2ecc71",   // Emerald
      "#8395a7",   // Gray Blue
      "#fd9644",   // Orange
      "#5f27cd"    // Dark Purple
    ],
    models: [
      "#1f77b4",   // Blue
      "#ff7f0e",   // Orange
      "#2ca02c",   // Green
      "#d62728",   // Red
      "#9467bd",   // Purple
      "#8c564b",   // Brown
      "#e377c2",   // Pink
      "#7f7f7f",   // Gray
      "#bcbd22",   // Olive
      "#17becf"    // Cyan
    ],
    heatmap: [
      "#d4f7ff",   // Very Light Blue (lowest)
      "#08C6F8",   // Light Blue
      "#0961FF",   // Medium Blue
      "#0033D3",   // Dark Blue
      "#7700A6"    // Purple (highest)
    ]
  };

  // Helper functions
  function isPercentageMetric(metric: string): boolean {
    const percentageMetrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC'];
    return percentageMetrics.includes(metric);
  }

  function isLowerBetterMetric(metric: string): boolean {
    const lowerBetterMetrics = ['MSE', 'RMSE', 'MAE', 'Log Loss'];
    return lowerBetterMetrics.includes(metric);
  }

  function getMaxValueForMetric(metric: string): number {
    // Define reasonable maximum values for different metrics for normalization
    switch (metric) {
      case 'MSE':
      case 'RMSE':
        return 1.0; // Assuming errors below 1.0 are good
      case 'MAE':
        return 0.5; // Assuming MAE below 0.5 is good
      case 'Log Loss':
        return 1.0; // Assuming log loss below 1.0 is good
      case 'R²':
        return 1.0; // R² is typically between 0 and 1
      default:
        return 1.0; // Default scale
    }
  }

  function getHeatmapColor(value: number): string {
    // Value should be between 0 and 1
    const colorScale = COLORS.heatmap;
    const index = Math.min(Math.floor(value * colorScale.length), colorScale.length - 1);
    return colorScale[index];
  }

  // Get all models
  const models = Object.keys(metrics);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="line" className="w-full">
        <TabsList className="bg-white/10 text-white">
          <TabsTrigger value="line">Performance Trends</TabsTrigger>
          <TabsTrigger value="heatmap">Metrics Heatmap</TabsTrigger>
          <TabsTrigger value="radar">Radar Charts</TabsTrigger>
          <TabsTrigger value="bars">Metrics Comparison</TabsTrigger>
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
                  <YAxis stroke="#ccc" tick={{fill: '#ddd'}} label={{ value: 'Value', angle: -90, position: 'insideLeft', fill: '#ddd' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
                  <Legend />
                  {allMetricsKeys.slice(0, 5).map((metric, index) => (
                    <Line 
                      key={metric}
                      type="monotone" 
                      dataKey={metric} 
                      stroke={COLORS.metrics[index % COLORS.metrics.length]} 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="p-2">
          <Card className="p-4 bg-white/5 border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Performance Metrics Heatmap</h4>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 70, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis 
                    dataKey="metric" 
                    type="category" 
                    name="Metric" 
                    stroke="#ccc"
                    tick={{fill: '#ddd'}}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis 
                    dataKey="model" 
                    type="category" 
                    name="Model" 
                    stroke="#ccc"
                    tick={{fill: '#ddd'}}
                    width={80}
                  />
                  <ZAxis 
                    dataKey="normalizedValue" 
                    range={[0, 0]} 
                    name="Score" 
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'Score') {
                        return null; // Hide the normalized value
                      }
                      const dataPoint = heatmapData.find(
                        (point) => point.model === (value as any).model && point.metric === (value as any).metric
                      );
                      return [dataPoint?.value.toFixed(3), name];
                    }}
                    labelFormatter={(label) => `${(label as any).model} - ${(label as any).metric}`}
                  />
                  <Scatter 
                    data={heatmapData} 
                    shape={(props) => {
                      const { cx, cy, payload } = props;
                      return (
                        <rect
                          x={cx - 15}
                          y={cy - 15}
                          width={30}
                          height={30}
                          fill={getHeatmapColor(payload.normalizedValue)}
                          fillOpacity={0.8}
                        />
                      );
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center items-center mt-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {COLORS.heatmap.map((color, index) => (
                    <div 
                      key={index} 
                      className="w-6 h-4" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex text-xs text-white space-x-6">
                  <span>Lower</span>
                  <span>Performance</span>
                  <span>Higher</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="radar" className="p-2">
          <Card className="p-4 bg-white/5 border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Model Performance Radar Charts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model, modelIndex) => (
                <div key={model} className="h-[250px]">
                  <h5 className="text-xs text-center text-white mb-2">{model}</h5>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      outerRadius={90} 
                      data={radarChartData[model]}
                    >
                      <PolarGrid stroke="#555" />
                      <PolarAngleAxis 
                        dataKey="metric" 
                        tick={{ fill: '#ddd', fontSize: 10 }} 
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: '#ddd' }} 
                      />
                      <Radar 
                        name={model} 
                        dataKey="value" 
                        stroke={COLORS.models[modelIndex % COLORS.models.length]} 
                        fill={COLORS.models[modelIndex % COLORS.models.length]}
                        fillOpacity={0.6}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
            <div className="text-xs text-blue-300 mt-4 text-center">
              <p>Note: All metrics are normalized to a 0-100 scale. For metrics where lower values are better (like MSE, RMSE), 
                the values are inverted so that higher on the chart always means better performance.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bars" className="p-2">
          <Card className="p-4 bg-white/5 border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Model Comparison by Metric</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allMetricsKeys.map((metric, index) => (
                <div key={metric} className="h-[250px]">
                  <h5 className="text-xs text-center text-white mb-2">{metric} {isPercentageMetric(metric) ? '(%)' : ''}</h5>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={prepareBarData(metric)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                      <XAxis dataKey="model" stroke="#ccc" tick={{fill: '#ddd'}} />
                      <YAxis stroke="#ccc" tick={{fill: '#ddd'}} />
                      <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
                      <Bar 
                        dataKey="value" 
                        name={metric} 
                        fill={COLORS.metrics[index % COLORS.metrics.length]}
                      >
                        {prepareBarData(metric).map((entry, i) => (
                          <Cell 
                            key={`cell-${i}`} 
                            fill={entry.isHighest && metric === 'Accuracy' ? COLORS.bestBar : COLORS.metrics[index % COLORS.metrics.length]} 
                          />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="best" className="p-2">
          <Card className="p-4 bg-white/5 border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Best Performing Model (Accuracy)</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={prepareBarData('Accuracy')}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="model" stroke="#ccc" tick={{fill: '#ddd'}} />
                  <YAxis stroke="#ccc" tick={{fill: '#ddd'}} label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#ddd' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
                  <Bar dataKey="value" name="Accuracy" fill={COLORS.bar}>
                    {prepareBarData('Accuracy').map((entry, index) => (
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
