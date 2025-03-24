
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { AlertCircle, CheckCircle, Database, GitCompare } from "lucide-react";

interface AQIAnalysisResultProps {
  result: {
    aqiScore: number;
    classification: {
      label: string;
      color: string;
    };
    algorithm?: string;
    algorithmDescription?: string;
    similarities: Array<{
      id: number;
      similarity: number;
      data: any;
    }>;
    bestMatch: {
      id: number;
      similarity: number;
      data: any;
    };
    worstMatch: {
      id: number;
      similarity: number;
      data: any;
    };
    metrics: Record<string, number>;
  };
}

const AQIAnalysisResult: React.FC<AQIAnalysisResultProps> = ({ result }) => {
  // Prepare efficiency distribution data for pie chart
  const prepareEfficiencyDistribution = () => {
    const categories = ["Low", "Moderate", "High", "Very High"];
    const counts: Record<string, number> = { "Low": 0, "Moderate": 0, "High": 0, "Very High": 0 };
    
    // Count occurrences of each category in similarities
    result.similarities.forEach(item => {
      if (item.data.efficiency_category && counts[item.data.efficiency_category] !== undefined) {
        counts[item.data.efficiency_category]++;
      }
    });
    
    return categories.map(category => ({
      name: category,
      value: counts[category]
    }));
  };

  // Prepare comparison data for bar chart
  const prepareComparisonData = () => {
    if (!result.bestMatch || !result.metrics) return [];
    
    const keyMetrics = ["pm25", "pm10", "no2", "o3"];
    return keyMetrics.map(metric => ({
      name: metric.toUpperCase(),
      current: result.metrics[metric] || 0,
      bestMatch: result.bestMatch.data[metric] || 0
    }));
  };

  // Prepare similarity data for bar chart
  const prepareSimilarityData = () => {
    return result.similarities.slice(0, 5).map(item => ({
      id: item.id,
      similarity: Math.round(item.similarity * 100),
      category: item.data.efficiency_category || "Unknown"
    }));
  };

  const efficiencyDistribution = prepareEfficiencyDistribution();
  const comparisonData = prepareComparisonData();
  const similarityData = prepareSimilarityData();

  // Colors for pie chart
  const COLORS = ["#FF8042", "#FFBB28", "#00C49F", "#0088FE"];
  
  // Get color based on efficiency category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Low": return "#FF8042";
      case "Moderate": return "#FFBB28";
      case "High": return "#00C49F";
      case "Very High": return "#0088FE";
      default: return "#888888";
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">AQI Score</CardTitle>
            <CardDescription>Analysis result</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">{result.aqiScore}</div>
            <div className={`mt-1 font-medium ${result.classification.color}`}>
              {result.classification.label}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Algorithm</CardTitle>
            <CardDescription>ML method used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-white">
              {result.algorithm === 'naive-bayes' && 'Naive Bayes'}
              {result.algorithm === 'knn' && 'K-Nearest Neighbors'}
              {result.algorithm === 'svm' && 'Support Vector Machine'}
              {result.algorithm === 'random-forest' && 'Random Forest'}
              {!result.algorithm && 'Standard Analysis'}
            </div>
            <div className="mt-1 text-sm text-blue-300">
              {result.algorithmDescription || 'Multi-factor weighted analysis'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Best Match</CardTitle>
            <CardDescription>Highest similarity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold text-white">
                  {Math.round(result.bestMatch.similarity * 100)}%
                </div>
                <div className="mt-1 text-sm text-blue-300">
                  Similarity score
                </div>
              </div>
              <Badge 
                className={`${getCategoryColor(result.bestMatch.data.efficiency_category)} bg-opacity-20 text-white`}
              >
                {result.bestMatch.data.efficiency_category || "Unknown"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Efficiency</CardTitle>
            <CardDescription>Based on best match</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              {result.bestMatch.data.efficiency || "N/A"}
            </div>
            <div className="mt-1 text-sm text-blue-300">
              Out of 100
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Key Metrics Comparison
            </CardTitle>
            <CardDescription>
              Your data vs best match
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="current" name="Your Data" fill="#8884d8" />
                  <Bar dataKey="bestMatch" name="Best Match" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5" />
              Efficiency Distribution
            </CardTitle>
            <CardDescription>
              Across similar data points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={efficiencyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {efficiencyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Top 5 Similar Data Points
          </CardTitle>
          <CardDescription>
            Similarity scores and categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={similarityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" domain={[0, 100]} stroke="#888" />
                <YAxis dataKey="id" type="category" stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value, name, props) => {
                    if (name === 'similarity') {
                      return [`${value}%`, 'Similarity'];
                    }
                    return [value, name];
                  }}
                />
                <Bar 
                  dataKey="similarity" 
                  name="Similarity" 
                  fill="#8884d8"
                  background={{ fill: '#333' }}
                >
                  {similarityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getCategoryColor(entry.category)} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Analysis Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-blue-300 space-y-2">
            <p>
              This analysis was performed using the 
              <span className="font-semibold mx-1">
                {result.algorithm === 'naive-bayes' && 'Naive Bayes'}
                {result.algorithm === 'knn' && 'K-Nearest Neighbors'}
                {result.algorithm === 'svm' && 'Support Vector Machine'}
                {result.algorithm === 'random-forest' && 'Random Forest'}
                {!result.algorithm && 'Standard Analysis'}
              </span> 
              algorithm against the available database records.
            </p>
            <p>
              The AQI score of <span className="font-semibold">{result.aqiScore}</span> indicates 
              <span className={`font-semibold mx-1 ${result.classification.color}`}>
                {result.classification.label}
              </span> 
              air quality conditions.
            </p>
            <p>
              The data shows a predicted efficiency of <span className="font-semibold">{result.bestMatch.data.efficiency}</span>,
              which falls into the <span className="font-semibold">{result.bestMatch.data.efficiency_category}</span> category.
            </p>
            <p>
              For more accurate results, consider collecting additional data points or refining the algorithm parameters.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AQIAnalysisResult;
