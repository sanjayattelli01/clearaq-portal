
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AirQualityMetrics, MetricInfo, METRICS_INFO } from "@/utils/types";

interface QualityIndexSectionProps {
  metrics: AirQualityMetrics | null;
}

const QualityIndexSection: React.FC<QualityIndexSectionProps> = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Air Quality Index</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-600">
              Pollutant Quality Indices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {renderQualityIndices(metrics, [
                'pm25', 'pm10', 'no', 'no2', 'nox', 'so2', 'co', 'o3', 'benzene'
              ])}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-purple-600">
              Meteorological Indices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {renderQualityIndices(metrics, [
                'humidity', 'wind_speed', 'wind_direction', 'solar_radiation', 'rainfall', 'temperature'
              ])}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function renderQualityIndices(metrics: AirQualityMetrics, keys: string[]) {
  return keys.map(key => {
    // Find the metric info
    const metricInfo = METRICS_INFO.find(m => m.key === key);
    if (!metricInfo) return null;
    
    // Get the metric value
    const metric = metrics[key as keyof AirQualityMetrics];
    if (!metric) return null;
    
    // Calculate a percentage value (for display purposes)
    // This is a simplified calculation - in a real app, you would use proper thresholds
    const percentage = calculateQualityPercentage(metricInfo, metric.value);
    const qualityClass = getQualityClass(percentage);
    
    return (
      <div key={key} className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{metricInfo.label}</span>
          <span className={`text-sm font-bold ${qualityClass.textColor}`}>
            {percentage}% {qualityClass.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${qualityClass.bgColor}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  });
}

function calculateQualityPercentage(metricInfo: MetricInfo, value: number): number {
  // This is a simplified calculation - in a real app, you would use proper thresholds per pollutant
  const key = metricInfo.key;
  
  // Different scales for different parameters
  let percentage = 0;
  
  switch (key) {
    case 'pm25':
      // For PM2.5, lower is better (0-50 μg/m³ scale)
      percentage = Math.max(0, 100 - (value * 2));
      break;
    case 'pm10':
      // For PM10, lower is better (0-150 μg/m³ scale)
      percentage = Math.max(0, 100 - (value * 0.67));
      break;
    case 'o3':
      // For Ozone, lower is better (0-200 ppb scale)
      percentage = Math.max(0, 100 - (value * 0.5));
      break;
    case 'co':
      // For CO, lower is better (0-10 ppm scale)
      percentage = Math.max(0, 100 - (value * 10));
      break;
    case 'no2':
      // For NO2, lower is better (0-200 ppb scale)
      percentage = Math.max(0, 100 - (value * 0.5));
      break;
    case 'so2':
      // For SO2, lower is better (0-200 ppb scale)
      percentage = Math.max(0, 100 - (value * 0.5));
      break;
    case 'humidity':
      // For humidity, moderate values are better (40-60% is optimal)
      const humidityDiff = Math.abs(value - 50);
      percentage = Math.max(0, 100 - (humidityDiff * 2.5));
      break;
    case 'temperature':
      // For temperature, moderate values are better (15-25°C is optimal)
      const tempDiff = Math.abs(value - 20);
      percentage = Math.max(0, 100 - (tempDiff * 5));
      break;
    default:
      // For other metrics, use a simple scale where lower values are better
      percentage = Math.max(0, 100 - (value * 2));
  }
  
  return Math.round(percentage);
}

function getQualityClass(percentage: number) {
  if (percentage >= 80) {
    return {
      label: 'Excellent',
      textColor: 'text-green-600',
      bgColor: 'bg-green-500'
    };
  } else if (percentage >= 60) {
    return {
      label: 'Good',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-500'
    };
  } else if (percentage >= 40) {
    return {
      label: 'Moderate',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-500'
    };
  } else if (percentage >= 20) {
    return {
      label: 'Poor',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-500'
    };
  } else {
    return {
      label: 'Hazardous',
      textColor: 'text-red-600',
      bgColor: 'bg-red-500'
    };
  }
}

export default QualityIndexSection;
