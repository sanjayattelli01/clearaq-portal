
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  BrainCircuit, Sliders, Activity, Database, 
  GitBranch, Network, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import Header from "@/components/Header";
import SupabaseSetupGuide from "@/components/SupabaseSetupGuide";
import MLAlgorithmSelector from "@/components/MLAlgorithmSelector";

interface AlgorithmConfig {
  [key: string]: {
    [param: string]: number;
  };
}

const defaultConfigs: AlgorithmConfig = {
  random_forest: {
    n_estimators: 100,
    max_depth: 10,
    min_samples_split: 2,
    min_samples_leaf: 1
  },
  svm: {
    C: 1.0,
    gamma: 0.1,
    kernel: 0 // 0: linear, 1: poly, 2: rbf, 3: sigmoid
  },
  knn: {
    n_neighbors: 5,
    weights: 0, // 0: uniform, 1: distance
    algorithm: 0 // 0: auto, 1: ball_tree, 2: kd_tree, 3: brute
  },
  naive_bayes: {
    var_smoothing: 1e-9
  },
  rnn: {
    hidden_size: 64,
    num_layers: 2,
    dropout: 0.2,
    learning_rate: 0.001,
    batch_size: 32
  }
};

const MLConfig: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("random_forest");
  const [config, setConfig] = useState<AlgorithmConfig>(defaultConfigs);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleConfigChange = (param: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      [selectedAlgorithm]: {
        ...prev[selectedAlgorithm],
        [param]: value
      }
    }));
  };
  
  const handleSaveConfig = () => {
    setIsSaving(true);
    
    // Simulate saving to backend
    setTimeout(() => {
      toast.success(`${getAlgorithmName(selectedAlgorithm)} configuration saved successfully`);
      setIsSaving(false);
    }, 1000);
  };
  
  const getAlgorithmName = (value: string): string => {
    const names: Record<string, string> = {
      random_forest: "Random Forest",
      svm: "Support Vector Machine",
      knn: "K-Nearest Neighbors",
      naive_bayes: "Naïve Bayes",
      rnn: "Recurrent Neural Network"
    };
    
    return names[value] || value;
  };
  
  const getParamDescription = (param: string): string => {
    const descriptions: Record<string, string> = {
      // Random Forest
      n_estimators: "Number of trees in the forest",
      max_depth: "Maximum depth of the tree",
      min_samples_split: "Minimum samples required to split an internal node",
      min_samples_leaf: "Minimum samples required to be at a leaf node",
      
      // SVM
      C: "Regularization parameter",
      gamma: "Kernel coefficient",
      kernel: "Type of kernel",
      
      // KNN
      n_neighbors: "Number of neighbors",
      weights: "Weight function used in prediction",
      algorithm: "Algorithm used to compute nearest neighbors",
      
      // Naive Bayes
      var_smoothing: "Portion of the largest variance of all features that is added to variances",
      
      // RNN
      hidden_size: "Number of features in the hidden state",
      num_layers: "Number of recurrent layers",
      dropout: "Dropout rate",
      learning_rate: "Learning rate for optimization",
      batch_size: "Mini-batch size for training"
    };
    
    return descriptions[param] || "Parameter configuration";
  };
  
  const renderParamInput = (param: string, value: number) => {
    if (param === "kernel") {
      const options = ["Linear", "Polynomial", "RBF", "Sigmoid"];
      return (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {options.map((opt, idx) => (
            <Button
              key={idx}
              variant={value === idx ? "default" : "outline"}
              size="sm"
              className={
                value === idx 
                  ? "bg-blue-500 hover:bg-blue-600" 
                  : "border-white/20 text-white hover:bg-white/10"
              }
              onClick={() => handleConfigChange(param, idx)}
            >
              {opt}
            </Button>
          ))}
        </div>
      );
    }
    
    if (param === "weights") {
      const options = ["Uniform", "Distance"];
      return (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {options.map((opt, idx) => (
            <Button
              key={idx}
              variant={value === idx ? "default" : "outline"}
              size="sm"
              className={
                value === idx 
                  ? "bg-blue-500 hover:bg-blue-600" 
                  : "border-white/20 text-white hover:bg-white/10"
              }
              onClick={() => handleConfigChange(param, idx)}
            >
              {opt}
            </Button>
          ))}
        </div>
      );
    }
    
    if (param === "algorithm") {
      const options = ["Auto", "Ball Tree", "KD Tree", "Brute Force"];
      return (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {options.map((opt, idx) => (
            <Button
              key={idx}
              variant={value === idx ? "default" : "outline"}
              size="sm"
              className={
                value === idx 
                  ? "bg-blue-500 hover:bg-blue-600" 
                  : "border-white/20 text-white hover:bg-white/10"
              }
              onClick={() => handleConfigChange(param, idx)}
            >
              {opt}
            </Button>
          ))}
        </div>
      );
    }
    
    // For numeric parameters with slider
    const getSliderConfig = (param: string) => {
      switch (param) {
        case "n_estimators":
          return { min: 10, max: 500, step: 10 };
        case "max_depth":
          return { min: 1, max: 30, step: 1 };
        case "min_samples_split":
          return { min: 2, max: 10, step: 1 };
        case "min_samples_leaf":
          return { min: 1, max: 5, step: 1 };
        case "C":
          return { min: 0.1, max: 10, step: 0.1 };
        case "gamma":
          return { min: 0.01, max: 1, step: 0.01 };
        case "n_neighbors":
          return { min: 1, max: 20, step: 1 };
        case "var_smoothing":
          return { min: -10, max: -5, step: 1, log: true };
        case "hidden_size":
          return { min: 16, max: 256, step: 16 };
        case "num_layers":
          return { min: 1, max: 5, step: 1 };
        case "dropout":
          return { min: 0, max: 0.5, step: 0.05 };
        case "learning_rate":
          return { min: 0.0001, max: 0.01, step: 0.0001, log: true };
        case "batch_size":
          return { min: 8, max: 128, step: 8 };
        default:
          return { min: 0, max: 100, step: 1 };
      }
    };
    
    const { min, max, step, log } = getSliderConfig(param);
    
    // Special handling for log-scale parameters
    const displayValue = log ? Math.pow(10, value) : value;
    const handleSliderChange = (newValue: number[]) => {
      handleConfigChange(param, log ? Math.log10(newValue[0]) : newValue[0]);
    };
    
    return (
      <div className="space-y-2 mt-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-300">{min}</span>
          <span className="text-sm text-blue-300">{max}</span>
        </div>
        <Slider
          value={[log ? Math.pow(10, value) : value]}
          min={log ? Math.pow(10, min) : min}
          max={log ? Math.pow(10, max) : max}
          step={log ? undefined : step}
          onValueChange={handleSliderChange}
          className="my-2"
        />
        <Input
          type="number"
          value={displayValue}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            if (!isNaN(newValue)) {
              handleConfigChange(param, log ? Math.log10(newValue) : newValue);
            }
          }}
          className="h-8 text-sm bg-white/10 border-white/10 text-white"
        />
      </div>
    );
  };
  
  return (
    <div className="min-h-screen w-full pb-6 animate-gradient-shift">
      <Header isLoading={false} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center mb-6">
          <BrainCircuit className="h-6 w-6 mr-3 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">ML Algorithm Configuration</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-blue-400" />
                  Algorithm Parameters
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Configure the parameters for the selected machine learning algorithm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <MLAlgorithmSelector
                    selectedAlgorithm={selectedAlgorithm}
                    onAlgorithmChange={setSelectedAlgorithm}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Object.entries(config[selectedAlgorithm]).map(([param, value]) => (
                    <div key={param} className="space-y-1.5">
                      <Label className="text-white flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-blue-400" />
                        {param.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Label>
                      <div className="text-xs text-blue-300 mb-2">
                        {getParamDescription(param)}
                      </div>
                      {renderParamInput(param, value)}
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isSaving ? (
                      <>
                        <Activity className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-blue-400" />
                  Algorithm Flow
                </CardTitle>
                <CardDescription className="text-blue-300">
                  How {getAlgorithmName(selectedAlgorithm)} processes the air quality data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                  {selectedAlgorithm === "random_forest" && (
                    <div className="text-sm text-blue-300 space-y-3">
                      <p>1. Data is split into training and testing sets</p>
                      <p>2. The algorithm creates {config.random_forest.n_estimators} decision trees</p>
                      <p>3. Each tree is built with a maximum depth of {config.random_forest.max_depth}</p>
                      <p>4. The final prediction is an aggregation of all tree predictions</p>
                      <p>5. Result is mapped to AQI categories based on predicted values</p>
                    </div>
                  )}
                  
                  {selectedAlgorithm === "svm" && (
                    <div className="text-sm text-blue-300 space-y-3">
                      <p>1. Data is normalized to ensure all features are on the same scale</p>
                      <p>2. The algorithm finds optimal hyperplanes to separate the data</p>
                      <p>3. Using {["linear", "polynomial", "RBF", "sigmoid"][config.svm.kernel]} kernel with C={config.svm.C} and gamma={config.svm.gamma}</p>
                      <p>4. Support vectors are identified to optimize the margin</p>
                      <p>5. Predictions are made based on the position relative to the hyperplanes</p>
                    </div>
                  )}
                  
                  {selectedAlgorithm === "knn" && (
                    <div className="text-sm text-blue-300 space-y-3">
                      <p>1. Data is normalized to ensure consistent distance measurements</p>
                      <p>2. For each new data point, the algorithm finds the {config.knn.n_neighbors} nearest neighbors</p>
                      <p>3. Using {["uniform", "distance"][config.knn.weights]} weights for prediction</p>
                      <p>4. The prediction is based on the majority class of neighboring points</p>
                      <p>5. AQI classification is determined from the predicted values</p>
                    </div>
                  )}
                  
                  {selectedAlgorithm === "naive_bayes" && (
                    <div className="text-sm text-blue-300 space-y-3">
                      <p>1. The algorithm calculates the probability of each class given the features</p>
                      <p>2. Uses Bayes' theorem with the "naive" assumption that features are independent</p>
                      <p>3. Variance smoothing parameter: {Math.pow(10, config.naive_bayes.var_smoothing).toExponential()} helps prevent zero probabilities</p>
                      <p>4. Classification is based on the highest probability across all classes</p>
                      <p>5. AQI values are determined from the class probabilities</p>
                    </div>
                  )}
                  
                  {selectedAlgorithm === "rnn" && (
                    <div className="text-sm text-blue-300 space-y-3">
                      <p>1. Time-series data is processed in sequential order with memory of previous states</p>
                      <p>2. Network contains {config.rnn.num_layers} layers with {config.rnn.hidden_size} hidden units</p>
                      <p>3. Dropout rate of {config.rnn.dropout} prevents overfitting</p>
                      <p>4. Training uses batches of size {config.rnn.batch_size} with learning rate {config.rnn.learning_rate.toExponential()}</p>
                      <p>5. The model captures temporal patterns in air quality data for accurate prediction</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <SupabaseSetupGuide />
            
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="h-5 w-5 text-blue-400" />
                  Integration Status
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Connection status to ML infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md bg-black/20 p-3 flex items-start gap-3">
                    <Database className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-white">Database Connection</h4>
                      <p className="text-xs text-yellow-300 mt-1">
                        Not connected to Supabase. Please set up your database integration.
                      </p>
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-black/20 p-3 flex items-start gap-3">
                    <BrainCircuit className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-white">ML Model Status</h4>
                      <p className="text-xs text-yellow-300 mt-1">
                        Simulation mode active. Connect to Supabase for actual model training and inference.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      onClick={() => navigate("/analysis")}
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Go to Analysis Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLConfig;
