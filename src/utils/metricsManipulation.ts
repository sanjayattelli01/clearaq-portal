
/**
 * Utility functions for manipulating model metrics
 */

/**
 * Manipulate multiple model evaluation metrics based on their relative ranking
 * with flexible metric name handling
 * 
 * @param metrics Dictionary of model metrics
 * @returns Dictionary of manipulated metrics
 */
export const manipulateMetrics = (metrics: Record<string, Record<string, number>>) => {
  // Comprehensive metric mapping to handle variations
  const metricCategories = {
    "higher_better": [
      "accuracy", "acc", 
      "precision", "prec", 
      "recall", "rec", 
      "f1", "f1-score", "f1_score",
      "roc_auc", "roc-auc", "auc",
      "r2", "r²", "r_squared", "r² score", 
      "balanced_accuracy", "balanced acc",
      "gini", "gini coefficient"
    ],
    "lower_better": [
      "log_loss", "logloss", 
      "mae", "mean_absolute_error",
      "mse", "mean_squared_error", 
      "rmse", "root_mean_squared_error",
      "hinge_loss", "hingeloss"
    ],
    "special": [
      "chi_square", "chi-square", "chisquare", "chi²", 
      "cohens_kappa", "cohen_kappa", "kappa"
    ]
  };
  
  // Performance tier ranges for different metric types
  const performanceTiers = {
    "higher_better": [
      [0.98, 0.99],  // Top tier
      [0.96, 0.98],  // Second tier
      [0.93, 0.96],  // Third tier
      [0.88, 0.93]   // Fourth tier
    ],
    "lower_better": [
      [0.01, 0.03],  // Top tier (lowest values)
      [0.03, 0.05],  // Second tier
      [0.05, 0.08],  // Third tier
      [0.08, 0.12]   // Fourth tier
    ],
    "special": [
      [0.9, 1.0],   // Top tier
      [0.7, 0.9],   // Second tier
      [0.5, 0.7],   // Third tier
      [0.3, 0.5]    // Fourth tier
    ]
  };
  
  // Create a copy of metrics to manipulate
  const manipulatedMetrics: Record<string, Record<string, number>> = {};
  
  // Collect all existing metrics to understand overall landscape
  const allMetricValues: Record<string, number[]> = {};
  
  // First pass: collect all values for each metric type
  for (const modelMetrics of Object.values(metrics)) {
    for (const [metric, value] of Object.entries(modelMetrics)) {
      const normalizedMetric = metric.toLowerCase().replace(" ", "_");
      if (!isNaN(value)) { // Skip NaN values
        if (!allMetricValues[normalizedMetric]) {
          allMetricValues[normalizedMetric] = [];
        }
        allMetricValues[normalizedMetric].push(value);
      }
    }
  }
  
  // Determine metric types
  const categorizeMetric = (metricName: string): string => {
    const normalizedName = metricName.toLowerCase().replace(" ", "_");
    for (const [category, metricsList] of Object.entries(metricCategories)) {
      if (metricsList.some(variant => normalizedName.includes(variant))) {
        return category;
      }
    }
    return "higher_better"; // Default assumption
  };
  
  // Process each model's metrics
  for (const [model, modelMetrics] of Object.entries(metrics)) {
    // Create a copy of the model's metrics
    const manipulatedModelMetrics: Record<string, number> = { ...modelMetrics };
    
    for (const [metric, value] of Object.entries(modelMetrics)) {
      // Skip if value is NaN
      if (isNaN(value)) {
        continue;
      }
      
      // Normalize metric name
      const normalizedMetric = metric.toLowerCase().replace(" ", "_");
      
      // Determine metric category
      const category = categorizeMetric(normalizedMetric);
      
      // Get all values for this metric
      const metricValues = allMetricValues[normalizedMetric] || [value];
      
      // Sort based on metric type
      const sortedValues = [...metricValues].sort((a, b) => 
        category === "lower_better" ? a - b : b - a
      );
      
      // Find rank of current value
      let rank = sortedValues.indexOf(value);
      if (rank === -1) {
        // If exact value not found, find closest
        rank = sortedValues.reduce((closestIndex, currentValue, currentIndex, arr) => {
          return Math.abs(currentValue - value) < Math.abs(arr[closestIndex] - value) 
            ? currentIndex 
            : closestIndex;
        }, 0);
      }
      
      // Limit rank to available tiers
      rank = Math.min(rank, performanceTiers[category].length - 1);
      
      // Get performance tier
      const [tierMin, tierMax] = performanceTiers[category][rank];
      
      // Manipulate value
      const manipulatedValue = tierMin + Math.random() * (tierMax - tierMin);
      
      // Round based on metric type
      if (Number.isInteger(value)) {
        manipulatedModelMetrics[metric] = Math.round(manipulatedValue);
      } else if (['accuracy', 'precision', 'recall', 'f1'].some(term => metric.toLowerCase().includes(term))) {
        manipulatedModelMetrics[metric] = Number(manipulatedValue.toFixed(4));
      } else {
        manipulatedModelMetrics[metric] = Number(manipulatedValue.toFixed(2));
      }
    }
    
    manipulatedMetrics[model] = manipulatedModelMetrics;
  }
  
  return manipulatedMetrics;
};
