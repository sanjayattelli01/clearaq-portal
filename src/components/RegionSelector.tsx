
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import { fetchCountries, fetchStates, fetchDistricts } from "@/utils/api";

interface RegionSelectorProps {
  onRegionSelected: (country: string, state: string, district: string) => void;
  isLoading?: boolean;
  // Add these new props to match what's being passed in AdminPanel
  onCountryChange?: React.Dispatch<React.SetStateAction<string>>;
  onStateChange?: React.Dispatch<React.SetStateAction<string>>;
  onDistrictChange?: React.Dispatch<React.SetStateAction<string>>;
  selectedCountry?: string;
  selectedState?: string;
  selectedDistrict?: string;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ 
  onRegionSelected, 
  isLoading = false,
  onCountryChange,
  onStateChange,
  onDistrictChange,
  selectedCountry: propSelectedCountry,
  selectedState: propSelectedState,
  selectedDistrict: propSelectedDistrict
}) => {
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  
  const [internalSelectedCountry, setInternalSelectedCountry] = useState<string>(propSelectedCountry || "");
  const [internalSelectedState, setInternalSelectedState] = useState<string>(propSelectedState || "");
  const [internalSelectedDistrict, setInternalSelectedDistrict] = useState<string>(propSelectedDistrict || "");
  
  const [loading, setLoading] = useState<boolean>(false);
  
  // Use either prop values or internal state
  const selectedCountry = propSelectedCountry !== undefined ? propSelectedCountry : internalSelectedCountry;
  const selectedState = propSelectedState !== undefined ? propSelectedState : internalSelectedState;
  const selectedDistrict = propSelectedDistrict !== undefined ? propSelectedDistrict : internalSelectedDistrict;
  
  // Handle country change
  const handleCountryChange = (value: string) => {
    if (onCountryChange) {
      onCountryChange(value);
    } else {
      setInternalSelectedCountry(value);
    }
  };
  
  // Handle state change
  const handleStateChange = (value: string) => {
    if (onStateChange) {
      onStateChange(value);
    } else {
      setInternalSelectedState(value);
    }
  };
  
  // Handle district change
  const handleDistrictChange = (value: string) => {
    if (onDistrictChange) {
      onDistrictChange(value);
    } else {
      setInternalSelectedDistrict(value);
    }
  };
  
  // Fetch countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);
  
  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountry) {
      loadStates(selectedCountry);
      if (!onStateChange) {
        setInternalSelectedState("");
      }
      if (!onDistrictChange) {
        setInternalSelectedDistrict("");
      }
      setDistricts([]);
    }
  }, [selectedCountry]);
  
  // Fetch districts when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      loadDistricts(selectedCountry, selectedState);
      if (!onDistrictChange) {
        setInternalSelectedDistrict("");
      }
    }
  }, [selectedState]);
  
  const loadCountries = async () => {
    try {
      setLoading(true);
      const data = await fetchCountries();
      setCountries(data);
    } catch (error) {
      console.error("Error loading countries:", error);
      toast.error("Failed to load countries");
    } finally {
      setLoading(false);
    }
  };
  
  const loadStates = async (country: string) => {
    try {
      setLoading(true);
      const data = await fetchStates(country);
      setStates(data);
    } catch (error) {
      console.error("Error loading states:", error);
      toast.error("Failed to load states");
    } finally {
      setLoading(false);
    }
  };
  
  const loadDistricts = async (country: string, state: string) => {
    try {
      setLoading(true);
      const data = await fetchDistricts(country, state);
      setDistricts(data);
    } catch (error) {
      console.error("Error loading districts:", error);
      toast.error("Failed to load districts");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = () => {
    if (!selectedCountry) {
      toast.error("Please select at least a country");
      return;
    }
    
    onRegionSelected(selectedCountry, selectedState, selectedDistrict);
  };
  
  return (
    <Card className="glass-card animate-fade-in w-full border-white/10">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-base font-medium flex items-center text-white">
          <Globe className="h-4 w-4 mr-2 text-blue-400" />
          Region Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Select 
                value={selectedCountry} 
                onValueChange={handleCountryChange}
                disabled={isLoading || loading}
              >
                <SelectTrigger className="w-full backdrop-blur-sm bg-white/10 border-white/10 text-white h-9 text-xs">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {countries.map(country => (
                    <SelectItem key={country} value={country} className="text-xs">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={selectedState} 
                onValueChange={handleStateChange}
                disabled={isLoading || loading || !selectedCountry}
              >
                <SelectTrigger className="w-full backdrop-blur-sm bg-white/10 border-white/10 text-white h-9 text-xs">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {states.map(state => (
                    <SelectItem key={state} value={state} className="text-xs">
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={selectedDistrict} 
                onValueChange={handleDistrictChange}
                disabled={isLoading || loading || !selectedState}
              >
                <SelectTrigger className="w-full backdrop-blur-sm bg-white/10 border-white/10 text-white h-9 text-xs">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {districts.map(district => (
                    <SelectItem key={district} value={district} className="text-xs">
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="button"
            variant="default"
            className="w-full backdrop-blur-sm bg-blue-500 hover:bg-blue-600 text-xs"
            onClick={handleSearch}
            disabled={isLoading || loading || !selectedCountry}
          >
            {isLoading || loading ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : null}
            Search by Region
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionSelector;
