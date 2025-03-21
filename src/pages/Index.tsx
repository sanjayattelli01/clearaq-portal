
import React, { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import SidebarNav from "@/components/Sidebar";
import AirQualityDashboard from "@/components/AirQualityDashboard";
import AirQualityInputForm from "@/components/AirQualityInputForm";
import QualityIndexSection from "@/components/QualityIndexSection";
import FinalAirQualitySection from "@/components/FinalAirQualitySection";
import { AirQualityData } from "@/utils/types";
import { fetchAirQualityData, fetchAirQualityDataByCity, getUserCurrentLocation } from "@/utils/api";
import { toast } from "sonner";

const Index: React.FC = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleFormSubmit = async (data: Record<string, number>) => {
    setIsLoading(true);
    
    try {
      // Simulating form submission by fetching a city
      const result = await fetchAirQualityDataByCity("Custom Data");
      
      // Override the result with the form data
      // In a real app, you would send this data to your API
      Object.keys(data).forEach(key => {
        if (result.metrics[key]) {
          result.metrics[key].value = data[key];
        }
      });
      
      setAirQualityData(result);
      toast.success("Data submitted successfully");
      
      // Automatically switch to the analysis section
      setActiveSection("analysis");
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to submit data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    
    try {
      const coordinates = await getUserCurrentLocation();
      const data = await fetchAirQualityData(coordinates);
      setAirQualityData(data);
      toast.success("Loaded air quality data for your location");
      
      // Automatically switch to the analysis section
      setActiveSection("analysis");
    } catch (err) {
      console.error("Error fetching data for current location:", err);
      toast.error("Failed to access your location");
    } finally {
      setIsLoading(false);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Air Quality Dashboard</h1>
            <p className="text-lg text-gray-700">
              Welcome to the Air Quality Dashboard. This application allows you to monitor and analyze air quality data.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <InfoCard 
                title="Monitor Air Quality" 
                description="Check real-time air quality data from your current location or enter custom values."
                icon={<svg viewBox="0 0 24 24" className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v6" />
                  <circle cx="12" cy="14" r="6" />
                </svg>}
              />
              <InfoCard 
                title="Analyze Pollutants" 
                description="View detailed analysis of various pollutants and meteorological parameters."
                icon={<svg viewBox="0 0 24 24" className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 2v20h20" />
                  <path d="M6 16l4-8 4 4 4-10" />
                </svg>}
              />
              <InfoCard 
                title="Get Recommendations" 
                description="Receive air quality index ratings and health recommendations based on the data."
                icon={<svg viewBox="0 0 24 24" className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>}
              />
            </div>
          </div>
        );
      case "inputs":
        return (
          <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Air Quality Inputs</h1>
            <p className="text-gray-700 mb-6">
              Enter custom values for air quality parameters or use your current location data.
            </p>
            <AirQualityInputForm 
              onSubmit={handleFormSubmit}
              onUseCurrentLocation={handleUseCurrentLocation}
              isLoading={isLoading}
            />
          </div>
        );
      case "analysis":
        return (
          <div className="p-6">
            <AirQualityDashboard />
          </div>
        );
      case "index":
        return (
          <div className="p-6 space-y-6">
            <QualityIndexSection metrics={airQualityData?.metrics || null} />
          </div>
        );
      case "final":
        return (
          <div className="p-6 space-y-6">
            <FinalAirQualitySection airQualityData={airQualityData} />
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold">Air Quality Dashboard</h1>
            <p>Welcome to the Air Quality Dashboard</p>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50">
        <SidebarNav 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        <SidebarInset className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            <div className="flex items-center mb-4">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-xl font-bold">Air Quality Monitor</h1>
            </div>
            {renderActiveSection()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

interface InfoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Index;
