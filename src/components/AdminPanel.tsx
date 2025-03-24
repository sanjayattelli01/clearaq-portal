
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
  Activity
} from "lucide-react";
import { AirQualityData, METRICS_INFO } from "@/utils/types";
import { 
  fetchAirQualityData, 
  fetchAirQualityDataByCity, 
  getUserCurrentLocation
} from "@/utils/api";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AQIDataTable from "./AQIDataTable";
import AQIAnalysisResult from "./AQIAnalysisResult";
import AdminHeader from "./AdminHeader";

// Sample dataset imported from the CSV
const sampleData = [
  {
    "pm25": 12.46271167,
    "pm10": 16.09739248,
    "no": 0.134938123,
    "no2": 4.325129228,
    "nox": 2.679533325,
    "nh3": 13.4746276,
    "so2": 4.8213016,
    "co": 0.618234,
    "o3": 15.06349,
    "benzene": 0.048337,
    "humidity": 92.01842,
    "wind_speed": 0.133542005,
    "wind_direction": 205.4919661,
    "solar_radiation": 65.82197292,
    "rainfall": -0.285760125,
    "air_temperature": 30.71
  },
  {
    "pm25": 9.5958634,
    "pm10": 14.95434986,
    "no": 0.307633056,
    "no2": 4.101504049,
    "nox": 2.679533325,
    "nh3": 13.1512858,
    "so2": 3.8579895,
    "co": 1.133142,
    "o3": 6.491356,
    "benzene": 0.101746,
    "humidity": 98.59218,
    "wind_speed": 0.807967235,
    "wind_direction": 35.00620698,
    "solar_radiation": 23.60620774,
    "rainfall": 0.236755585,
    "air_temperature": 28.9
  },
  {
    "pm25": 8.004165864,
    "pm10": 18.09889557,
    "no": 0.510150057,
    "no2": 4.569629727,
    "nox": 2.3922013,
    "nh3": 15.3249398,
    "so2": 6.0943074,
    "co": 0.067838,
    "o3": 6.09275,
    "benzene": -0.21315,
    "humidity": 98.11887,
    "wind_speed": 0.566758697,
    "wind_direction": 38.43370969,
    "solar_radiation": 23.07548791,
    "rainfall": 0.075608194,
    "air_temperature": 28.18
  },
  {
    "pm25": 7.905082815,
    "pm10": 14.83185572,
    "no": 0.817394305,
    "no2": 4.047494492,
    "nox": 2.93244463,
    "nh3": 12.675942,
    "so2": 4.0492549,
    "co": 1.4098,
    "o3": 3.428227,
    "benzene": -0.0912,
    "humidity": 98.23993,
    "wind_speed": 0.238826692,
    "wind_direction": 28.22330325,
    "solar_radiation": 23.25174385,
    "rainfall": 0.04984412,
    "air_temperature": 27.86
  },
  {
    "pm25": 8.876984618,
    "pm10": 19.36906162,
    "no": 1.089787443,
    "no2": 3.941652695,
    "nox": 2.93801263,
    "nh3": 17.5017244,
    "so2": 5.4341126,
    "co": 1.591742,
    "o3": 2.684669,
    "benzene": -0.03321,
    "humidity": 98.53699,
    "wind_speed": 0.385218868,
    "wind_direction": 27.2697338,
    "solar_radiation": 22.91497739,
    "rainfall": -0.060809575,
    "air_temperature": 27.42
  }
];

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [citySearch, setCitySearch] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>("data-entry");
  const [analysisPerformed, setAnalysisPerformed] = useState<boolean>(false);

  const loadDataForCurrentLocation = async () => {
    setIsLoading(true);
    
    try {
      const coords = await getUserCurrentLocation();
      const data = await fetchAirQualityData(coords);
      
      setAirQualityData(data);
      
      // Pre-fill form data with current values
      const initialFormData: Record<string, string> = {};
      Object.keys(data.metrics).forEach(key => {
        initialFormData[key] = data.metrics[key].value.toString();
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
          
          // Pre-fill form data
          const initialFormData: Record<string, string> = {};
          Object.keys(data.metrics).forEach(key => {
            initialFormData[key] = data.metrics[key].value.toString();
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
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const performAnalysis = () => {
    setIsLoading(true);
    
    // Simulate ML analysis with Random Forest algorithm
    setTimeout(() => {
      const currentMetrics = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = parseFloat(value) || 0;
        return acc;
      }, {} as Record<string, number>);
      
      // Compare with sample data
      const similarities = sampleData.map((row, index) => {
        const similarity = calculateSimilarity(currentMetrics, row);
        return { id: index + 1, similarity, data: row };
      });
      
      // Sort by similarity (higher is better)
      similarities.sort((a, b) => b.similarity - a.similarity);
      
      const bestMatch = similarities[0];
      const worstMatch = similarities[similarities.length - 1];
      
      // Calculate weighted AQI based on similarities
      const aqiScore = calculateAQIScore(currentMetrics, similarities);
      
      const result = {
        aqiScore,
        classification: getAQIClassification(aqiScore),
        similarities,
        bestMatch,
        worstMatch,
        metrics: currentMetrics
      };
      
      setAnalysisResult(result);
      setAnalysisPerformed(true);
      setActiveTab("analysis-result");
      
      toast.success("Analysis completed successfully");
      setIsLoading(false);
    }, 1500);
  };

  // Euclidean distance similarity
  const calculateSimilarity = (current: Record<string, number>, sample: Record<string, number>) => {
    let sumSquaredDiff = 0;
    let count = 0;
    
    // Only compare metrics we have in our form
    for (const key of Object.keys(current)) {
      if (sample[key as keyof typeof sample] !== undefined) {
        const diff = current[key] - (sample[key as keyof typeof sample] as number);
        sumSquaredDiff += diff * diff;
        count++;
      }
    }
    
    if (count === 0) return 0;
    
    // Inverse of distance (higher means more similar)
    const distance = Math.sqrt(sumSquaredDiff / count);
    return 1 / (1 + distance);
  };

  // Calculate AQI score based on weighted similarities
  const calculateAQIScore = (
    current: Record<string, number>, 
    similarities: Array<{id: number, similarity: number, data: any}>
  ) => {
    // Weights for the main pollutants in AQI calculation
    const weights = {
      pm25: 0.3,
      pm10: 0.2,
      o3: 0.15,
      no2: 0.1,
      so2: 0.1,
      co: 0.15
    };
    
    // Base score from current values
    let score = 0;
    let totalWeight = 0;
    
    for (const [key, weight] of Object.entries(weights)) {
      if (current[key] !== undefined) {
        // Normalize to 0-500 scale based on typical AQI ranges
        const normalizedValue = normalizeForAQI(key, current[key]);
        score += normalizedValue * weight;
        totalWeight += weight;
      }
    }
    
    // Adjust based on similarity to known patterns
    const similarityAdjustment = similarities.slice(0, 2).reduce((sum, item) => {
      return sum + (item.similarity * 0.1); // Small adjustment based on similar patterns
    }, 0);
    
    // Final score
    const finalScore = totalWeight > 0 ? (score / totalWeight) + similarityAdjustment : 0;
    
    // Ensure score is in 0-500 range
    return Math.min(500, Math.max(0, Math.round(finalScore)));
  };

  // Normalize pollutant values to AQI scale
  const normalizeForAQI = (pollutant: string, value: number): number => {
    // Simplified normalization based on EPA ranges
    const ranges: Record<string, number[][]> = {
      pm25: [[0, 12, 0, 50], [12.1, 35.4, 51, 100], [35.5, 55.4, 101, 150], [55.5, 150.4, 151, 200], [150.5, 250.4, 201, 300], [250.5, 500, 301, 500]],
      pm10: [[0, 54, 0, 50], [55, 154, 51, 100], [155, 254, 101, 150], [255, 354, 151, 200], [355, 424, 201, 300], [425, 604, 301, 500]],
      o3: [[0, 0.054, 0, 50], [0.055, 0.070, 51, 100], [0.071, 0.085, 101, 150], [0.086, 0.105, 151, 200], [0.106, 0.2, 201, 300]],
      no2: [[0, 0.053, 0, 50], [0.054, 0.100, 51, 100], [0.101, 0.360, 101, 150], [0.361, 0.649, 151, 200], [0.65, 1.249, 201, 300], [1.25, 2.049, 301, 500]],
      so2: [[0, 0.035, 0, 50], [0.036, 0.075, 51, 100], [0.076, 0.185, 101, 150], [0.186, 0.304, 151, 200], [0.305, 0.604, 201, 300], [0.605, 1.004, 301, 500]],
      co: [[0, 4.4, 0, 50], [4.5, 9.4, 51, 100], [9.5, 12.4, 101, 150], [12.5, 15.4, 151, 200], [15.5, 30.4, 201, 300], [30.5, 50.4, 301, 500]]
    };
    
    const pollutantRanges = ranges[pollutant];
    if (!pollutantRanges) return value; // If no mapping, return original
    
    // Find the correct range
    for (const [cLow, cHigh, aqiLow, aqiHigh] of pollutantRanges) {
      if (value >= cLow && value <= cHigh) {
        // Linear interpolation
        return ((value - cLow) / (cHigh - cLow)) * (aqiHigh - aqiLow) + aqiLow;
      }
    }
    
    return 0; // Default if no range matches
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
              <TabsTrigger value="data-table">Sample Data</TabsTrigger>
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
                      value={formData[metric.key] || ''}
                      onChange={(e) => handleInputChange(metric.key, e.target.value)}
                      className="bg-white/10 border-white/10 text-white"
                      type="number"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-8">
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
            </TabsContent>
            
            <TabsContent value="data-table">
              <AQIDataTable data={sampleData} />
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
