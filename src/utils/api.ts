import { AirQualityData, AqiCategory, MetricValue } from "./types";

// Sample API key for demonstration
// In a real app, you should use environment variables or secure storage
const API_KEY = "demo-api-key";
const GOOGLE_API_KEY = "AIzaSyDTPKZ3wLB4nCqqD2ijIvCnMmXHa-28FZI";

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

// Helper function to get city name from coordinates using reverse geocoding
export const getCityFromCoordinates = async (coordinates: GeolocationCoordinates): Promise<string> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${GOOGLE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.error("Geocoding API error:", data.status);
      return "Unknown Location";
    }
    
    // Extract city from address components
    let cityName = "Unknown Location";
    
    // Loop through address components to find the locality (city)
    for (const result of data.results) {
      for (const component of result.address_components) {
        if (component.types.includes("locality") || component.types.includes("administrative_area_level_2")) {
          cityName = component.long_name;
          return cityName;
        }
      }
      
      // If no locality found, try to use a less specific component
      for (const component of result.address_components) {
        if (component.types.includes("administrative_area_level_1")) {
          cityName = component.long_name;
          return cityName;
        }
      }
    }
    
    return cityName;
  } catch (error) {
    console.error("Error getting city name:", error);
    return "Unknown Location";
  }
};

export const fetchAirQualityData = async (
  coordinates: GeolocationCoordinates
): Promise<AirQualityData> => {
  // In a real implementation, this would make an API request
  // For this demo, we'll return mock data
  console.log("Fetching air quality data for coordinates:", coordinates);
  
  try {
    // Get the actual city name from coordinates
    const cityName = await getCityFromCoordinates(coordinates);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockData = generateMockAirQualityData(coordinates);
    mockData.location.name = cityName;
    
    return mockData;
  } catch (error) {
    console.error("Error in fetchAirQualityData:", error);
    return generateMockAirQualityData(coordinates);
  }
};

export const fetchAirQualityDataByCity = async (
  city: string
): Promise<AirQualityData> => {
  // In a real implementation, this would geocode the city and then make an API request
  console.log("Fetching air quality data for city:", city);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate random coordinates for the city
  const coordinates = {
    latitude: 40 + (Math.random() - 0.5) * 10,
    longitude: -74 + (Math.random() - 0.5) * 10
  };
  
  const mockData = generateMockAirQualityData(coordinates);
  mockData.location.name = city;
  
  return mockData;
};

export const fetchAirQualityFromGoogleAPI = async (
  coordinates: GeolocationCoordinates
): Promise<AirQualityData> => {
  console.log("Fetching air quality data from Google API for coordinates:", coordinates);
  
  try {
    // Get the actual city name from coordinates
    const cityName = await getCityFromCoordinates(coordinates);
    
    // In a real implementation, this would make an actual API request to Google's Air Quality API
    // For now, we'll simulate a response with a slight delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate slightly different mock data to simulate data from Google API
    const mockData = generateMockAirQualityData(coordinates);
    
    // Set the location name to the actual city
    mockData.location.name = cityName;
    
    // Modify some values to make it look different from our regular mock data
    mockData.metrics.pm25.value = Math.floor(mockData.metrics.pm25.value * 0.85);
    mockData.metrics.no2.value = Math.floor(mockData.metrics.no2.value * 1.2);
    mockData.metrics.o3.value = Math.floor(mockData.metrics.o3.value * 0.9);
    
    // Update AQI based on the new PM2.5 value
    const newAqiValue = calculateAqi(mockData.metrics.pm25.value);
    mockData.aqi = {
      value: newAqiValue,
      category: getAqiCategory(newAqiValue),
      description: getAqiDescription(newAqiValue)
    };
    
    // Add a source indicator
    mockData.source = "Google Air Quality API";
    
    return mockData;
  } catch (error) {
    console.error("Error fetching data from Google API:", error);
    throw new Error("Failed to fetch air quality data from Google API");
  }
};

export const getUserCurrentLocation = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};

// Helper function to generate mock data for demonstration
function generateMockAirQualityData(coordinates: GeolocationCoordinates): AirQualityData {
  const randomValue = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  const pm25Value = randomValue(5, 50);
  const aqiValue = calculateAqi(pm25Value);
  
  return {
    location: {
      name: "Current Location",
      coordinates
    },
    timestamp: new Date().toISOString(),
    metrics: {
      pm25: { value: pm25Value, unit: "µg/m³", category: getAqiCategory(calculateAqi(pm25Value)) },
      pm10: { value: randomValue(10, 70), unit: "µg/m³" },
      no: { value: randomValue(5, 30), unit: "ppb" },
      no2: { value: randomValue(10, 50), unit: "ppb" },
      nox: { value: randomValue(15, 60), unit: "ppb" },
      nh3: { value: randomValue(2, 20), unit: "ppb" },
      so2: { value: randomValue(1, 15), unit: "ppb" },
      co: { value: randomValue(1, 10) / 10, unit: "ppm" },
      o3: { value: randomValue(20, 80), unit: "ppb" },
      benzene: { value: randomValue(1, 10) / 10, unit: "ppb" },
      humidity: { value: randomValue(30, 90), unit: "%" },
      wind_speed: { value: randomValue(1, 20) / 2, unit: "m/s" },
      wind_direction: { value: randomValue(0, 359), unit: "°" },
      solar_radiation: { value: randomValue(50, 800), unit: "W/m²" },
      rainfall: { value: randomValue(0, 20) / 10, unit: "mm" },
      temperature: { value: randomValue(15, 35), unit: "°C" }
    },
    aqi: {
      value: aqiValue,
      category: getAqiCategory(aqiValue),
      description: getAqiDescription(aqiValue)
    }
  };
}

function calculateAqi(pm25: number): number {
  // Simple algorithm to convert PM2.5 to AQI
  // In a real application, a more sophisticated algorithm would be used
  return Math.min(Math.floor(pm25 * 2.5), 500);
}

function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy";
  if (aqi <= 300) return "very-unhealthy";
  return "hazardous";
}

function getAqiDescription(aqi: number): string {
  if (aqi <= 50) return "Good air quality";
  if (aqi <= 100) return "Moderate air quality";
  if (aqi <= 150) return "Unhealthy for sensitive groups";
  if (aqi <= 300) return "Very unhealthy air quality";
  return "Hazardous air quality";
}

export const getHistoricalDataForMetric = (metricKey: string, days = 7): { date: string; value: number }[] => {
  // Generate mock historical data
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.unshift({
      date: date.toISOString().split('T')[0],
      value: Math.random() * 50 + 10
    });
  }
  
  return data;
};
