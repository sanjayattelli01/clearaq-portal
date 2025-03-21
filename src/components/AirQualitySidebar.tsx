
import React from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter
} from "@/components/ui/sidebar";
import { 
  Home, 
  Wind, 
  BarChart2, 
  Gauge, 
  Thermometer, 
  Info
} from "lucide-react";

// Menu items
const menuItems = [
  {
    title: "Home",
    icon: Home,
    id: "home"
  },
  {
    title: "Air Quality Inputs",
    icon: Wind,
    id: "inputs"
  },
  {
    title: "Analysis",
    icon: BarChart2,
    id: "analysis"
  },
  {
    title: "Quality Index",
    icon: Gauge,
    id: "quality-index"
  },
  {
    title: "Final Air Quality",
    icon: Thermometer,
    id: "final-air-quality"
  }
];

const AirQualitySidebar: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center p-4">
        <h2 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Air Quality Monitor
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => scrollToSection(item.id)}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 text-xs text-muted-foreground">
        <div className="flex items-center justify-center space-x-2">
          <Info className="h-3 w-3" />
          <span>Air Quality Dashboard v1.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AirQualitySidebar;
