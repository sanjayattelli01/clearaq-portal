
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  MapPin, RefreshCw, Database, BrainCircuit, 
  ArrowRight, BarChart4, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import Header from "@/components/Header";
import AQIDataTable from "@/components/AQIDataTable";
import AQIAnalysisResult from "@/components/AQIAnalysisResult";
import { AirQualityData, METRICS_INFO } from "@/utils/types";
import { getUserCurrentLocation, fetchAirQualityData } from "@/utils/api";

const ALGORITHM_OPTIONS = [
  { value: "random_forest", label: "Random Forest", description: "Ensemble learning method using multiple decision trees" },
  { value: "svm", label: "Support Vector Machine (SVM)", description: "Classification algorithm that finds the optimal hyperplane" },
  { value: "knn", label: "K-Nearest Neighbors (KNN)", description: "Uses proximity to make classifications or predictions" },
  { value: "naive_bayes", label: "Naïve Bayes", description: "Probabilistic classifier based on Bayes' theorem" },
  { value: "rnn", label: "Recurrent Neural Network (RNN)", description: "Deep learning algorithm optimized for sequential data" }
];

// Sample data for demonstration
const SAMPLE_DATA = Array.from({ length: 10 }).map((_, i) => {
  const data: Record<string, number> = {};
  METRICS_INFO.forEach(metric => {
    data[metric.key] = parseFloat((Math.random() * 100).toFixed(2));
  });
  return { id: i + 1, ...data };
});

const AQIAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [algorithm, setAlgorithm] = useState("random_forest");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const loadDataForCurrentLocation = async () => {
    setIsLoading(true);
    
    try {
      const coords = await getUserCurrentLocation();
      const data = await fetchAirQualityData(coords);
      
      setAirQualityData(data);
      
      // Populate form data with the retrieved values
      const newFormData: Record<string, string> = {};
      Object.entries(data.metrics).forEach(([key, metricValue]) => {
        newFormData[key] = metricValue.value.toString();
      });
      
      setFormData(newFormData);
      
      toast.success(`Loaded air quality data for ${data.location.name}`);
    } catch (err) {
      console.error("Error fetching data for current location:", err);
      toast.error("Failed to access your location");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePerformAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate ML analysis with a delay
    setTimeout(() => {
      // Convert form data to numeric values
      const metrics: Record<string, number> = {};
      Object.entries(formData).forEach(([key, value]) => {
        metrics[key] = parseFloat(value) || 0;
      });
      
      // Generate a deterministic AQI value based on the algorithm and metrics
      const aqiScore = calculateAQI(metrics, algorithm);
      
      // Generate simulated similar samples for comparison
      const similarities = generateSimilarities(metrics, algorithm);
      
      // Find best and worst matches
      const bestMatch = similarities[0];
      const worstMatch = similarities[similarities.length - 1];
      
      // Determine AQI classification
      const classification = getAQIClassification(aqiScore);
      
      setAnalysisResult({
        aqiScore,
        classification,
        similarities,
        bestMatch,
        worstMatch,
        metrics
      });
      
      setIsAnalyzing(false);
      
      toast.success(`Analysis completed using ${getAlgorithmName(algorithm)}`);
    }, 2000);
  };

  // Calculate AQI based on metrics and selected algorithm
  const calculateAQI = (metrics: Record<string, number>, algorithm: string): number => {
    // Different algorithms would have different weights and calculations
    // This is a simulation for demo purposes
    let baseAQI = 0;
    
    switch (algorithm) {
      case "random_forest":
        baseAQI = (metrics.pm25 * 3.0) + (metrics.pm10 * 1.5) + (metrics.no2 * 2.0) + (metrics.o3 * 2.5);
        break;
      case "svm":
        baseAQI = (metrics.pm25 * 3.5) + (metrics.pm10 * 1.2) + (metrics.no2 * 1.8) + (metrics.o3 * 2.7);
        break;
      case "knn":
        baseAQI = (metrics.pm25 * 2.8) + (metrics.pm10 * 1.7) + (metrics.no2 * 2.2) + (metrics.o3 * 2.3);
        break;
      case "naive_bayes":
        baseAQI = (metrics.pm25 * 3.2) + (metrics.pm10 * 1.4) + (metrics.no2 * 1.9) + (metrics.o3 * 2.4);
        break;
      case "rnn":
        baseAQI = (metrics.pm25 * 3.3) + (metrics.pm10 * 1.6) + (metrics.no2 * 2.1) + (metrics.o3 * 2.6);
        break;
      default:
        baseAQI = (metrics.pm25 * 3.0) + (metrics.pm10 * 1.5) + (metrics.no2 * 2.0) + (metrics.o3 * 2.5);
    }
    
    // Normalize to AQI scale (0-500)
    return Math.min(Math.round(baseAQI / 2), 500);
  };

  // Generate similar samples with different similarity scores
  const generateSimilarities = (metrics: Record<string, number>, algorithm: string) => {
    const samples = [];
    
    // Algorithm-specific similarity calculation
    const similarityMultiplier = 
      algorithm === "random_forest" ? 0.9 :
      algorithm === "svm" ? 0.85 :
      algorithm === "knn" ? 0.95 :
      algorithm === "naive_bayes" ? 0.8 :
      algorithm === "rnn" ? 0.88 : 0.9;
    
    // Generate 5 similar samples with decreasing similarity
    for (let i = 0; i < 5; i++) {
      const similarity = similarityMultiplier - (i * 0.15);
      
      // Create a sample with slightly different metrics
      const sampleMetrics: Record<string, number> = {};
      Object.entries(metrics).forEach(([key, value]) => {
        // Add some variation based on similarity
        const variation = (1 - similarity) * 20;
        sampleMetrics[key] = Math.max(0, value * (1 + ((Math.random() * 2 - 1) * variation / 100)));
      });
      
      samples.push({
        id: 1000 + i,
        similarity: Math.max(0, Math.min(1, similarity)),
        data: sampleMetrics
      });
    }
    
    // Sort by similarity (highest first)
    return samples.sort((a, b) => b.similarity - a.similarity);
  };

  const getAlgorithmName = (value: string): string => {
    const algorithm = ALGORITHM_OPTIONS.find(opt => opt.value === value);
    return algorithm ? algorithm.label : "Unknown Algorithm";
  };
  
  const getAQIClassification = (score: number) => {
    if (score <= 50) return { label: "Good", color: "text-green-500" };
    if (score <= 100) return { label: "Moderate", color: "text-yellow-500" };
    if (score <= 150) return { label: "Unhealthy for Sensitive Groups", color: "text-orange-500" };
    if (score <= 200) return { label: "Unhealthy", color: "text-red-500" };
    if (score <= 300) return { label: "Very Unhealthy", color: "text-purple-500" };
    return { label: "Hazardous", color: "text-rose-600" };
  };

  return (
    <div className="min-h-screen w-full pb-6 animate-gradient-shift">
      <div className="max-w-full mx-auto">
        <Header 
          airQualityData={airQualityData} 
          isLoading={isLoading} 
          onRefresh={loadDataForCurrentLocation}
        />
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center mb-6">
            <BrainCircuit className="h-6 w-6 mr-3 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">AQI Analysis Dashboard</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                  Input AQI Data
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Enter air quality metrics for analysis or fetch from your current location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {METRICS_INFO.slice(0, 9).map((metric) => (
                    <div key={metric.key} className="space-y-1">
                      <label className="text-xs text-white font-medium">{metric.label}</label>
                      <Input
                        value={formData[metric.key] || ''}
                        onChange={(e) => handleInputChange(metric.key, e.target.value)}
                        placeholder={`${metric.unit}`}
                        className="h-8 text-sm bg-white/10 border-white/10 text-white"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={loadDataForCurrentLocation} 
                  disabled={isLoading}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  Use Current Location
                </Button>
                
                <div className="flex gap-2">
                  <Select 
                    value={algorithm} 
                    onValueChange={setAlgorithm}
                  >
                    <SelectTrigger className="w-[180px] bg-white/10 border-white/10 text-white">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALGORITHM_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={handlePerformAnalysis} 
                    disabled={isAnalyzing || Object.keys(formData).length === 0}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BarChart4 className="h-4 w-4 mr-2" />
                    )}
                    Perform Analysis
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-400" />
                  Algorithm Information
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Learn about the selected machine learning algorithm
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ALGORITHM_OPTIONS.map(option => (
                  algorithm === option.value && (
                    <div key={option.value} className="space-y-4">
                      <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                        <h3 className="text-lg font-medium text-white mb-2">{option.label}</h3>
                        <p className="text-blue-300 text-sm">{option.description}</p>
                        
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center text-xs text-blue-300">
                            <ArrowRight className="h-3.5 w-3.5 mr-2 text-blue-400" />
                            <span>
                              {option.value === "random_forest" && "Uses multiple decision trees to improve accuracy and reduce overfitting"}
                              {option.value === "svm" && "Finds the optimal boundary between classes in high-dimensional space"}
                              {option.value === "knn" && "Classifies based on the majority class of the k nearest neighbors"}
                              {option.value === "naive_bayes" && "Uses probability and Bayes' theorem for classification tasks"}
                              {option.value === "rnn" && "Specialized for sequential data with memory of previous inputs"}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-xs text-blue-300">
                            <ArrowRight className="h-3.5 w-3.5 mr-2 text-blue-400" />
                            <span>
                              {option.value === "random_forest" && "Good for handling large datasets with higher dimensionality"}
                              {option.value === "svm" && "Effective in high dimensional spaces and memory efficient"}
                              {option.value === "knn" && "Simple implementation but computation cost increases with data size"}
                              {option.value === "naive_bayes" && "Fast training and evaluation with good results for text classification"}
                              {option.value === "rnn" && "Can learn patterns in temporal data like time series or natural language"}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-xs text-blue-300">
                            <AlertTriangle className="h-3.5 w-3.5 mr-2 text-yellow-400" />
                            <span>
                              {option.value === "random_forest" && "May be slower to train and more complex than single decision trees"}
                              {option.value === "svm" && "Can be sensitive to the choice of kernel function and parameters"}
                              {option.value === "knn" && "Requires feature scaling and is sensitive to irrelevant features"}
                              {option.value === "naive_bayes" && "Assumes independence of features which may not hold true"}
                              {option.value === "rnn" && "Prone to vanishing/exploding gradient problems in deep architectures"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-blue-300/70 italic">
                        Note: This is a simulated demonstration. In a production environment, this would connect to a real machine learning backend.
                      </div>
                    </div>
                  )
                ))}
              </CardContent>
            </Card>
          </div>
          
          <AQIDataTable data={SAMPLE_DATA} />
          
          {analysisResult && (
            <div className="mt-8">
              <AQIAnalysisResult result={analysisResult} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AQIAnalysis;
