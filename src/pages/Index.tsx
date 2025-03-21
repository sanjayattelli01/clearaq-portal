
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AirQualityDashboard from "@/components/AirQualityDashboard";
import AirQualitySidebar from "@/components/AirQualitySidebar";

const Index: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AirQualitySidebar />
        <main className="flex-1">
          <AirQualityDashboard />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
