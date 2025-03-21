
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2 } from "lucide-react";
import { AirQualityData } from "@/utils/types";

interface AirQualityMapProps {
  airQualityData: AirQualityData | null;
  isLoading: boolean;
}

const AirQualityMap: React.FC<AirQualityMapProps> = ({ airQualityData, isLoading }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // In a real implementation, this would initialize a map library like Google Maps or Mapbox
    // For this demo, we'll just show a placeholder
    
    const initMap = async () => {
      // Simulating map loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMapLoaded(true);
    };
    
    initMap();

    return () => {
      // Cleanup map instance if needed
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && airQualityData) {
      // In a real implementation, this would update the map with the new coordinates
      console.log("Map should update to:", airQualityData.location.coordinates);
    }
  }, [mapLoaded, airQualityData]);

  return (
    <Card className="glass-card map-container animate-fade-in">
      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">
          {airQualityData 
            ? `Air Quality Map: ${airQualityData.location.name}`
            : "Air Quality Map"
          }
        </CardTitle>
        {airQualityData && (
          <Badge variant="outline" className="bg-transparent">
            <MapPin className="h-3 w-3 mr-1" />
            {airQualityData.location.coordinates.latitude.toFixed(4)}, {airQualityData.location.coordinates.longitude.toFixed(4)}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-1 flex justify-center items-center">
        <div 
          ref={mapRef} 
          className="w-full h-full min-h-[360px] rounded-lg overflow-hidden relative bg-card-bg"
        >
          {isLoading || !mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
              <span className="ml-2 text-primary/60">Loading map...</span>
            </div>
          ) : airQualityData ? (
            <>
              {/* Placeholder map UI for demonstration */}
              <div className="absolute inset-0 bg-dashboard-bg overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full" style={{
                    backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\" fill=\"%23adbfd8\" fill-opacity=\"0.1\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')",
                    backgroundSize: "100px 100px"
                  }}></div>
                </div>
                
                {/* Grid lines */}
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={`grid-line-v-${i}`} className="border-r border-white/5 h-full"></div>
                  ))}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={`grid-line-h-${i}`} className="border-b border-white/5 w-full"></div>
                  ))}
                </div>
                
                {/* Map Pin */}
                <div className="absolute" style={{ 
                  top: "50%", 
                  left: "50%", 
                  transform: "translate(-50%, -50%)" 
                }}>
                  <div className="relative animate-bounce">
                    <div className="absolute -top-6 -left-24 w-48 text-center">
                      <div className="glass-card p-2 text-xs">
                        <p className="font-medium">{airQualityData.location.name}</p>
                        <p>AQI: <span className={`font-bold metric-category-${airQualityData.aqi.category}`}>
                          {airQualityData.aqi.value}
                        </span></p>
                      </div>
                    </div>
                    <MapPin className="h-10 w-10 text-primary drop-shadow-glow" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary/20 rounded-full animate-pulse-slow"></div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">No location data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AirQualityMap;
