
import React from "react";
import { RefreshCw, Menu, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AirQualityData } from "@/utils/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  airQualityData: AirQualityData | null;
  isLoading: boolean;
  onRefresh: () => void;
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  airQualityData, 
  isLoading, 
  onRefresh,
  onToggleSidebar
}) => {
  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2">
          {isMobile && onToggleSidebar && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="-ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex flex-col">
            <h2 className="text-sm md:text-base font-semibold">
              Air Quality Dashboard
            </h2>
            {airQualityData?.location?.name && (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {airQualityData.location.name}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
