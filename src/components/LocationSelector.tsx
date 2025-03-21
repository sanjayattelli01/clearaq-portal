
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LocationSelectorProps {
  onLocationSelected: (location: string) => void;
  onDetectLocation: () => void;
  isLoading: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  onLocationSelected, 
  onDetectLocation,
  isLoading 
}) => {
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onLocationSelected(location.trim());
    } else {
      toast.error("Please enter a location");
    }
  };

  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base font-medium">Location</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full backdrop-blur-sm bg-secondary/20"
            onClick={onDetectLocation}
            disabled={isLoading}
          >
            <MapPin className="mr-2 h-4 w-4" />
            {isLoading ? "Detecting..." : "Use Current Location"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LocationSelector;
