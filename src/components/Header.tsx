
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings, Info, Sun, CloudRain, CloudFog, AlertTriangle, AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AirQualityData } from "@/utils/types";

interface HeaderProps {
  airQualityData: AirQualityData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const Header: React.FC<HeaderProps> = ({ airQualityData, isLoading, onRefresh }) => {
  const getAirQualityIcon = () => {
    if (!airQualityData) return null;
    
    const category = airQualityData.aqi.category;
    
    switch(category) {
      case "good":
        return <Sun className="h-8 w-8 text-air-green animate-pulse-slow" />;
      case "moderate":
        return <Sun className="h-8 w-8 text-air-yellow animate-pulse-slow" />;
      case "unhealthy":
        return <CloudRain className="h-8 w-8 text-air-orange animate-pulse-slow" />;
      case "very-unhealthy":
        return <CloudFog className="h-8 w-8 text-air-red animate-pulse-slow" />;
      case "hazardous":
        return <AlertOctagon className="h-8 w-8 text-air-purple animate-pulse-slow" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-muted-foreground animate-pulse-slow" />;
    }
  };
  
  return (
    <Card className="glass-card animate-fade-in shadow-lg sticky top-0 z-10">
      <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Air Quality Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {airQualityData ? (
              <>
                Data for <span className="font-medium">{airQualityData.location.name}</span>
                <span className="text-xs ml-2 opacity-70">
                  Last updated: {new Date(airQualityData.timestamp).toLocaleTimeString()}
                </span>
              </>
            ) : (
              "Select a location to view air quality data"
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-end md:self-auto">
          {airQualityData && (
            <div className="flex items-center mr-4 animate-fade-in">
              {getAirQualityIcon()}
              <div className="flex flex-col items-end ml-2">
                <span className="text-xs uppercase text-muted-foreground">Air Quality Index</span>
                <span className={`text-xl font-bold metric-category-${airQualityData.aqi.category}`}>
                  {airQualityData.aqi.value}
                </span>
              </div>
              <Badge 
                className={`ml-3 text-white bg-air-${airQualityData.aqi.category === "good" ? "green" : 
                  airQualityData.aqi.category === "moderate" ? "yellow" : 
                  airQualityData.aqi.category === "unhealthy" ? "orange" : 
                  airQualityData.aqi.category === "very-unhealthy" ? "red" : "purple"}`}
              >
                {airQualityData.aqi.description}
              </Badge>
            </div>
          )}
          
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Header;
