
import React from "react";
import { BrainCircuit, Info } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Algorithm {
  value: string;
  label: string;
  description: string;
  strengths: string[];
  limitations: string[];
}

interface MLAlgorithmSelectorProps {
  selectedAlgorithm: string;
  onAlgorithmChange: (value: string) => void;
}

const ALGORITHMS: Algorithm[] = [
  {
    value: "random_forest",
    label: "Random Forest",
    description: "An ensemble learning method using multiple decision trees",
    strengths: [
      "Handles large datasets with higher dimensionality",
      "Reduces overfitting compared to single decision trees",
      "Provides feature importance metrics"
    ],
    limitations: [
      "Slower training than simple models",
      "Less interpretable than single decision trees",
      "May require parameter tuning for optimal results"
    ]
  },
  {
    value: "svm",
    label: "Support Vector Machine (SVM)",
    description: "Finds the optimal hyperplane to separate classes",
    strengths: [
      "Effective in high dimensional spaces",
      "Memory efficient due to use of support vectors",
      "Versatile through different kernel functions"
    ],
    limitations: [
      "Sensitive to choice of kernel and parameters",
      "Can be slow to train on large datasets",
      "Less effective when classes overlap significantly"
    ]
  },
  {
    value: "knn",
    label: "K-Nearest Neighbors (KNN)",
    description: "Classifies based on proximity to training examples",
    strengths: [
      "Simple implementation and easy to understand",
      "No training phase required",
      "Naturally handles multi-class problems"
    ],
    limitations: [
      "Computational cost increases with data size",
      "Requires feature scaling",
      "Sensitive to irrelevant features and outliers"
    ]
  },
  {
    value: "naive_bayes",
    label: "Naïve Bayes",
    description: "Probabilistic classifier based on Bayes' theorem",
    strengths: [
      "Fast training and prediction",
      "Works well with high-dimensional data",
      "Requires less training data than many models"
    ],
    limitations: [
      "Assumes independence of features (naive assumption)",
      "Can be outperformed by more sophisticated models",
      "Sensitive to input data characteristics"
    ]
  },
  {
    value: "rnn",
    label: "Recurrent Neural Network (RNN)",
    description: "Neural network designed for sequential data",
    strengths: [
      "Well-suited for time series and sequential data",
      "Can remember previous inputs through internal state",
      "Flexible architecture for different problem types"
    ],
    limitations: [
      "Prone to vanishing/exploding gradient problems",
      "Training can be computationally intensive",
      "May require large amounts of data for good performance"
    ]
  }
];

const MLAlgorithmSelector: React.FC<MLAlgorithmSelectorProps> = ({
  selectedAlgorithm,
  onAlgorithmChange
}) => {
  const getSelectedAlgorithm = () => {
    return ALGORITHMS.find(algo => algo.value === selectedAlgorithm) || ALGORITHMS[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-medium text-white">Select ML Algorithm</h3>
        <HoverCard>
          <HoverCardTrigger asChild>
            <button className="rounded-full w-5 h-5 inline-flex items-center justify-center bg-blue-500/20 text-blue-300">
              <Info className="h-3.5 w-3.5" />
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 backdrop-blur-lg bg-black/60 border-white/10 text-white">
            <div className="space-y-2">
              <h4 className="font-medium">Machine Learning Algorithms</h4>
              <p className="text-sm text-blue-300">
                Each algorithm has different strengths and is suited for different types of data and analytical goals.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select value={selectedAlgorithm} onValueChange={onAlgorithmChange}>
            <SelectTrigger className="w-full bg-white/10 border-white/10 text-white">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              {ALGORITHMS.map(algorithm => (
                <SelectItem key={algorithm.value} value={algorithm.value}>
                  {algorithm.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-lg bg-white/5 p-3 border border-white/10">
          <h4 className="text-sm font-medium text-white mb-1">{getSelectedAlgorithm().label}</h4>
          <p className="text-xs text-blue-300 mb-2">{getSelectedAlgorithm().description}</p>
          
          <div className="text-xs text-blue-300/70 italic">
            Select an algorithm to use for AQI data analysis
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLAlgorithmSelector;
