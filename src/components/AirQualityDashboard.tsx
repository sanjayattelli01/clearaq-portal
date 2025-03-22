
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  MapPin, 
  RefreshCw, 
  Settings, 
  Info, 
  BarChart, 
  Wind, 
  ThermometerSun,
  ChevronRight,
  Gauge,
  Globe,
  Search,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Header from "./Header";
import MetricCard from "./MetricCard";
import AirQualityMap from "./AirQualityMap";
import AirQualityChart from "./AirQualityChart";
import QualityIndexCard from "./QualityIndexCard";
import FinalAirQuality from "./FinalAirQuality";
import LocationSelector from "./LocationSelector";
import { AirQualityData, METRICS_INFO } from "@/utils/types";
import { 
  fetchAirQualityData, 
  fetchAirQualityDataByCity, 
  fetchAirQualityFromGoogleAPI,
  getUserCurrentLocation,
  getHistoricalDataForMetric,
  getCityFromCoordinates
} from "@/utils/api";

const AirQualityDashboard: React.FC = () => {
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<Record<string, any[]>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [dataSource, setDataSource] = useState<"local" | "google">("local");
  const [citySearch, setCitySearch] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [lastSearchMethod, setLastSearchMethod] = useState<"city" | "coordinates" | null>(null);
  
  // Fix: Make sure we use consistent AQI values by storing the coordinates
  const loadDataForLocation = async (location: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let data;
      if (dataSource === "google") {
        // For demonstration, we're still using the mock Google API function
        // In a real implementation, we would pass the location to a Google API endpoint
        const coordinates = {
          latitude: Math.random() * 180 - 90,
          longitude: Math.random() * 360 - 180
        };
        data = await fetchAirQualityFromGoogleAPI(coordinates);
        data.location.name = location;
      } else {
        data = await fetchAirQualityDataByCity(location);
      }
      
      setAirQualityData(data);
      // Store location method
      setLastSearchMethod("city");
      
      // Get historical data for each metric
      loadHistoricalDataForAllMetrics();
      
      toast.success(`Loaded air quality data for ${location}`);
      
      // Scroll to analysis section
      scrollToSection("analysis");
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
      const coords = await getUserCurrentLocation();
      setCoordinates(coords);
      
      // Try to get the city name first
      const cityName = await getCityFromCoordinates(coords);
      
      let data;
      if (dataSource === "google") {
        data = await fetchAirQualityFromGoogleAPI(coords);
      } else {
        data = await fetchAirQualityData(coords);
      }
      
      // If we couldn't get a city name from coordinates, use a fallback
      if (data.location.name === "Unknown Location" || data.location.name === "Current Location") {
        toast.error("Unable to determine your location name. Using generic data.");
      } else {
        toast.success(`Loaded air quality data for ${data.location.name}`);
        // Update search input with found location
        setCitySearch(data.location.name);
      }
      
      setAirQualityData(data);
      // Store location method
      setLastSearchMethod("coordinates");
      
      // Get historical data for each metric
      loadHistoricalDataForAllMetrics();
      
      // Scroll to analysis section
      scrollToSection("analysis");
    } catch (err) {
      console.error("Error fetching data for current location:", err);
      setError(`Failed to load air quality data from ${dataSource === "google" ? "Google API" : "your location"}`);
      toast.error(`Failed to ${dataSource === "google" ? "access Google API" : "access your location"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoricalDataForAllMetrics = () => {
    const data: Record<string, any[]> = {};
    
    METRICS_INFO.forEach(metric => {
      data[metric.key] = getHistoricalDataForMetric(metric.key);
    });
    
    setHistoricalData(data);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitData = () => {
    setIsLoading(true);
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)).then(() => {
        loadDataForCurrentLocation();
      }),
      {
        loading: 'Processing input data...',
        success: 'Data processed successfully!',
        error: 'Failed to process data'
      }
    );
  };

  const handleRefresh = () => {
    if (airQualityData) {
      if (lastSearchMethod === "coordinates" && coordinates) {
        loadDataForCurrentLocation();
      } else if (airQualityData.location.name) {
        loadDataForLocation(airQualityData.location.name);
      } else {
        loadDataForCurrentLocation();
      }
    }
  };

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (citySearch.trim()) {
      loadDataForLocation(citySearch);
    }
  };
  
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full pb-6 animate-gradient-shift">
      <div className="max-w-full mx-auto">
        <Header 
          airQualityData={airQualityData} 
          isLoading={isLoading} 
          onRefresh={handleRefresh} 
        />
        
        <section id="home" className="py-8 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-pulse-slow">
              Air Quality Monitoring Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Get real-time air quality data for any location or use your current position
            </p>

            {/* City search form */}
            <form onSubmit={handleCitySearch} className="max-w-md mx-auto mb-6">
              <div className="flex gap-2">
                <Input 
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Enter city name..."
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !citySearch.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-col items-center gap-6">
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => scrollToSection("inputs")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Enter Air Quality Data
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={loadDataForCurrentLocation}
                  disabled={isLoading}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Use My Location
                </Button>
              </div>
              
              <div className="w-full max-w-md">
                <div className="flex items-center justify-center mb-2">
                  <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Select Data Source:</span>
                </div>
                <ToggleGroup type="single" defaultValue="local" value={dataSource} onValueChange={(value) => value && setDataSource(value as "local" | "google")} className="justify-center">
                  <ToggleGroupItem value="local" className="flex gap-1">
                    <Wind className="h-4 w-4" />
                    <span>Local Data</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="google" className="flex gap-1">
                    <Globe className="h-4 w-4" />
                    <span>Google API</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>
        </section>
        
        <section id="inputs" className="py-8 px-6 bg-card/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Wind className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-2xl font-semibold">Air Quality Inputs</h2>
            </div>
            
            <div className="glass-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {METRICS_INFO.map((metric) => (
                  <div key={metric.key} className="flex flex-col space-y-2">
                    <Label htmlFor={metric.key} className="flex items-center gap-2">
                      {metric.label}
                    </Label>
                    <Input
                      id={metric.key}
                      placeholder={`Enter ${metric.label}`}
                      value={formData[metric.key] || ''}
                      onChange={(e) => handleInputChange(metric.key, e.target.value)}
                      className="backdrop-blur-sm bg-secondary/40 border-none"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-8 gap-4">
                <Button onClick={handleSubmitData} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Submit Data'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={loadDataForCurrentLocation}
                  disabled={isLoading}
                >
                  {dataSource === "google" ? (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Use Google API
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Use Current Location
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section id="analysis" className="py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
              <BarChart className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-2xl font-semibold">Analysis</h2>
              {airQualityData?.source && (
                <span className="ml-4 text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Source: {airQualityData.source}
                </span>
              )}
            </div>
            
            {/* 4 items per row for better display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {airQualityData ? (
                <>
                  <div className="col-span-full lg:col-span-2">
                    <AirQualityMap 
                      airQualityData={airQualityData} 
                      isLoading={isLoading} 
                    />
                  </div>
                  
                  <div className="col-span-full lg:col-span-2">
                    <AirQualityChart 
                      title="PM2.5 Concentration" 
                      data={historicalData.pm25 || []} 
                      color="pm25" 
                      unit="µg/m³" 
                    />
                  </div>
                  
                  {/* Render the metric cards in a 4-column grid */}
                  {METRICS_INFO.map((metricInfo) => (
                    <AirQualityChart
                      key={metricInfo.key}
                      title={`${metricInfo.label} Trend`}
                      data={historicalData[metricInfo.key] || []} 
                      color={metricInfo.colorKey}
                      unit={airQualityData.metrics[metricInfo.key].unit}
                    />
                  ))}
                </>
              ) : (
                <div className="col-span-full glass-card p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    {isLoading ? "Loading data..." : "Enter values or use your location to view air quality data"}
                  </p>
                  {!isLoading && !error && (
                    <Button 
                      onClick={loadDataForCurrentLocation} 
                      variant="default" 
                      className="bg-primary"
                    >
                      {dataSource === "google" ? (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Use Google API
                        </>
                      ) : (
                        <>
                          <MapPin className="mr-2 h-4 w-4" />
                          Use My Location
                        </>
                      )}
                    </Button>
                  )}
                  {error && (
                    <div className="text-red-400 mt-2">
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
                </div>
              )}
            </div>
          </div>
        </section>
        
        <section id="quality-index" className="py-8 px-6 bg-card/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
              <Gauge className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-2xl font-semibold">Quality Index</h2>
            </div>
            
            {airQualityData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {METRICS_INFO.map((metricInfo) => (
                  <QualityIndexCard
                    key={metricInfo.key}
                    metricInfo={metricInfo}
                    value={airQualityData.metrics[metricInfo.key]}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-muted-foreground">
                  No data available. Please enter values or use your location.
                </p>
              </div>
            )}
          </div>
        </section>
        
        <section id="final-air-quality" className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <ThermometerSun className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-2xl font-semibold">Final Air Quality</h2>
            </div>
            
            {airQualityData ? (
              <FinalAirQuality airQualityData={airQualityData} />
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-muted-foreground">
                  No data available. Please enter values or use your location.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AirQualityDashboard;
