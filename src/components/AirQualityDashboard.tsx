import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "./Header";
import MetricCard from "./MetricCard";
import AirQualityMap from "./AirQualityMap";
import AirQualityChart from "./AirQualityChart";
import LocationSelector from "./LocationSelector";
import { AirQualityData, METRICS_INFO } from "@/utils/types";
import { 
  fetchAirQualityData, 
  fetchAirQualityDataByCity, 
  getUserCurrentLocation,
  getHistoricalDataForMetric
} from "@/utils/api";

const AirQualityDashboard: React.FC = () => {
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<Record<string, any[]>>({});

  const loadDataForLocation = async (location: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchAirQualityDataByCity(location);
      setAirQualityData(data);
      loadHistoricalData();
      toast.success(`Loaded air quality data for ${location}`);
    } catch (err) {
      console.error("Error fetching data by city:", err);
      setError("Failed to load air quality data for this location");
      toast.error("Failed to load air quality data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDataForCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const coordinates = await getUserCurrentLocation();
      const data = await fetchAirQualityData(coordinates);
      setAirQualityData(data);
      loadHistoricalData();
      toast.success("Loaded air quality data for your location");
    } catch (err) {
      console.error("Error fetching data for current location:", err);
      setError("Failed to load air quality data for your location");
      toast.error("Failed to access your location");
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoricalData = () => {
    const data: Record<string, any[]> = {};
    
    METRICS_INFO.forEach(metric => {
      data[metric.key] = getHistoricalDataForMetric(metric.key);
    });
    
    setHistoricalData(data);
  };

  const handleRefresh = () => {
    if (airQualityData) {
      if (airQualityData.location.name === "Current Location") {
        loadDataForCurrentLocation();
      } else {
        loadDataForLocation(airQualityData.location.name);
      }
    }
  };

  return (
    <div className="min-h-screen w-full py-6 px-4 md:px-6 animate-gradient-shift">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header 
          airQualityData={airQualityData} 
          isLoading={isLoading} 
          onRefresh={handleRefresh} 
        />
        
        <div className="dashboard-grid">
          <LocationSelector 
            onLocationSelected={loadDataForLocation} 
            onDetectLocation={loadDataForCurrentLocation}
            isLoading={isLoading}
          />
          
          <AirQualityMap 
            airQualityData={airQualityData} 
            isLoading={isLoading} 
          />
          
          {airQualityData && (
            <>
              <AirQualityChart 
                title="PM2.5 Concentration" 
                data={historicalData.pm25 || []} 
                color="pm25" 
                unit="µg/m³" 
              />
              
              <AirQualityChart 
                title="NO2 Concentration" 
                data={historicalData.no2 || []} 
                color="no2" 
                unit="ppb" 
              />
              
              {METRICS_INFO.map((metricInfo) => (
                <MetricCard
                  key={metricInfo.key}
                  metricInfo={metricInfo}
                  value={airQualityData.metrics[metricInfo.key]}
                  historical={historicalData[metricInfo.key]}
                />
              ))}
            </>
          )}
          
          {error && (
            <div className="col-span-full glass-card p-6 text-center text-red-400">
              <p>{error}</p>
              <Button 
                onClick={loadDataForCurrentLocation} 
                variant="outline" 
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}
          
          {!airQualityData && !error && !isLoading && (
            <div className="col-span-full glass-card p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Select a location or use your current position to view air quality data
              </p>
              <Button 
                onClick={loadDataForCurrentLocation} 
                variant="default" 
                className="bg-primary"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Use My Location
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AirQualityDashboard;
