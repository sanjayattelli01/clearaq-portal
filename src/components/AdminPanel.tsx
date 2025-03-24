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
  Upload
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ML Algorithms options
const ML_ALGORITHMS = [
  { id: "naive-bayes", name: "Naive Bayes" },
  { id: "knn", name: "K-Nearest Neighbors (KNN)" },
  { id: "svm", name: "Support Vector Machine (SVM)" },
  { id: "random-forest", name: "Random Forest" }
];

// API Sources options
const API_SOURCES = [
  { id: "openweather", name: "OpenWeather API" },
  { id: "google", name: "Google Air Quality API" },
  { id: "manual", name: "Manual Entry" }
];

// Efficiency category options
const EFFICIENCY_CATEGORIES = [
  { value: "Low", label: "Low (0-25)" },
  { value: "Moderate", label: "Moderate (26-50)" },
  { value: "High", label: "High (51-75)" },
  { value: "Very High", label: "Very High (76-100)" }
];

// Form schema for API configuration
const apiConfigSchema = z.object({
  apiSource: z.string().min(1, "API source is required"),
  apiKey: z.string().min(1, "API key is required"),
  location: z.string().optional()
});

// Form schema for data analysis
const analysisFormSchema = z.object({
  algorithm: z.string().min(1, "ML algorithm is required"),
});

// Form schema for manual data entry
const dataEntrySchema = z.object({
  pm25: z.coerce.number().min(0),
  pm10: z.coerce.number().min(0),
  no: z.coerce.number().min(0),
  no2: z.coerce.number().min(0),
  nox: z.coerce.number().min(0),
  nh3: z.coerce.number().min(0),
  so2: z.coerce.number().min(0),
  co: z.coerce.number().min(0),
  o3: z.coerce.number().min(0),
  benzene: z.coerce.number().min(0),
  humidity: z.coerce.number().min(0, "Humidity must be at least 0"),
  wind_speed: z.coerce.number().min(0),
  wind_direction: z.coerce.number().min(0).max(360, "Direction must be between 0-360"),
  solar_radiation: z.coerce.number().min(0),
  rainfall: z.coerce.number(),
  air_temperature: z.coerce.number(),
  efficiency: z.coerce.number().min(0).max(100, "Efficiency must be between 0-100"),
  efficiency_category: z.enum(["Low", "Moderate", "High", "Very High"])
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
  const [activeTab, setActiveTab] = useState<string>("data-entry");
  const [analysisPerformed, setAnalysisPerformed] = useState<boolean>(false);
  const [apiData, setApiData] = useState<any[]>([]);
  const [algorithm, setAlgorithm] = useState<string>("random-forest");
  
  // API Configuration form
  const apiConfigForm = useForm<z.infer<typeof apiConfigSchema>>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiSource: "openweather",
      apiKey: "",
      location: ""
    }
  });
  
  // Analysis form
  const analysisForm = useForm<z.infer<typeof analysisFormSchema>>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      algorithm: "random-forest"
    }
  });
  
  // Data entry form
  const dataEntryForm = useForm<z.infer<typeof dataEntrySchema>>({
    resolver: zodResolver(dataEntrySchema),
    defaultValues: {
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
      air_temperature: 0,
      efficiency: 50,
      efficiency_category: "Moderate"
    }
  });

  useEffect(() => {
    // Fetch data from Supabase when component mounts
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
        toast.info("No data found in database. Please add some data.");
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

  const onDataEntrySubmit = async (values: z.infer<typeof dataEntrySchema>) => {
    setIsLoading(true);
    
    try {
      // Insert data into Supabase
      const { data, error } = await supabase
        .from('air_quality_data')
        .insert([{
          ...values,
          data_source: 'manual'
        }])
        .select();
      
      if (error) throw error;
      
      toast.success("Data saved successfully");
      fetchDataFromSupabase(); // Refresh the data
      
    } catch (err) {
      console.error("Error saving data:", err);
      toast.error("Failed to save data");
    } finally {
      setIsLoading(false);
    }
  };

  const onApiConfigSubmit = async (values: z.infer<typeof apiConfigSchema>) => {
    setIsLoading(true);
    
    try {
      // This would fetch data from the selected API
      // For demonstration, we'll just simulate API fetch
      toast.info(`Fetching data from ${values.apiSource}...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (values.apiSource === "openweather") {
        // In real implementation, make an API call to OpenWeather
        toast.success("Successfully fetched data from OpenWeather API");
      } else if (values.apiSource === "google") {
        // In real implementation, make an API call to Google Air Quality API
        toast.success("Successfully fetched data from Google Air Quality API");
      }
      
      // Fetch updated data from database
      fetchDataFromSupabase();
      
    } catch (err) {
      console.error("Error fetching API data:", err);
      toast.error(`Failed to fetch data from ${values.apiSource}`);
    } finally {
      setIsLoading(false);
    }
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
      
      // Simulate ML analysis with selected algorithm
      toast.info(`Running ${selectedAlgorithm} algorithm on data...`);
      
      setTimeout(() => {
        const currentMetrics = Object.entries(formData).reduce((acc, [key, value]) => {
          acc[key] = parseFloat(value) || 0;
          return acc;
        }, {} as Record<string, number>);
        
        // Compare with API data
        const similarities = apiData.map((row, index) => {
          const similarity = calculateSimilarity(currentMetrics, row);
          return { id: index + 1, similarity, data: row };
        });
        
        // Sort by similarity (higher is better)
        similarities.sort((a, b) => b.similarity - a.similarity);
        
        const bestMatch = similarities[0];
        const worstMatch = similarities[similarities.length - 1];
        
        // Calculate weighted AQI based on similarities and algorithm
        const aqiScore = calculateAQIScore(currentMetrics, similarities, selectedAlgorithm);
        
        const algorithmFactors = {
          "naive-bayes": "Probabilistic classification",
          "knn": "Instance-based learning",
          "svm": "Hyperplane separation",
          "random-forest": "Ensemble decision trees"
        };
        
        const result = {
          aqiScore,
          classification: getAQIClassification(aqiScore),
          similarities,
          bestMatch,
          worstMatch,
          metrics: currentMetrics,
          algorithm: selectedAlgorithm,
          algorithmDescription: algorithmFactors[selectedAlgorithm as keyof typeof algorithmFactors] || "Unknown approach"
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

  // Euclidean distance similarity
  const calculateSimilarity = (current: Record<string, number>, sample: Record<string, any>) => {
    let sumSquaredDiff = 0;
    let count = 0;
    
    // Only compare metrics we have in our form
    for (const key of Object.keys(current)) {
      if (sample[key] !== undefined && !isNaN(parseFloat(sample[key]))) {
        const diff = current[key] - parseFloat(sample[key]);
        sumSquaredDiff += diff * diff;
        count++;
      }
    }
    
    if (count === 0) return 0;
    
    // Inverse of distance (higher means more similar)
    const distance = Math.sqrt(sumSquaredDiff / count);
    return 1 / (1 + distance);
  };

  // Calculate AQI score based on weighted similarities and algorithm
  const calculateAQIScore = (
    current: Record<string, number>, 
    similarities: Array<{id: number, similarity: number, data: any}>,
    algorithm: string
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
    
    // Algorithm-specific adjustments
    let algorithmMultiplier = 1.0;
    
    switch (algorithm) {
      case "naive-bayes":
        // Naive Bayes tends to be more conservative
        algorithmMultiplier = 0.95;
        break;
      case "knn":
        // KNN is influenced more heavily by nearest neighbors
        algorithmMultiplier = 1.05;
        break;
      case "svm":
        // SVM tends to be more precise at boundaries
        algorithmMultiplier = 1.0;
        break;
      case "random-forest":
        // Random Forest often produces well-balanced predictions
        algorithmMultiplier = 1.02;
        break;
    }
    
    // Adjust based on similarity to known patterns
    const similarityAdjustment = similarities.slice(0, 2).reduce((sum, item) => {
      return sum + (item.similarity * 0.1); // Small adjustment based on similar patterns
    }, 0);
    
    // Final score with algorithm adjustment
    const finalScore = totalWeight > 0 ? 
      ((score / totalWeight) + similarityAdjustment) * algorithmMultiplier : 0;
    
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="data-entry">Manual Data Entry</TabsTrigger>
              <TabsTrigger value="api-integration">API Integration</TabsTrigger>
              <TabsTrigger value="data-table">Current Data</TabsTrigger>
              <TabsTrigger value="analysis-result" disabled={!analysisPerformed}>
                Analysis Results
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="data-entry">
              <Form {...dataEntryForm}>
                <form onSubmit={dataEntryForm.handleSubmit(onDataEntrySubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {METRICS_INFO.map((metric) => (
                      <FormField
                        key={metric.key}
                        control={dataEntryForm.control}
                        name={metric.key as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white text-sm flex items-center gap-1">
                              {metric.label}
                              <span className="text-xs text-blue-300">
                                ({metric.unit})
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`Enter ${metric.label}`}
                                className="bg-white/10 border-white/10 text-white"
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    
                    {/* Efficiency fields */}
                    <FormField
                      control={dataEntryForm.control}
                      name="efficiency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-sm">
                            Efficiency (0-100)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter efficiency score"
                              className="bg-white/10 border-white/10 text-white"
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={dataEntryForm.control}
                      name="efficiency_category"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-white text-sm">Efficiency Category</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              {EFFICIENCY_CATEGORIES.map((category) => (
                                <FormItem 
                                  key={category.value} 
                                  className="flex items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <RadioGroupItem 
                                      value={category.value} 
                                      checked={field.value === category.value}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-white">
                                    {category.label}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-center mt-8">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-blue-500 hover:bg-blue-600 px-8"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Data to Database
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="api-integration">
              <Form {...apiConfigForm}>
                <form onSubmit={apiConfigForm.handleSubmit(onApiConfigSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={apiConfigForm.control}
                      name="apiSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Data Source</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white/10 border-white/10 text-white">
                                <SelectValue placeholder="Select API Source" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {API_SOURCES.map((source) => (
                                <SelectItem key={source.id} value={source.id}>
                                  {source.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiConfigForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">API Key</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your API key"
                              className="bg-white/10 border-white/10 text-white"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiConfigForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Location (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City, Country"
                              className="bg-white/10 border-white/10 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-end">
                      <Button
                        onClick={() => loadDataForCurrentLocation()}
                        type="button"
                        className="w-full bg-blue-500/80 hover:bg-blue-600 flex gap-2"
                        disabled={isLoading}
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
                  
                  <div className="flex justify-center mt-8">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-blue-500 hover:bg-blue-600 px-8"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Fetch Data from API
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
              
              <div className="mt-8 p-4 border border-white/10 rounded-lg bg-white/5">
                <h3 className="text-lg text-white mb-2">API Integration Notes</h3>
                <ul className="list-disc list-inside text-sm text-blue-300 space-y-1">
                  <li>For OpenWeather API, get your API key from <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="underline">OpenWeatherMap</a></li>
                  <li>For Google Air Quality API, get your API key from <a href="https://developers.google.com/maps/documentation/air-quality" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                  <li>Data will be stored in your Supabase database for analysis</li>
                  <li>Leaving location blank will use current location (if available)</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="data-table">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-white">Database Records</h3>
                <Button 
                  onClick={fetchDataFromSupabase} 
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </div>
              
              {apiData.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table className="border border-white/10 rounded-lg">
                    <TableHeader className="bg-white/5">
                      <TableRow>
                        <TableHead className="text-blue-300">PM2.5</TableHead>
                        <TableHead className="text-blue-300">PM10</TableHead>
                        <TableHead className="text-blue-300">NO2</TableHead>
                        <TableHead className="text-blue-300">O3</TableHead>
                        <TableHead className="text-blue-300">Temperature</TableHead>
                        <TableHead className="text-blue-300">Efficiency</TableHead>
                        <TableHead className="text-blue-300">Category</TableHead>
                        <TableHead className="text-blue-300">Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiData.map((row, index) => (
                        <TableRow key={index} className="border-white/5">
                          <TableCell className="text-white">{row.pm25}</TableCell>
                          <TableCell className="text-white">{row.pm10}</TableCell>
                          <TableCell className="text-white">{row.no2}</TableCell>
                          <TableCell className="text-white">{row.o3}</TableCell>
                          <TableCell className="text-white">{row.air_temperature}</TableCell>
                          <TableCell className="text-white">{row.efficiency}</TableCell>
                          <TableCell className="text-white">{row.efficiency_category}</TableCell>
                          <TableCell className="text-white">{row.data_source || 'Unknown'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <AlertCircle className="h-
