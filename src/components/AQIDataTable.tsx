
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Activity,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AQIDataTableProps {
  data: any[];
}

const AQIDataTable: React.FC<AQIDataTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortField, setSortField] = React.useState<string>("pm25");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");
  const [filteredData, setFilteredData] = React.useState(data);

  // Update filtered data when props or filters change
  React.useEffect(() => {
    let result = [...data];
    
    // Apply search filter if present
    if (searchTerm.trim()) {
      result = result.filter(row => {
        return Object.values(row).some(value => 
          value !== null && 
          value !== undefined && 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const valueA = a[sortField] !== undefined ? Number(a[sortField]) : 0;
      const valueB = b[sortField] !== undefined ? Number(b[sortField]) : 0;
      
      return sortDirection === "asc" 
        ? valueA - valueB 
        : valueB - valueA;
    });
    
    setFilteredData(result);
  }, [data, searchTerm, sortField, sortDirection]);

  // Toggle sort direction
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Get badge color based on value
  const getValueColor = (value: number, metric: string) => {
    if (metric === "efficiency") {
      if (value > 75) return "bg-green-500/20 text-green-500";
      if (value > 50) return "bg-blue-500/20 text-blue-500";
      if (value > 25) return "bg-yellow-500/20 text-yellow-500";
      return "bg-red-500/20 text-red-500";
    }
    
    // Default color scheme for other metrics
    if (isNaN(value)) return "bg-gray-500/20 text-gray-500";
    if (value > 100) return "bg-red-500/20 text-red-500";
    if (value > 50) return "bg-yellow-500/20 text-yellow-500";
    if (value > 25) return "bg-blue-500/20 text-blue-500";
    return "bg-green-500/20 text-green-500";
  };

  // Get sort icon based on current sort
  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search data..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/50 w-full"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="h-4 w-4 text-blue-400" />
          <Select
            value={sortField}
            onValueChange={setSortField}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pm25">PM2.5</SelectItem>
              <SelectItem value="pm10">PM10</SelectItem>
              <SelectItem value="no2">NO2</SelectItem>
              <SelectItem value="o3">O3</SelectItem>
              <SelectItem value="air_temperature">Temperature</SelectItem>
              <SelectItem value="efficiency">Efficiency</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            className="border-white/10 text-white hover:bg-white/10"
          >
            {sortDirection === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow>
                <TableHead className="text-blue-300 cursor-pointer hover:text-blue-100" onClick={() => handleSort("pm25")}>
                  PM2.5 {getSortIcon("pm25")}
                </TableHead>
                <TableHead className="text-blue-300 cursor-pointer hover:text-blue-100" onClick={() => handleSort("pm10")}>
                  PM10 {getSortIcon("pm10")}
                </TableHead>
                <TableHead className="text-blue-300 cursor-pointer hover:text-blue-100" onClick={() => handleSort("no2")}>
                  NO2 {getSortIcon("no2")}
                </TableHead>
                <TableHead className="text-blue-300 cursor-pointer hover:text-blue-100" onClick={() => handleSort("o3")}>
                  O3 {getSortIcon("o3")}
                </TableHead>
                <TableHead className="text-blue-300 cursor-pointer hover:text-blue-100" onClick={() => handleSort("air_temperature")}>
                  Temp {getSortIcon("air_temperature")}
                </TableHead>
                <TableHead className="text-blue-300 cursor-pointer hover:text-blue-100" onClick={() => handleSort("efficiency")}>
                  Efficiency {getSortIcon("efficiency")}
                </TableHead>
                <TableHead className="text-blue-300">
                  Category
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <TableRow key={index} className="border-white/5">
                    <TableCell>
                      <Badge className={getValueColor(row.pm25, "pm25")}>
                        {row.pm25}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getValueColor(row.pm10, "pm10")}>
                        {row.pm10}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getValueColor(row.no2, "no2")}>
                        {row.no2}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getValueColor(row.o3, "o3")}>
                        {row.o3}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getValueColor(row.air_temperature, "air_temperature")}>
                        {row.air_temperature}°C
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getValueColor(row.efficiency || 0, "efficiency")}>
                        {row.efficiency || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          row.efficiency_category === "Very High" ? "bg-green-500/20 text-green-500" :
                          row.efficiency_category === "High" ? "bg-blue-500/20 text-blue-500" :
                          row.efficiency_category === "Moderate" ? "bg-yellow-500/20 text-yellow-500" :
                          row.efficiency_category === "Low" ? "bg-red-500/20 text-red-500" :
                          "bg-gray-500/20 text-gray-500"
                        }
                      >
                        {row.efficiency_category || "Unknown"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-blue-300">
                      <Activity className="h-8 w-8 mb-2" />
                      <p>{searchTerm ? "No matching data found" : "No data available"}</p>
                      <p className="text-sm text-blue-300/60 mt-1">
                        {searchTerm && "Try changing your search criteria"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="text-sm text-blue-300/70 text-right">
        {filteredData.length} records found
      </div>
    </div>
  );
};

export default AQIDataTable;
