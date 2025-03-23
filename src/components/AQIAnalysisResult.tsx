
import React from "react";
import { AlertCircle, ThumbsUp, ThumbsDown, BadgeInfo, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { METRICS_INFO } from "@/utils/types";

interface AQIAnalysisResultProps {
  result: {
    aqiScore: number;
    classification: { label: string; color: string };
    similarities: Array<{ id: number; similarity: number; data: any }>;
    bestMatch: { id: number; similarity: number; data: any };
    worstMatch: { id: number; similarity: number; data: any };
    metrics: Record<string, number>;
  };
}

const AQIAnalysisResult: React.FC<AQIAnalysisResultProps> = ({ result }) => {
  const getAQIColor = (score: number): string => {
    if (score <= 50) return "bg-green-500";
    if (score <= 100) return "bg-yellow-500";
    if (score <= 150) return "bg-orange-500";
    if (score <= 200) return "bg-red-500";
    if (score <= 300) return "bg-purple-500";
    return "bg-rose-600";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1 p-6 glass-card border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">AQI Score Analysis</h3>
          </div>
          
          <div className="flex flex-col items-center justify-center pt-4">
            <div className="relative w-40 h-40 mb-6">
              <div className="absolute inset-0 rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center">
                <div className={`absolute inset-2 rounded-full ${getAQIColor(result.aqiScore)} opacity-20`}></div>
                <span className="text-4xl font-bold text-white">{result.aqiScore}</span>
              </div>
            </div>
            
            <h4 className={`text-2xl font-bold ${result.classification.color} mb-2`}>
              {result.classification.label}
            </h4>
            
            <p className="text-center text-blue-300 text-sm max-w-md">
              The calculated Air Quality Index based on provided metrics and advanced analysis
              with Random Forest algorithm.
            </p>
          </div>
        </Card>
        
        <Card className="flex-1 p-6 glass-card border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <BadgeInfo className="h-5 w-5 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Key Findings</h3>
          </div>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="mt-0.5">
                <ThumbsUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Best Match (Sample #{result.bestMatch.id})</h4>
                <p className="text-sm text-blue-300">
                  {(result.bestMatch.similarity * 100).toFixed(2)}% similarity score
                  {result.bestMatch.similarity > 0.7 ? 
                    " - Strong correlation found!" : 
                    result.bestMatch.similarity > 0.5 ? 
                      " - Moderate correlation" : 
                      " - Weak correlation"}
                </p>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <div className="mt-0.5">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Primary Concerns</h4>
                <p className="text-sm text-blue-300">
                  {getPrimaryConcerns(result.metrics)}
                </p>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <div className="mt-0.5">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Analysis Confidence</h4>
                <p className="text-sm text-blue-300">
                  {getConfidenceLevel(result.similarities)}
                </p>
              </div>
            </li>
          </ul>
        </Card>
      </div>
      
      <Card className="p-6 glass-card border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <ThumbsUp className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Similarity Analysis</h3>
        </div>
        
        <div className="rounded-md border border-white/10 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5">
                <TableHead className="text-white">Sample #</TableHead>
                <TableHead className="text-white">Similarity</TableHead>
                {METRICS_INFO.slice(0, 5).map(metric => (
                  <TableHead key={metric.key} className="text-white">
                    {metric.label}
                  </TableHead>
                ))}
                <TableHead className="text-white">...</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-white/10 text-white font-medium">
                <TableCell>Current</TableCell>
                <TableCell>-</TableCell>
                {METRICS_INFO.slice(0, 5).map(metric => (
                  <TableCell key={metric.key}>
                    {result.metrics[metric.key]?.toFixed(2) || 'N/A'}
                  </TableCell>
                ))}
                <TableCell>...</TableCell>
              </TableRow>
              
              {result.similarities.slice(0, 3).map((item) => (
                <TableRow key={item.id} className="hover:bg-white/5">
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{(item.similarity * 100).toFixed(2)}%</TableCell>
                  {METRICS_INFO.slice(0, 5).map(metric => (
                    <TableCell key={metric.key}>
                      {item.data[metric.key]?.toFixed(2) || 'N/A'}
                    </TableCell>
                  ))}
                  <TableCell>...</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-blue-300/70 italic">
          Note: Only showing top 3 most similar samples and select metrics for readability
        </div>
      </Card>
    </div>
  );
};

// Utility functions for analysis
const getPrimaryConcerns = (metrics: Record<string, number>): string => {
  const concerns = [];
  
  // Check PM2.5
  if (metrics.pm25 > 35) {
    concerns.push("High PM2.5 levels");
  }
  
  // Check PM10
  if (metrics.pm10 > 150) {
    concerns.push("Elevated PM10 concentration");
  }
  
  // Check Ozone
  if (metrics.o3 > 70) {
    concerns.push("Unhealthy Ozone levels");
  }
  
  // Check NO2
  if (metrics.no2 > 100) {
    concerns.push("High NO2 concentration");
  }
  
  if (concerns.length === 0) {
    return "No significant pollutant concerns detected";
  }
  
  return concerns.join(", ");
};

const getConfidenceLevel = (
  similarities: Array<{ id: number; similarity: number; data: any }>
): string => {
  const topSimilarities = similarities.slice(0, 3).map(s => s.similarity);
  const avgSimilarity = topSimilarities.reduce((sum, val) => sum + val, 0) / topSimilarities.length;
  
  if (avgSimilarity > 0.8) {
    return "Very High - Strong correlation with reference data";
  } else if (avgSimilarity > 0.6) {
    return "High - Good match with reference samples";
  } else if (avgSimilarity > 0.4) {
    return "Moderate - Some uncertainty in analysis";
  } else {
    return "Low - Analysis contains significant uncertainty";
  }
};

export default AQIAnalysisResult;
