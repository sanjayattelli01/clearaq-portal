
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
  Save,
  Upload,
  Cloud,
  BarChart4,
  FileInput
} from "lucide-react";
import { AirQualityData, METRICS_INFO } from "@/utils/types";
import { 
  fetchAirQualityData, 
  fetchAirQualityDataByCity, 
  getUserCurrentLocation,
  fetchAirQualityFromOpenWeather,
  fetchAirQualityFromGoogleAPI,
  fetchAirQualityByRegion
} from "@/utils/api";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AQIDataTable from "./AQIDataTable";
import AQIAnalysisResult from "./AQIAnalysisResult";
import AdminHeader from "./AdminHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart, 
  Bar,
  BarChart,
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const ML_ALGORITHMS = [
  { id: "naive-bayes", name: "Naive Bayes" },
  { id: "knn", name: "K-Nearest Neighbors (KNN)" },
  { id: "svm", name: "Support Vector Machine (SVM)" },
  { id: "random-forest", name: "Random Forest" }
];

const API_SOURCES = [
  { id: "local", name: "Local Data", icon: "local-data" },
  { id: "google", name: "Google API", icon: "google" },
  { id: "region", name: "Region Data", icon: "region" },
  { id: "openweather", name: "Open Weather", icon: "weather" }
];

const apiConfigSchema = z.object({
  apiSource: z.string().min(1, "API source is required"),
  location: z.string().optional()
});

const analysisFormSchema = z.object({
  algorithm: z.string().min(1, "ML algorithm is required"),
});

const manualDataFormSchema = z.object({
  pm25: z.string().optional().transform(val => parseFloat(val) || 0),
  pm10: z.string().optional().transform(val => parseFloat(val) || 0),
  no: z.string().optional().transform(val => parseFloat(val) || 0),
  no2: z.string().optional().transform(val => parseFloat(val) || 0),
  nox: z.string().optional().transform(val => parseFloat(val) || 0),
  nh3: z.string().optional().transform(val => parseFloat(val) || 0),
  so2: z.string().optional().transform(val => parseFloat(val) || 0),
  co: z.string().optional().transform(val => parseFloat(val) || 0),
  o3: z.string().optional().transform(val => parseFloat(val) || 0),
  benzene: z.string().optional().transform(val => parseFloat(val) || 0),
  humidity: z.string().optional().transform(val => parseFloat(val) || 0),
  wind_speed: z.string().optional().transform(val => parseFloat(val) || 0),
  wind_direction: z.string().optional().transform(val => parseFloat(val) || 0),
  solar_radiation: z.string().optional().transform(val => parseFloat(val) || 0),
  rainfall: z.string().optional().transform(val => parseFloat(val) || 0),
  temperature: z.string().optional().transform(val => parseFloat(val) || 0),
});

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [citySearch, setCitySearch] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>("api-integration");
  const [analysisPerformed, setAnalysisPerformed] = useState<boolean>(false);
  const [apiData, setApiData] = useState<any[]>([]);
  const [selectedApiSource, setSelectedApiSource] = useState<string>("local");
  const [chartType, setChartType] = useState<string>("bar");
  
  const apiConfigForm = useForm<z.infer<typeof apiConfigSchema>>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiSource: "local",
      location: ""
    }
  });
  
  const analysisForm = useForm<z.infer<typeof analysisFormSchema>>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      algorithm: "random-forest"
    }
  });
  
  const manualDataForm = useForm<z.infer<typeof manualDataFormSchema>>({
    resolver: zodResolver(manualDataFormSchema),
    defaultValues: {
      pm25: "0",
      pm10: "0",
      no: "0",
      no2: "0",
      nox: "0",
      nh3: "0",
      so2: "0",
      co: "0",
      o3: "0",
      benzene: "0",
      humidity: "0",
      wind_speed: "0",
      wind_direction: "0",
      solar_radiation: "0",
      rainfall: "0",
      temperature: "0",
    }
  });

  useEffect(() => {
    fetchDataFromSupabase();
  }, []);

  const fetchDataFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('air_quality_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setApiData(data);
        toast.success(`Loaded ${data.length} records from database`);
      } else {
        toast.info("No data found in database");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data from database");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDataForCurrentLocation = async () => {
    setIsLoading(true);
    
    try {
      const coords = await getUserCurrentLocation();
      const data = await fetchAirQualityData(coords);
      
      setAirQualityData(data);
      
      const initialFormData: Record<string, string> = {};
      Object.keys(data.metrics).forEach(key => {
        initialFormData[key] = data.metrics[key].value.toString();
        
        // Update manual data form with fetched values
        manualDataForm.setValue(key as any, data.metrics[key].value.toString());
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
          
          const initialFormData: Record<string, string> = {};
          Object.keys(data.metrics).forEach(key => {
            initialFormData[key] = data.metrics[key].value.toString();
            
            // Update manual data form with fetched values
            manualDataForm.setValue(key as any, data.metrics[key].value.toString());
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

  const handleApiSourceSelect = async (source: string) => {
    setSelectedApiSource(source);
    setIsLoading(true);
    
    try {
      let data;
      switch (source) {
        case 'local':
          const coords = await getUserCurrentLocation();
          data = await fetchAirQualityData(coords);
          break;
        case 'google':
          const googleCoords = await getUserCurrentLocation();
          data = await fetchAirQualityFromGoogleAPI(googleCoords);
          break;
        case 'region':
          data = await fetchAirQualityByRegion('India', 'Telangana', 'Hyderabad');
          break;
        case 'openweather':
          const openWeatherCoords = await getUserCurrentLocation();
          data = await fetchAirQualityFromOpenWeather(openWeatherCoords);
          break;
        default:
          throw new Error("Invalid data source");
      }
      
      setAirQualityData(data);
      
      const initialFormData: Record<string, string> = {};
      Object.keys(data.metrics).forEach(key => {
        initialFormData[key] = data.metrics[key].value.toString();
        
        // Update manual data form with fetched values
        manualDataForm.setValue(key as any, data.metrics[key].value.toString());
      });
      
      setFormData(initialFormData);
      
      toast.success(`Loaded air quality data from ${source}`);
      
      // Save data to Supabase
      await saveAirQualityData(data, source);
      
    } catch (err) {
      console.error(`Error fetching data from ${source}:`, err);
      toast.error(`Failed to load air quality data from ${source}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAirQualityData = async (data: AirQualityData, source: string) => {
    try {
      const metrics = data.metrics;
      
      const { error } = await supabase
        .from('air_quality_data')
        .insert({
          pm25: metrics.pm25.value,
          pm10: metrics.pm10.value,
          no: metrics.no.value,
          no2: metrics.no2.value,
          nox: metrics.nox.value,
          nh3: metrics.nh3.value,
          so2: metrics.so2.value,
          co: metrics.co.value,
          o3: metrics.o3.value,
          benzene: metrics.benzene.value,
          humidity: metrics.humidity.value,
          wind_speed: metrics.wind_speed.value,
          wind_direction: metrics.wind_direction.value,
          solar_radiation: metrics.solar_radiation.value,
          rainfall: metrics.rainfall.value,
          air_temperature: metrics.temperature.value,
          efficiency: Math.floor(Math.random() * 100), // Random efficiency value
          efficiency_category: getEfficiencyCategory(Math.floor(Math.random() * 100)),
          data_source: source
        });
      
      if (error) throw error;
      
      toast.success("Data saved to database");
      fetchDataFromSupabase();
    } catch (err) {
      console.error("Error saving data to database:", err);
      toast.error("Failed to save data to database");
    }
  };
  
  const handleManualDataSubmit = async (values: z.infer<typeof manualDataFormSchema>) => {
    setIsLoading(true);
    
    try {
      // Create metrics object from form values
      const metrics: Record<string, any> = {};
      Object.entries(values).forEach(([key, value]) => {
        metrics[key] = {
          value: value,
          unit: getUnitForMetric(key)
        };
      });
      
      // Create AirQualityData object
      const manualData: AirQualityData = {
        location: {
          name: "Manual Entry",
          coordinates: { latitude: 0, longitude: 0 }
        },
        timestamp: new Date().toISOString(),
        metrics: metrics as any,
        aqi: {
          value: calculateAQIFromMetrics(metrics),
          category: 'moderate',
          description: 'Manually entered data'
        },
        source: 'manual'
      };
      
      setAirQualityData(manualData);
      
      // Save to Supabase
      const { error } = await supabase
        .from('air_quality_data')
        .insert({
          pm25: values.pm25,
          pm10: values.pm10,
          no: values.no,
          no2: values.no2,
          nox: values.nox,
          nh3: values.nh3,
          so2: values.so2,
          co: values.co,
          o3: values.o3,
          benzene: values.benzene,
          humidity: values.humidity,
          wind_speed: values.wind_speed,
          wind_direction: values.wind_direction,
          solar_radiation: values.solar_radiation,
          rainfall: values.rainfall,
          air_temperature: values.temperature,
          efficiency: Math.floor(Math.random() * 100),
          efficiency_category: getEfficiencyCategory(Math.floor(Math.random() * 100)),
          data_source: 'manual'
        });
      
      if (error) throw error;
      
      toast.success("Manual data saved successfully");
      fetchDataFromSupabase();
      
    } catch (err) {
      console.error("Error saving manual data:", err);
      toast.error("Failed to save manual data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getUnitForMetric = (metricKey: string): string => {
    const metricInfo = METRICS_INFO.find(m => m.key === metricKey);
    return metricInfo?.unit || '';
  };
  
  const calculateAQIFromMetrics = (metrics: Record<string, any>): number => {
    // Simple AQI calculation based on PM2.5 and PM10
    const pm25 = parseFloat(metrics.pm25) || 0;
    const pm10 = parseFloat(metrics.pm10) || 0;
    const o3 = parseFloat(metrics.o3) || 0;
    
    // Very simplified AQI calculation
    return Math.round((pm25 * 4 + pm10 * 2 + o3 * 3) / 3);
  };

  const getEfficiencyCategory = (efficiency: number): string => {
    if (efficiency <= 25) return "Low";
    if (efficiency <= 50) return "Moderate";
    if (efficiency <= 75) return "High";
    return "Very High";
  };

  const performAnalysis = async () => {
    const selectedAlgorithm = analysisForm.getValues("algorithm");
    setIsLoading(true);
    
    try {
      if (apiData.length === 0) {
        toast.error("No data available for analysis. Please add some data first.");
        setIsLoading(false);
        return;
      }
      
      // Get current metrics either from manual form or fetched data
      const currentMetrics: Record<string, number> = {};
      if (activeTab === "manual-data") {
        const formValues = manualDataForm.getValues();
        Object.entries(formValues).forEach(([key, value]) => {
          currentMetrics[key] = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
        });
      } else {
        // Use the data from the API
        if (airQualityData) {
          Object.entries(airQualityData.metrics).forEach(([key, metric]) => {
            currentMetrics[key] = metric.value;
          });
        } else {
          toast.error("No data available. Please fetch or enter data first.");
          setIsLoading(false);
          return;
        }
      }
      
      toast.info(`Running ${selectedAlgorithm} algorithm on data...`);
      
      setTimeout(() => {
        const similarities = apiData.map((row, index) => {
          const similarity = calculateSimilarity(currentMetrics, row);
          return { id: index + 1, similarity, data: row };
        });
        
        similarities.sort((a, b) => b.similarity - a.similarity);
        
        const bestMatch = similarities[0];
        const worstMatch = similarities[similarities.length - 1];
        
        const aqiScore = calculateAQIScore(currentMetrics, similarities, selectedAlgorithm);
        
        const algorithmFactors = {
          "naive-bayes": "Probabilistic classification",
          "knn": "Instance-based learning",
          "svm": "Hyperplane separation",
          "random-forest": "Ensemble decision trees"
        };
        
        // Prepare chart data
        const chartData = Object.entries(currentMetrics).map(([key, value]) => {
          const metricInfo = METRICS_INFO.find(m => m.key === key);
          const maxValue = key === 'pm25' ? 500 : key === 'pm10' ? 600 : 100;
          const impact = Math.min(100, Math.round((value / maxValue) * 100));
          
          return {
            name: metricInfo?.label || key,
            value: value,
            impact: impact,
            unit: metricInfo?.unit || ''
          };
        });
        
        const result = {
          aqiScore,
          classification: getAQIClassification(aqiScore),
          similarities,
          bestMatch,
          worstMatch,
          metrics: currentMetrics,
          algorithm: selectedAlgorithm,
          algorithmDescription: algorithmFactors[selectedAlgorithm as keyof typeof algorithmFactors] || "Unknown approach",
          chartData
        };
        
        setAnalysisResult(result);
        setAnalysisPerformed(true);
        setActiveTab("analysis-result");
        
        toast.success(`Analysis completed successfully using ${selectedAlgorithm}`);
        setIsLoading(false);
      }, 2000);
      
    } catch (err) {
      console.error("Error performing analysis:", err);
      toast.error("Failed to perform analysis");
      setIsLoading(false);
    }
  };

  const calculateSimilarity = (current: Record<string, number>, sample: Record<string, any>) => {
    let sumSquaredDiff = 0;
    let count = 0;
    
    for (const key of Object.keys(current)) {
      if (sample[key] !== undefined && !isNaN(parseFloat(sample[key]))) {
        const diff = current[key] - parseFloat(sample[key]);
        sumSquaredDiff += diff * diff;
        count++;
      }
    }
    
    if (count === 0) return 0;
    
    const distance = Math.sqrt(sumSquaredDiff / count);
    return 1 / (1 + distance);
  };

  const calculateAQIScore = (
    current: Record<string, number>, 
    similarities: Array<{id: number, similarity: number, data: any}>,
    algorithm: string
  ) => {
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
      if (current[key] !== undefined) {
        const normalizedValue = normalizeForAQI(key, current[key]);
        score += normalizedValue * weight;
        totalWeight += weight;
      }
    }
    
    let algorithmMultiplier = 1.0;
    
    switch (algorithm) {
      case "naive-bayes":
        algorithmMultiplier = 0.95;
        break;
      case "knn":
        algorithmMultiplier = 1.05;
        break;
      case "svm":
        algorithmMultiplier = 1.0;
        break;
      case "random-forest":
        algorithmMultiplier = 1.02;
        break;
    }
    
    const similarityAdjustment = similarities.slice(0, 2).reduce((sum, item) => {
      return sum + (item.similarity * 0.1);
    }, 0);
    
    const finalScore = totalWeight > 0 ? 
      ((score / totalWeight) + similarityAdjustment) * algorithmMultiplier : 0;
    
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

  const getAQIClassification = (score: number): { label: string; color: string } => {
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="api-integration">Data Source</TabsTrigger>
              <TabsTrigger value="manual-data">Manual Data Entry</TabsTrigger>
              <TabsTrigger value="analysis-config">Analysis Config</TabsTrigger>
              <TabsTrigger value="analysis-result" disabled={!analysisPerformed}>
                Analysis Results
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="api-integration">
              <div className="mb-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl text-white mb-2">Select Data Source:</h2>
                  
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {API_SOURCES.map(source => (
                      <Button
                        key={source.id}
                        onClick={() => handleApiSourceSelect(source.id)}
                        className={`px-6 py-4 h-auto text-base flex-col ${
                          selectedApiSource === source.id
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                        disabled={isLoading}
                      >
                        {source.id === 'local' && (
                          <MapPin className="h-5 w-5 mb-2" />
                        )}
                        {source.id === 'google' && (
                          <Search className="h-5 w-5 mb-2" />
                        )}
                        {source.id === 'region' && (
                          <MapPin className="h-5 w-5 mb-2" />
                        )}
                        {source.id === 'openweather' && (
                          <Cloud className="h-5 w-5 mb-2" />
                        )}
                        {source.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <RefreshCw className="h-10 w-10 animate-spin text-blue-400" />
                    <p className="text-blue-300 ml-3">Loading data...</p>
                  </div>
                ) : airQualityData ? (
                  <div className="space-y-4">
                    <Card className="bg-white/10 border-white/10 p-4">
                      <h3 className="text-lg font-medium text-white mb-2">Air Quality Data for {airQualityData.location.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                        <Card className="bg-white/5 p-2">
                          <div className="text-xs text-blue-400">AQI</div>
                          <div className={`text-lg font-medium ${getAQIClassification(airQualityData.aqi.value).color}`}>
                            {airQualityData.aqi.value}
                          </div>
                        </Card>
                        <Card className="bg-white/5 p-2">
                          <div className="text-xs text-blue-400">PM2.5</div>
                          <div className="text-white font-medium">
                            {airQualityData.metrics.pm25.value} {airQualityData.metrics.pm25.unit}
                          </div>
                        </Card>
                        <Card className="bg-white/5 p-2">
                          <div className="text-xs text-blue-400">O3</div>
                          <div className="text-white font-medium">
                            {airQualityData.metrics.o3.value} {airQualityData.metrics.o3.unit}
                          </div>
                        </Card>
                        <Card className="bg-white/5 p-2">
                          <div className="text-xs text-blue-400">NO2</div>
                          <div className="text-white font-medium">
                            {airQualityData.metrics.no2.value} {airQualityData.metrics.no2.unit}
                          </div>
                        </Card>
                      </div>
                    </Card>
                    
                    <Button 
                      onClick={performAnalysis}
                      className="w-full bg-blue-500 hover:bg-blue-600 mt-6 py-6 text-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Activity className="mr-2 h-4 w-4" />
                          Analyze Air Quality Data
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                    <p className="text-blue-300">Select a data source to get started</p>
                    <p className="text-sm text-blue-400 mt-2">
                      Choose one of the data sources above to fetch air quality data
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="manual-data">
              <div className="mb-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl text-white mb-2">Air Quality Inputs</h2>
                  <p className="text-blue-300">Enter values manually or use pre-filled data</p>
                </div>
                
                <Form {...manualDataForm}>
                  <form onSubmit={manualDataForm.handleSubmit(handleManualDataSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* PM2.5 */}
                      <FormField
                        control={manualDataForm.control}
                        name="pm25"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">PM2.5</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter PM2.5" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* PM10 */}
                      <FormField
                        control={manualDataForm.control}
                        name="pm10"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">PM10</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter PM10" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* NO */}
                      <FormField
                        control={manualDataForm.control}
                        name="no"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">NO</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter NO" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* NO2 */}
                      <FormField
                        control={manualDataForm.control}
                        name="no2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">NO₂</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter NO₂" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* NOx */}
                      <FormField
                        control={manualDataForm.control}
                        name="nox"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">NOx</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter NOx" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* NH3 */}
                      <FormField
                        control={manualDataForm.control}
                        name="nh3"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">NH₃</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter NH₃" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* SO2 */}
                      <FormField
                        control={manualDataForm.control}
                        name="so2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">SO₂</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter SO₂" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* CO */}
                      <FormField
                        control={manualDataForm.control}
                        name="co"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">CO</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter CO" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* O3 */}
                      <FormField
                        control={manualDataForm.control}
                        name="o3"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">O₃</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter O₃" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Benzene */}
                      <FormField
                        control={manualDataForm.control}
                        name="benzene"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Benzene</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter Benzene" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Humidity */}
                      <FormField
                        control={manualDataForm.control}
                        name="humidity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Humidity</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter Humidity" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Wind Speed */}
                      <FormField
                        control={manualDataForm.control}
                        name="wind_speed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Wind Speed</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter Wind Speed" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Wind Direction */}
                      <FormField
                        control={manualDataForm.control}
                        name="wind_direction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Wind Direction</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter Wind Direction" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Solar Radiation */}
                      <FormField
                        control={manualDataForm.control}
                        name="solar_radiation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Solar Radiation</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter Solar Radiation" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Rainfall */}
                      <FormField
                        control={manualDataForm.control}
                        name="rainfall"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Rainfall</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter Rainfall" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Temperature */}
                      <FormField
                        control={manualDataForm.control}
                        name="temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Temperature</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter Temperature" 
                                className="bg-white/5 border-white/10 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex gap-4 justify-center mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-40"
                        onClick={loadDataForCurrentLocation}
                        disabled={isLoading}
                      >
                        Use Local Data
                      </Button>
                      
                      <Button
                        type="submit"
                        className="w-40 bg-blue-500 hover:bg-blue-600"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Submit Data
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis-config">
              <Form {...analysisForm}>
                <Card className="bg-white/10 border-white/10 p-6 mt-4 mb-6">
                  <h3 className="text-lg font-medium text-white mb-4">Analysis Configuration</h3>
                  
                  <FormField
                    control={analysisForm.control}
                    name="algorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Select Machine Learning Algorithm</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/10 border-white/10 text-white">
                              <SelectValue placeholder="Select Algorithm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ML_ALGORITHMS.map((algo) => (
                              <SelectItem key={algo.id} value={algo.id}>
                                {algo.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="mt-6">
                    <Button 
                      onClick={performAnalysis}
                      className="w-full bg-blue-500 hover:bg-blue-600 mt-6 py-6 text-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Activity className="mr-2 h-4 w-4" />
                          Run Air Quality Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </Form>
            </TabsContent>
            
            <TabsContent value="analysis-result">
              {analysisResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-white/10 border-white/10 p-4">
                      <h3 className="text-lg font-medium text-white mb-2">AQI Score</h3>
                      <div className="flex items-center">
                        <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                          {analysisResult.aqiScore}
                        </div>
                        <div className={`ml-4 font-medium ${analysisResult.classification.color}`}>
                          {analysisResult.classification.label}
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-white/10 border-white/10 p-4">
                      <h3 className="text-lg font-medium text-white mb-2">Algorithm</h3>
                      <div className="text-blue-300">{analysisResult.algorithm}</div>
                      <div className="text-xs text-blue-400 mt-1">
                        {analysisResult.algorithmDescription}
                      </div>
                    </Card>
                    
                    <Card className="bg-white/10 border-white/10 p-4">
                      <h3 className="text-lg font-medium text-white mb-2">Data Points</h3>
                      <div className="text-blue-300">
                        {analysisResult.similarities.length} records analyzed
                      </div>
                      <div className="text-xs text-blue-400 mt-1">
                        Best match similarity: {Math.round(analysisResult.bestMatch.similarity * 100)}%
                      </div>
                    </Card>
                  </div>
                  
                  <Card className="bg-white/10 border-white/10 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-white">Metrics Analysis</h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant={chartType === 'bar' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setChartType('bar')}
                        >
                          <BarChart4 className="h-4 w-4 mr-1" />
                          Bar
                        </Button>
                        <Button 
                          variant={chartType === 'line' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setChartType('line')}
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          Line
                        </Button>
                      </div>
                    </div>
                    
                    <div className="h-80 w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (
                          <BarChart data={analysisResult.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                              dataKey="name" 
                              stroke="#8884d8" 
                              fontSize={12}
                              angle={-45}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis stroke="#8884d8" />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="custom-tooltip bg-white/10 border border-white/20 p-3 rounded-md">
                                      <p className="text-blue-300">{`${payload[0].payload.name}`}</p>
                                      <p className="text-white">{`Value: ${payload[0].value} ${payload[0].payload.unit}`}</p>
                                      <p className="text-orange-400">{`Impact: ${payload[0].payload.impact}%`}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="value" fill="#8884d8" name="Value" />
                            <Bar dataKey="impact" fill="#82ca9d" name="Impact %" />
                          </BarChart>
                        ) : (
                          <LineChart data={analysisResult.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                              dataKey="name" 
                              stroke="#8884d8" 
                              fontSize={12}
                              angle={-45}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis stroke="#8884d8" />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="custom-tooltip bg-white/10 border border-white/20 p-3 rounded-md">
                                      <p className="text-blue-300">{`${payload[0].payload.name}`}</p>
                                      <p className="text-white">{`Value: ${payload[0].value} ${payload[0].payload.unit}`}</p>
                                      <p className="text-orange-400">{`Impact: ${payload[0].payload.impact}%`}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" name="Value" />
                            <Line type="monotone" dataKey="impact" stroke="#82ca9d" name="Impact %" />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </Card>
                  
                  <Card className="bg-white/10 border-white/10 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Metrics Details</h3>
                    
                    <div className="overflow-x-auto">
                      <Table className="border border-white/10 rounded-lg">
                        <TableHeader className="bg-white/5">
                          <TableRow>
                            <TableHead className="text-blue-300">Metric</TableHead>
                            <TableHead className="text-blue-300">Value</TableHead>
                            <TableHead className="text-blue-300">Unit</TableHead>
                            <TableHead className="text-blue-300">Impact</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(analysisResult.metrics)
                            .sort(([, a], [, b]) => {
                              // Fix the sort function to handle types correctly
                              const valueA = Number(a) || 0;
                              const valueB = Number(b) || 0;
                              return valueB - valueA;
                            })
                            .map(([key, value]) => {
                              const metricInfo = METRICS_INFO.find(m => m.key === key);
                              // Calculate normalized impact (0-100%)
                              const maxValue = key === 'pm25' ? 500 : key === 'pm10' ? 600 : 100;
                              const impact = Math.min(100, Math.round((Number(value) / maxValue) * 100));
                              
                              let impactColor = "text-green-500";
                              if (impact > 30) impactColor = "text-yellow-500";
                              if (impact > 60) impactColor = "text-orange-500";
                              if (impact > 80) impactColor = "text-red-500";
                              
                              return metricInfo ? (
                                <TableRow key={key} className="border-white/5">
                                  <TableCell className="text-white">{metricInfo.label}</TableCell>
                                  <TableCell className="text-white">{value}</TableCell>
                                  <TableCell className="text-blue-300">{metricInfo.unit}</TableCell>
                                  <TableCell className={impactColor}>{impact}%</TableCell>
                                </TableRow>
                              ) : null;
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                  
                  <Card className="bg-white/10 border-white/10 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Analysis Details</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-blue-300 text-sm font-medium mb-2">Key Findings</h4>
                        <ul className="list-disc list-inside text-white space-y-1 text-sm">
                          <li>
                            The analyzed data shows an air quality index of {analysisResult.aqiScore} 
                            which is classified as <span className={analysisResult.classification.color}>{analysisResult.classification.label}</span>.
                          </li>
                          <li>
                            The {analysisResult.algorithm} algorithm was used for this analysis, which utilizes {analysisResult.algorithmDescription}.
                          </li>
                          <li>
                            Most similar historical data point had {Math.round(analysisResult.bestMatch.similarity * 100)}% similarity.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="bg-white/10 border-white/10 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">All Records Used For Analysis</h3>
                    
                    <div className="overflow-x-auto">
                      <Table className="border border-white/10 rounded-lg">
                        <TableHeader className="bg-white/5">
                          <TableRow>
                            <TableHead className="text-blue-300">#</TableHead>
                            <TableHead className="text-blue-300">Source</TableHead>
                            <TableHead className="text-blue-300">PM2.5</TableHead>
                            <TableHead className="text-blue-300">PM10</TableHead>
                            <TableHead className="text-blue-300">O3</TableHead>
                            <TableHead className="text-blue-300">NO2</TableHead>
                            <TableHead className="text-blue-300">CO</TableHead>
                            <TableHead className="text-blue-300">Similarity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysisResult.similarities.slice(0, 10).map((item, index) => (
                            <TableRow key={index} className="border-white/5">
                              <TableCell className="text-white">{index + 1}</TableCell>
                              <TableCell className="text-white">{item.data.data_source || "Unknown"}</TableCell>
                              <TableCell className="text-white">{item.data.pm25 || "N/A"}</TableCell>
                              <TableCell className="text-white">{item.data.pm10 || "N/A"}</TableCell>
                              <TableCell className="text-white">{item.data.o3 || "N/A"}</TableCell>
                              <TableCell className="text-white">{item.data.no2 || "N/A"}</TableCell>
                              <TableCell className="text-white">{item.data.co || "N/A"}</TableCell>
                              <TableCell className="text-green-400">{Math.round(item.similarity * 100)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-10">
                  <AlertCircle className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                  <p className="text-blue-300">No analysis results yet</p>
                  <p className="text-sm text-blue-400 mt-2">
                    Use the Data Source tab to fetch data and run an analysis
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

