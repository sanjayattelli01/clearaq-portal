
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, CloudRain, CloudFog, AlertTriangle, AlertOctagon } from "lucide-react";
import { AirQualityData } from "@/utils/types";

interface FinalAirQualityProps {
  airQualityData: AirQualityData;
}

const FinalAirQuality: React.FC<FinalAirQualityProps> = ({ airQualityData }) => {
  const [animateIcon, setAnimateIcon] = useState(false);
  
  useEffect(() => {
    // Start animation when component mounts
    setAnimateIcon(true);
    
    // Set up a timer to refresh animation periodically
    const intervalId = setInterval(() => {
      setAnimateIcon(false);
      // Re-enable animation after a brief delay
      setTimeout(() => setAnimateIcon(true), 100);
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const getRecommendation = (category?: string) => {
    switch(category) {
      case "good": 
        return "Air quality is satisfactory, and air pollution poses little or no risk.";
      case "moderate": 
        return "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.";
      case "unhealthy": 
        return "Members of sensitive groups may experience health effects. The general public is less likely to be affected.";
      case "very-unhealthy": 
        return "Health alert: The risk of health effects is increased for everyone. Reduce outdoor activities, especially if you experience symptoms.";
      case "hazardous": 
        return "Health warning of emergency conditions: everyone is more likely to be affected. Avoid all outdoor activities.";
      default:
        return "No specific recommendation available based on current data.";
    }
  };
  
  const getAirQualityIcon = () => {
    const category = airQualityData.aqi.category;
    
    switch(category) {
      case "good":
        return <Sun className={`h-20 w-20 text-air-green ${animateIcon ? 'animate-pulse-slow' : ''}`} />;
      case "moderate":
        return <Sun className={`h-20 w-20 text-air-yellow ${animateIcon ? 'animate-pulse-slow' : ''}`} />;
      case "unhealthy":
        return <CloudRain className={`h-20 w-20 text-air-orange ${animateIcon ? 'animate-pulse-slow' : ''}`} />;
      case "very-unhealthy":
        return <CloudFog className={`h-20 w-20 text-air-red ${animateIcon ? 'animate-pulse-slow' : ''}`} />;
      case "hazardous":
        return <AlertOctagon className={`h-20 w-20 text-air-purple ${animateIcon ? 'animate-pulse-slow' : ''}`} />;
      default:
        return <AlertTriangle className={`h-20 w-20 text-muted-foreground ${animateIcon ? 'animate-pulse-slow' : ''}`} />;
    }
  };
  
  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-md animate-fade-in">
      <CardContent className="p-8 flex flex-col items-center text-center">
        <div className="mb-6">
          {getAirQualityIcon()}
        </div>
        
        <h3 className={`text-3xl font-bold mb-2 metric-category-${airQualityData.aqi.category}`}>
          {airQualityData.aqi.description}
        </h3>
        
        <div className="text-5xl font-bold mb-6 flex items-baseline">
          <span className={`metric-category-${airQualityData.aqi.category}`}>
            {airQualityData.aqi.value}
          </span>
          <span className="text-base ml-2 text-muted-foreground">AQI</span>
        </div>
        
        <div className="w-full bg-secondary/30 rounded-full h-3 mb-6">
          <div 
            className={`bg-air-${airQualityData.aqi.category === "good" ? "green" : 
              airQualityData.aqi.category === "moderate" ? "yellow" : 
              airQualityData.aqi.category === "unhealthy" ? "orange" : 
              airQualityData.aqi.category === "very-unhealthy" ? "red" : "purple"} h-3 rounded-full transition-all duration-1000 ease-in-out`}
            style={{ width: `${(airQualityData.aqi.value / 500) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between w-full text-xs text-muted-foreground mb-6">
          <span>0</span>
          <span>100</span>
          <span>200</span>
          <span>300</span>
          <span>500</span>
        </div>
        
        <div className="text-muted-foreground text-sm max-w-2xl">
          <p className="mb-4">Location: <span className="font-medium text-foreground">{airQualityData.location.name}</span></p>
          <p className="mb-4">{getRecommendation(airQualityData.aqi.category)}</p>
          <p className="text-xs">
            Last updated: {new Date(airQualityData.timestamp).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinalAirQuality;
