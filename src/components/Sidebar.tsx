
import React from "react";
import { 
  Home, 
  Edit, 
  BarChart2, 
  Gauge, 
  CheckCircle 
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";

interface SidebarNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ 
  activeSection, 
  onSectionChange 
}) => {
  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "inputs", label: "Air Quality Inputs", icon: Edit },
    { id: "analysis", label: "Analysis", icon: BarChart2 },
    { id: "index", label: "Quality Index", icon: Gauge },
    { id: "final", label: "Final Air Quality", icon: CheckCircle }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="py-4 flex justify-center">
        <h2 className="text-xl font-bold">Air Quality Dashboard</h2>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton 
                isActive={activeSection === item.id}
                onClick={() => onSectionChange(item.id)}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 text-center text-xs">
        <p>Air Quality Monitor v1.0</p>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarNav;
