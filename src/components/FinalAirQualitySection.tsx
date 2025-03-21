
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AirQualityData } from "@/utils/types";

interface FinalAirQualitySectionProps {
  airQualityData: AirQualityData | null;
}

const FinalAirQualitySection: React.FC<FinalAirQualitySectionProps> = ({ 
  airQualityData 
}) => {
  if (!airQualityData) return null;

  const { aqi } = airQualityData;
  const qualityColorClass = getAqiColorClass(aqi.category);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Final Air Quality Assessment</h2>
      
      <Card className={`bg-gradient-to-br ${qualityColorClass.gradient} border-none shadow-lg`}>
        <CardContent className="p-8 text-center">
          <div className="relative mx-auto w-48 h-48 mb-4">
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="white"
                strokeWidth="12"
                strokeDasharray="339.292"
                strokeDashoffset={339.292 * (1 - aqi.value / 500)}
                transform="rotate(-90 60 60)"
              />
              <text
                x="60"
                y="60"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="24"
                fontWeight="bold"
                fill="white"
              >
                {aqi.value}
              </text>
              <text
                x="60"
                y="80"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="12"
                fill="white"
              >
                AQI
              </text>
            </svg>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-white">{aqi.category.toUpperCase()}</h3>
            <p className="text-white/90">
              {aqi.description}
            </p>
            
            <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-lg">
              <p className="text-white text-sm">
                {getAqiRecommendations(aqi.category)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function getAqiColorClass(category: string) {
  switch (category) {
    case 'good':
      return {
        gradient: 'from-green-400 to-green-600',
        text: 'text-green-900'
      };
    case 'moderate':
      return {
        gradient: 'from-yellow-400 to-yellow-600',
        text: 'text-yellow-900'
      };
    case 'unhealthy':
      return {
        gradient: 'from-orange-400 to-orange-600',
        text: 'text-orange-900'
      };
    case 'very-unhealthy':
      return {
        gradient: 'from-red-400 to-red-600',
        text: 'text-red-900'
      };
    case 'hazardous':
      return {
        gradient: 'from-purple-400 to-purple-600',
        text: 'text-purple-900'
      };
    default:
      return {
        gradient: 'from-blue-400 to-blue-600',
        text: 'text-blue-900'
      };
  }
}

function getAqiRecommendations(category: string) {
  switch (category) {
    case 'good':
      return "Air quality is considered satisfactory. It's a great day to be active outside!";
    case 'moderate':
      return "Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion.";
    case 'unhealthy':
      return "Members of sensitive groups may experience health effects. The general public is not likely to be affected.";
    case 'very-unhealthy':
      return "Health alert: everyone may experience more serious health effects. Avoid prolonged outdoor activities.";
    case 'hazardous':
      return "Health warnings of emergency conditions. The entire population is more likely to be affected. Stay indoors and keep activity levels low.";
    default:
      return "No air quality information available.";
  }
}

export default FinalAirQualitySection;
