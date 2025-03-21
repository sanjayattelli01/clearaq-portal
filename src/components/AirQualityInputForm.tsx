
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { METRICS_INFO } from "@/utils/types";

interface AirQualityInputFormProps {
  onSubmit: (data: Record<string, number>) => void;
  onUseCurrentLocation: () => void;
  isLoading: boolean;
}

const AirQualityInputForm: React.FC<AirQualityInputFormProps> = ({
  onSubmit,
  onUseCurrentLocation,
  isLoading
}) => {
  const [formValues, setFormValues] = useState<Record<string, number | string>>({});

  const handleInputChange = (key: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to numbers
    const numericValues: Record<string, number> = {};
    Object.keys(formValues).forEach(key => {
      const value = formValues[key];
      numericValues[key] = typeof value === 'string' ? parseFloat(value) || 0 : value;
    });
    
    onSubmit(numericValues);
  };

  // Group metrics into pollutants and meteorological parameters
  const pollutants = METRICS_INFO.filter(metric => 
    ['pm25', 'pm10', 'no', 'no2', 'nox', 'nh3', 'so2', 'co', 'o3', 'benzene'].includes(metric.key)
  );
  
  const meteorological = METRICS_INFO.filter(metric => 
    ['humidity', 'wind_speed', 'wind_direction', 'solar_radiation', 'rainfall', 'temperature'].includes(metric.key)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <div className="bg-blue-500 rounded-full p-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19C16.4183 19 20 15.4183 20 11C20 6.58172 16.4183 3 12 3C7.58172 3 4 6.58172 4 11C4 15.4183 7.58172 19 12 19Z" />
                    <path d="M12 19V22" />
                    <path d="M12 3V0" />
                    <path d="M3 11H0" />
                    <path d="M24 11H21" />
                  </svg>
                </div>
                Pollutant Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pollutants.map((metric) => (
                  <div key={metric.key} className="space-y-1">
                    <div className="flex items-center text-sm text-blue-700">
                      {getIconForMetric(metric.key, "text-blue-500")}
                      <span className="ml-1">{metric.label}</span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formValues[metric.key] || ""}
                        onChange={(e) => handleInputChange(metric.key, e.target.value)}
                        className="pr-12 bg-white/80"
                        step="0.01"
                        min="0"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        {metric.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <div className="bg-purple-500 rounded-full p-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1V3" />
                    <path d="M12 21V23" />
                    <path d="M4.22 4.22L5.64 5.64" />
                    <path d="M18.36 18.36L19.78 19.78" />
                    <path d="M1 12H3" />
                    <path d="M21 12H23" />
                    <path d="M4.22 19.78L5.64 18.36" />
                    <path d="M18.36 5.64L19.78 4.22" />
                  </svg>
                </div>
                Meteorological Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {meteorological.map((metric) => (
                  <div key={metric.key} className="space-y-1">
                    <div className="flex items-center text-sm text-purple-700">
                      {getIconForMetric(metric.key, "text-purple-500")}
                      <span className="ml-1">{metric.label}</span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formValues[metric.key] || ""}
                        onChange={(e) => handleInputChange(metric.key, e.target.value)}
                        className="pr-12 bg-white/80"
                        step="0.01"
                        min="0"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        {metric.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-6 gap-4">
          <Button
            type="button"
            onClick={onUseCurrentLocation}
            variant="outline"
            className="w-1/2 max-w-xs"
            disabled={isLoading}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Use Current Location
          </Button>
          <Button 
            type="submit" 
            className="w-1/2 max-w-xs bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit Data
          </Button>
        </div>
      </form>
    </div>
  );
};

// Helper function to render icons for different metrics
function getIconForMetric(metricKey: string, className: string = "") {
  const iconSize = "h-4 w-4";
  const iconClass = `${iconSize} ${className}`;
  
  switch (metricKey) {
    case 'pm25':
    case 'pm10':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <circle cx="18" cy="9" r="2" />
          <circle cx="9" cy="15" r="1.5" />
          <circle cx="14" cy="17" r="1" />
          <circle cx="7" cy="8" r="1" />
        </svg>
      );
    case 'no':
    case 'no2':
    case 'nox':
    case 'nh3':
    case 'so2':
      return <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.5 19a2.5 2.5 0 1 0 0-5H6.5a2.5 2.5 0 1 1 0-5H17" />
        <path d="M12 19v3" />
        <path d="M12 2v3" />
      </svg>;
    case 'co':
    case 'benzene':
      return <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 8C20.1046 8 21 8.89543 21 10V10C21 11.1046 20.1046 12 19 12H5C3.89543 12 3 11.1046 3 10V10C3 8.89543 3.89543 8 5 8H19Z" />
        <path d="M14 4.5V7.5" />
        <path d="M14 12.5V19.5" />
        <path d="M10 4.5V19.5" />
        <path d="M6 4.5V7.5" />
        <path d="M6 12.5V19.5" />
        <path d="M18 4.5V7.5" />
        <path d="M18 12.5V19.5" />
      </svg>;
    case 'o3':
      return <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v6" />
        <circle cx="12" cy="14" r="6" />
      </svg>;
    case 'humidity':
      return <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>;
    case 'wind_speed':
    case 'wind_direction':
      return <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.5 19a2.5 2.5 0 1 0 0-5H6.5a2.5 2.5 0 1 1 0-5H17" />
      </svg>;
    case 'solar_radiation':
      return <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2" />
        <path d="M12 21v2" />
        <path d="M4.22 4.22l1.42 1.42" />
        <path d="M18.36 18.36l1.42 1.42" />
        <path d="M1 12h2" />
        <path d="M21 12h2" />
        <path d="M4.22 19.78l1.42-1.42" />
        <path d="M18.36 5.64l1.42-1.42" />
      </svg>;
    case 'rainfall':
      return <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
        <path d="M16 14v6" />
        <path d="M8 14v6" />
        <path d="M12 16v6" />
      </svg>;
    case 'temperature':
      return <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
      </svg>;
    default:
      return <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
      </svg>;
  }
}

export default AirQualityInputForm;
