
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface LocationSelectorProps {
  onLocationSelected: (location: string) => void;
  onDetectLocation: () => void;
  isLoading: boolean;
  currentLocation?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  onLocationSelected, 
  onDetectLocation,
  isLoading,
  currentLocation
}) => {
  const [location, setLocation] = useState("");
  const isMobile = useIsMobile();
  
  // Update the input field when currentLocation changes
  useEffect(() => {
    if (currentLocation && currentLocation !== "Unknown Location" && currentLocation !== "Current Location") {
      setLocation(currentLocation);
    }
  }, [currentLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onLocationSelected(location.trim());
    } else {
      toast.error("Please enter a location");
    }
  };
  
  const handleDetectLocation = () => {
    // First check if geolocation is available
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    onDetectLocation();
  };

  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-base font-medium flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter city or location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="backdrop-blur-sm bg-secondary/40 border-none"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full backdrop-blur-sm bg-secondary/20 text-xs md:text-sm"
            onClick={handleDetectLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                {!isMobile && "Detecting..."}
              </>
            ) : (
              <>
                <MapPin className="mr-1 h-3 w-3" />
                {isMobile ? "Current Location" : "Use Current Location"}
              </>
            )}
          </Button>
          
          {navigator.geolocation === undefined && (
            <div className="text-xs text-orange-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              Geolocation unavailable
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default LocationSelector;
