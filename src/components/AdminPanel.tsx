import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Search,
  RefreshCw,
  Database,
  MapPin,
  AlertCircle,
  ThumbsUp,
  LogOut,
  Activity,
  Cloud
} from "lucide-react";
import { AirQualityData, METRICS_INFO } from "@/utils/types";
import { 
  fetchAirQualityData, 
  fetchAirQualityDataByCity, 
  getUserCurrentLocation
} from "@/utils/api";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AQIAnalysisResult from "./AQIAnalysisResult";
import AdminHeader from "./AdminHeader";

interface AdminPanelProps {
  onLogout: () => void;
}

const API_URL = "https://air-anlalysis-models.onrender.com/predict";

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [citySearch, setCitySearch] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, number>>({
    pm25: 0,
    pm10: 0,
    no: 0,
    no2: 0,
    nox: 0,
    nh3: 0,
    so2: 0,
    co: 0,
    o3: 0,
    benzene: 0,
    humidity: 0,
    wind_speed: 0,
    wind_direction: 0,
    solar_radiation: 0,
    rainfall: 0,
    air_temperature: 0
  });
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>("data-entry");
  const [analysisPerformed, setAnalysisPerformed] = useState<boolean>(false);

  const loadDataForCurrentLocation = async () => {
    setIsLoading(true);
    
    try {
      const coords = await getUserCurrentLocation();
      const data = await fetchAirQualityData(coords);
      
      setAirQualityData(data);
      
      const initialFormData: Record<string, number> = {};
      Object.keys(data.metrics).forEach(key => {
        initialFormData[key] = data.metrics[key].value;
      });
      
      setFormData(initialFormData);
      toast.success(`Loaded air quality data for ${data.location.name}`);
      
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load air quality data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (citySearch.trim()) {
      setIsLoading(true);
      
      fetchAirQualityDataByCity(citySearch)
        .then(data => {
          setAirQualityData(data);
          
          const initialFormData: Record<string, number> = {};
          Object.keys(data.metrics).forEach(key => {
            initialFormData[key] = data.metrics[key].value;
          });
          
          setFormData(initialFormData);
          toast.success(`Loaded air quality data for ${citySearch}`);
        })
        .catch(err => {
          console.error("Error fetching data by city:", err);
          toast.error("Failed to load air quality data for this location");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const getPredictionFromAPI = async (features: number[]) => {
    setIsLoading(true);
    
    try {
      const inputData = {
        features: features
      };
      
      console.log("Sending data to API:", inputData);
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("API Response:", result);
      
      return result;
    } catch (error) {
      console.error("API request failed:", error);
      toast.error("Failed to connect to prediction API. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const performAnalysis = async () => {
    setIsLoading(true);
    
    // Extract features in correct order
    const features = [
      formData.pm25,
      formData.pm10,
      formData.no,
      formData.no2,
      formData.nox,
      formData.nh3,
      formData.so2,
      formData.co,
      formData.o3,
      formData.benzene,
      formData.humidity,
      formData.wind_speed,
      formData.wind_direction,
      formData.solar_radiation,
      formData.rainfall,
      formData.air_temperature
    ];
    
    // Call prediction API
    const apiResult = await getPredictionFromAPI(features);
    
    if (!apiResult) {
      setIsLoading(false);
      return;
    }
    
    // Create result object with API response
    const result = {
      metrics: formData,
      apiResponse: apiResult
    };
    
    setAnalysisResult(result);
    setAnalysisPerformed(true);
    setActiveTab("analysis-result");
    
    toast.success("Analysis completed successfully");
    setIsLoading(false);
  };

  const calculateAQIScore = (metrics: Record<string, number>): number => {
    const weights = {
      pm25: 0.3,
      pm10: 0.2,
      o3: 0.15,
      no2: 0.1,
      so2: 0.1,
      co: 0.15
    };
    
    let score = 0;
    let totalWeight = 0;
    
    for (const [key, weight] of Object.entries(weights)) {
      if (metrics[key as keyof typeof metrics] !== undefined) {
        const normalizedValue = normalizeForAQI(key, metrics[key as keyof typeof metrics]);
        score += normalizedValue * weight;
        totalWeight += weight;
      }
    }
    
    const finalScore = totalWeight > 0 ? (score / totalWeight) : 0;
    
    return Math.min(500, Math.max(0, Math.round(finalScore)));
  };

  const normalizeForAQI = (pollutant: string, value: number): number => {
    const ranges: Record<string, number[][]> = {
      pm25: [[0, 12, 0, 50], [12.1, 35.4, 51, 100], [35.5, 55.4, 101, 150], [55.5, 150.4, 151, 200], [150.5, 250.4, 201, 300], [250.5, 500, 301, 500]],
      pm10: [[0, 54, 0, 50], [55, 154, 51, 100], [155, 254, 101, 150], [255, 354, 151, 200], [355, 424, 201, 300], [425, 604, 301, 500]],
      o3: [[0, 0.054, 0, 50], [0.055, 0.070, 51, 100], [0.071, 0.085, 101, 150], [0.086, 0.105, 151, 200], [0.106, 0.2, 201, 300]],
      no2: [[0, 0.053, 0, 50], [0.054, 0.100, 51, 100], [0.101, 0.360, 101, 150], [0.361, 0.649, 151, 200], [0.65, 1.249, 201, 300], [1.25, 2.049, 301, 500]],
      so2: [[0, 0.035, 0, 50], [0.036, 0.075, 51, 100], [0.076, 0.185, 101, 150], [0.186, 0.304, 151, 200], [0.305, 0.604, 201, 300], [0.605, 1.004, 301, 500]],
      co: [[0, 4.4, 0, 50], [4.5, 9.4, 51, 100], [9.5, 12.4, 101, 150], [12.5, 15.4, 151, 200], [15.5, 30.4, 201, 300], [30.5, 50.4, 301, 500]]
    };
    
    const pollutantRanges = ranges[pollutant];
    if (!pollutantRanges) return value;
    
    for (const [cLow, cHigh, aqiLow, aqiHigh] of pollutantRanges) {
      if (value >= cLow && value <= cHigh) {
        return ((value - cLow) / (cHigh - cLow)) * (aqiHigh - aqiLow) + aqiLow;
      }
    }
    
    return 0;
  };

  const getAQIClassification = (score: number): { label: string, color: string } => {
    if (score <= 50) {
      return { label: "Good", color: "text-green-500" };
    } else if (score <= 100) {
      return { label: "Moderate", color: "text-yellow-500" };
    } else if (score <= 150) {
      return { label: "Unhealthy for Sensitive Groups", color: "text-orange-500" };
    } else if (score <= 200) {
      return { label: "Unhealthy", color: "text-red-500" };
    } else if (score <= 300) {
      return { label: "Very Unhealthy", color: "text-purple-500" };
    } else {
      return { label: "Hazardous", color: "text-rose-600" };
    }
  };

  return (
    <div className="min-h-screen w-full pb-6 animate-gradient-shift">
      <AdminHeader onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center mb-8">
          <Activity className="h-6 w-6 mr-3 text-blue-400" />
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AQI Analysis Panel
          </h1>
        </div>
        
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <form onSubmit={handleCitySearch} className="flex gap-2">
                <Input 
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Enter city name..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/50"
                />
                <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>
            </div>
            
            <div>
              <Button 
                onClick={loadDataForCurrentLocation} 
                disabled={isLoading}
                className="w-full bg-blue-500/80 hover:bg-blue-600 flex gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                Use Current Location
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-blue-300 mb-4">
            {airQualityData ? 
              `Loaded data for ${airQualityData.location.name}` : 
              "Enter a city or use your current location to load air quality data"
            }
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="data-entry">Data Entry</TabsTrigger>
              <TabsTrigger value="analysis-result" disabled={!analysisPerformed}>
                Analysis Results
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="data-entry">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {METRICS_INFO.map((metric) => (
                  <div key={metric.key} className="flex flex-col space-y-2">
                    <Label htmlFor={metric.key} className="text-white text-sm flex items-center gap-1">
                      {metric.label}
                      <span className="text-xs text-blue-300">
                        ({airQualityData?.metrics[metric.key]?.unit || ''})
                      </span>
                    </Label>
                    <Input
                      id={metric.key}
                      placeholder={`Enter ${metric.label}`}
                      value={formData[metric.key] !== undefined ? formData[metric.key].toString() : ''}
                      onChange={(e) => handleInputChange(metric.key, e.target.value)}
                      className="bg-white/10 border-white/10 text-white"
                      type="number"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 border border-white/10 rounded-md bg-white/5">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <Cloud className="h-5 w-5 mr-2 text-blue-400" />
                  Analysis Configuration
                </h3>
                <p className="text-blue-300 mb-4">
                  Submit your air quality data to analyze using machine learning models including 
                  Naive Bayes, KNN, SVM, and Random Forest algorithms.
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={performAnalysis} 
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 px-8"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Perform AQI Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis-result">
              {analysisResult ? (
                <AQIAnalysisResult result={analysisResult} />
              ) : (
                <div className="text-center py-10">
                  <AlertCircle className="h-10 w-10 mx-auto mb-4 text-yellow-500" />
                  <p className="text-blue-300">No analysis has been performed yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {analysisResult && activeTab === "data-entry" && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("analysis-result")}
              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              View Latest Analysis Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
