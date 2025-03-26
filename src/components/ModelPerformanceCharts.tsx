
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { BarChart as BarChartIcon, PieChart, Activity, ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';

type MetricCategory = 'higherBetter' | 'lowerBetter';

interface ModelPerformanceChartsProps {
  metrics: Record<string, Record<string, number>>;
}

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

const METRIC_CATEGORIES: Record<MetricCategory, string[]> = {
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
  
  // Always use enhanced metrics
  const manipulatedMetrics = metrics;
  
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
  
  const getRadarData = (modelName: string) => {
    const modelData = metrics[modelName];
    if (!modelData) return [];
    
    return Object.entries(modelData).map(([metric, value]) => ({
      metric,
      value: value !== undefined ? value : 0,
      fullMark: METRIC_CATEGORIES.higherBetter.includes(metric) ? 1 : 0.5
    }));
  };
  
  const getFeatureEfficiencyData = () => {
    // Get the model with highest average metrics
    const bestModel = Object.entries(metrics).reduce(
      (best, [model, modelMetrics]) => {
        const avgMetric = Object.entries(modelMetrics).reduce(
          (sum, [metricName, value]) => {
            // For higher is better metrics, add directly
            // For lower is better metrics, add inverted (1-value)
            if (METRIC_CATEGORIES.higherBetter.includes(metricName)) {
              return sum + value;
            } else if (METRIC_CATEGORIES.lowerBetter.includes(metricName)) {
              return sum + (1 - value);
            }
            return sum;
          }, 0
        ) / Object.keys(modelMetrics).length;
        
        if (avgMetric > best.avgMetric) {
          return { model, avgMetric };
        }
        return best;
      }, { model: '', avgMetric: 0 }
    ).model;
    
    // Return feature efficiency categories for the best model
    return Object.entries(metrics[bestModel] || {}).map(([feature, value]) => {
      let category;
      if (METRIC_CATEGORIES.higherBetter.includes(feature)) {
        if (value >= 0.8) category = "High Efficiency";
        else if (value >= 0.6) category = "Medium Efficiency";
        else category = "Low Efficiency";
      } else {
        if (value <= 0.1) category = "High Efficiency";
        else if (value <= 0.2) category = "Medium Efficiency";
        else category = "Low Efficiency";
      }
      
      return {
        feature,
        value,
        category,
        isHigherBetter: METRIC_CATEGORIES.higherBetter.includes(feature)
      };
    });
  };
  
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

  const getHeatmapColor = (value: number, metric: string) => {
    if (value === null || value === undefined) return '#333';
    
    const isHigherBetter = METRIC_CATEGORIES.higherBetter.includes(metric);
    
    if (isHigherBetter) {
      if (value >= 0.95) return '#ef4444'; // Excellent - Red
      if (value >= 0.85) return '#f97316'; // Very good - Orange
      if (value >= 0.75) return '#f59e0b'; // Good - Amber
      if (value >= 0.65) return '#3b82f6'; // Fair - Blue
      return '#1e40af'; // Poor - Dark blue
    }
    else {
      if (value <= 0.03) return '#ef4444'; // Excellent - Red 
      if (value <= 0.06) return '#f97316'; // Very good - Orange
      if (value <= 0.1) return '#f59e0b'; // Good - Amber
      if (value <= 0.15) return '#3b82f6'; // Fair - Blue
      return '#1e40af'; // Poor - Dark blue
    }
  };
  
  const formatMetricValue = (value: number, metric: string) => {
    if (value === null || value === undefined) return 'N/A';
    
    if (['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC', 'R²', 'R² Score', 'Balanced Accuracy'].includes(metric)) {
      return (value * 100).toFixed(2) + '%';
    }
    
    return value.toFixed(3);
  };
  
  const getModelColor = (modelName: string, index: number) => {
    return MODEL_COLORS[modelName as keyof typeof MODEL_COLORS] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };
  
  const getMetricColor = (metricName: string, index: number) => {
    return METRIC_COLORS[metricName as keyof typeof METRIC_COLORS] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };
  
  const sortedMetrics = allMetricNames.sort((a, b) => {
    const metricOrder = [
      "Accuracy", "Precision", "Recall", "F1-Score", 
      "ROC-AUC", "R²", "MAE", "MSE", "RMSE", "Log Loss"
    ];
    const indexA = metricOrder.indexOf(a);
    const indexB = metricOrder.indexOf(b);
    
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
  
  const featureEfficiencyData = getFeatureEfficiencyData();
  
  return (
    <div className="space-y-8">
      {/* Comprehensive Model Performance Metrics */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-white">
            <BarChartIcon className="mr-2 h-5 w-5 text-blue-400" />
            Comprehensive Model Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getComparisonData(allMetricNames)}
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
                {allMetricNames.map((metric, index) => (
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
      
      {/* Performance Metrics Heatmap */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-white">
            <PieChart className="mr-2 h-5 w-5 text-blue-400" />
            Performance Metrics Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border-r border-b border-white/10 text-left text-white">Models</th>
                  {sortedMetrics.map(metric => (
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
                    {sortedMetrics.map(metric => {
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
      
      {/* Model Performance Trends - Comparative Line Chart */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-white">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-400" />
            Model Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="metric" 
                  type="category"
                  tick={{ fill: '#fff' }}
                  data={sortedMetrics.map(metric => ({ metric }))}
                />
                <YAxis 
                  tick={{ fill: '#fff' }} 
                  domain={[0, 1]}
                  tickFormatter={(value) => (value * 100) + '%'}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                  formatter={(value: number, name: string) => {
                    return [(value * 100).toFixed(2) + '%', name];
                  }}
                />
                <Legend />
                {modelNames.map((model, index) => (
                  <Line
                    key={model}
                    type="monotone"
                    dataKey={(entry) => {
                      const metricName = entry.metric;
                      return metrics[model][metricName] || 0;
                    }}
                    name={model}
                    stroke={getModelColor(model, index)}
                    activeDot={{ r: 8 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-blue-300">
            Comparative Model Performance Across All Metrics
          </div>
        </CardContent>
      </Card>
      
      {/* Feature Efficiency Categories */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-white">
            <Activity className="mr-2 h-5 w-5 text-blue-400" />
            Feature Efficiency Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black/20">
                  <th className="p-3 border-r border-b border-white/10 text-left text-white">Feature</th>
                  <th className="p-3 border-r border-b border-white/10 text-center text-white">Value</th>
                  <th className="p-3 border-r border-b border-white/10 text-center text-white">Scale</th>
                  <th className="p-3 border-b border-white/10 text-center text-white">Efficiency Category</th>
                </tr>
              </thead>
              <tbody>
                {featureEfficiencyData.map((item, index) => (
                  <tr key={item.feature} className={index % 2 === 0 ? 'bg-black/10' : ''}>
                    <td className="p-3 border-r border-b border-white/10 text-left text-white font-medium">
                      {item.feature}
                    </td>
                    <td className="p-3 border-r border-b border-white/10 text-center">
                      {formatMetricValue(item.value, item.feature)}
                    </td>
                    <td className="p-3 border-r border-b border-white/10 text-center">
                      {item.isHigherBetter ? (
                        <ArrowUp className="inline h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="inline h-4 w-4 text-green-500 mr-1" />
                      )}
                      {item.isHigherBetter ? 'Higher is better' : 'Lower is better'}
                    </td>
                    <td className="p-3 border-b border-white/10 text-center">
                      <span className={
                        item.category === 'High Efficiency' ? 'text-green-500 font-bold' :
                        item.category === 'Medium Efficiency' ? 'text-yellow-500 font-bold' :
                        'text-red-500 font-bold'
                      }>
                        {item.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Individual Model Radar Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modelNames.map((model, index) => (
          <Card key={model} className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                {model} Performance Radar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart 
                    outerRadius="75%" 
                    data={getRadarData(model)}
                    margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
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
                      name={model} 
                      dataKey="value" 
                      stroke={getModelColor(model, index)} 
                      fill={getModelColor(model, index)} 
                      fillOpacity={0.6}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                      formatter={(value: number, name: string, entry: any) => {
                        const metricName = entry?.payload?.metric;
                        if (metricName && METRIC_CATEGORIES.higherBetter.includes(metricName)) {
                          return [(value * 100).toFixed(2) + '%', metricName];
                        }
                        return [value.toFixed(4), metricName || ''];
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModelPerformanceCharts;
