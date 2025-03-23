
import React from "react";
import { 
  Database, AlertTriangle, CheckCircle, ExternalLink, 
  FileJson, Table, Lock, Braces, Upload, FileUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SupabaseSetupGuide: React.FC = () => {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <Database className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Supabase Integration Setup</h2>
      </div>
      
      <div className="flex items-center gap-2 rounded-md bg-yellow-500/10 p-3 mb-5 border border-yellow-500/20">
        <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
        <p className="text-sm text-yellow-300">
          This feature requires a Supabase database to store and analyze the air quality dataset.
        </p>
      </div>
      
      <Accordion type="single" collapsible className="mb-5">
        <AccordionItem value="setup-steps" className="border-white/10">
          <AccordionTrigger className="text-white hover:text-white hover:no-underline py-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <span>Setup Steps</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-blue-300">
            <ol className="space-y-3 pl-6 list-decimal">
              <li>
                <div className="flex flex-col">
                  <span className="text-white font-medium">Create a Supabase project</span>
                  <span className="text-sm">Sign up at supabase.com and create a new project</span>
                </div>
              </li>
              <li>
                <div className="flex flex-col">
                  <span className="text-white font-medium">Create the air quality data table</span>
                  <span className="text-sm">Use the SQL editor or Table interface to create the table</span>
                </div>
              </li>
              <li>
                <div className="flex flex-col">
                  <span className="text-white font-medium">Upload your data</span>
                  <span className="text-sm">Use CSV import or API to upload your air quality dataset</span>
                </div>
              </li>
              <li>
                <div className="flex flex-col">
                  <span className="text-white font-medium">Add the Supabase credentials to your app</span>
                  <span className="text-sm">Update the environment variables with your project URLs and keys</span>
                </div>
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="database-schema" className="border-white/10">
          <AccordionTrigger className="text-white hover:text-white hover:no-underline py-4">
            <div className="flex items-center gap-2">
              <Table className="h-4 w-4 text-blue-400" />
              <span>Database Schema</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-blue-300">
            <div className="rounded bg-black/40 p-3 text-sm font-mono overflow-auto">
              <p className="text-blue-200">-- Air quality data table schema</p>
              <p className="text-white">CREATE TABLE air_quality_data (</p>
              <p className="pl-4">id BIGINT PRIMARY KEY,</p>
              <p className="pl-4">timestamp TIMESTAMPTZ,</p>
              <p className="pl-4">location VARCHAR,</p>
              <p className="pl-4">latitude FLOAT,</p>
              <p className="pl-4">longitude FLOAT,</p>
              <p className="pl-4">pm25 FLOAT,</p>
              <p className="pl-4">pm10 FLOAT,</p>
              <p className="pl-4">no FLOAT,</p>
              <p className="pl-4">no2 FLOAT,</p>
              <p className="pl-4">nox FLOAT,</p>
              <p className="pl-4">nh3 FLOAT,</p>
              <p className="pl-4">so2 FLOAT,</p>
              <p className="pl-4">co FLOAT,</p>
              <p className="pl-4">o3 FLOAT,</p>
              <p className="pl-4">benzene FLOAT,</p>
              <p className="pl-4">humidity FLOAT,</p>
              <p className="pl-4">wind_speed FLOAT,</p>
              <p className="pl-4">wind_direction FLOAT,</p>
              <p className="pl-4">solar_radiation FLOAT,</p>
              <p className="pl-4">rainfall FLOAT,</p>
              <p className="pl-4">temperature FLOAT,</p>
              <p className="pl-4">aqi_value FLOAT,</p>
              <p className="pl-4">aqi_category VARCHAR</p>
              <p className="text-white">);</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="integration-code" className="border-white/10">
          <AccordionTrigger className="text-white hover:text-white hover:no-underline py-4">
            <div className="flex items-center gap-2">
              <Braces className="h-4 w-4 text-blue-400" />
              <span>Integration Code</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-blue-300">
            <div className="rounded bg-black/40 p-3 text-sm font-mono overflow-auto">
              <p className="text-blue-200">// Install the Supabase client</p>
              <p className="text-white">npm install @supabase/supabase-js</p>
              <br />
              <p className="text-blue-200">// Create a Supabase client</p>
              <p className="text-white">import {`{ createClient }`} from '@supabase/supabase-js'</p>
              <br />
              <p className="text-white">const supabaseUrl = process.env.REACT_APP_SUPABASE_URL</p>
              <p className="text-white">const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY</p>
              <p className="text-white">const supabase = createClient(supabaseUrl, supabaseKey)</p>
              <br />
              <p className="text-blue-200">// Fetch data example</p>
              <p className="text-white">const fetchAirQualityData = async () => {`{`}</p>
              <p className="pl-4 text-white">const {`{ data, error }`} = await supabase</p>
              <p className="pl-8 text-white">.from('air_quality_data')</p>
              <p className="pl-8 text-white">.select('*')</p>
              <p className="pl-8 text-white">.limit(100)</p>
              <br />
              <p className="pl-4 text-white">if (error) {`{`}</p>
              <p className="pl-8 text-white">console.error('Error fetching data:', error)</p>
              <p className="pl-8 text-white">return []</p>
              <p className="pl-4 text-white">{`}`}</p>
              <br />
              <p className="pl-4 text-white">return data</p>
              <p className="text-white">{`}`}</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="data-upload" className="border-white/10">
          <AccordionTrigger className="text-white hover:text-white hover:no-underline py-4">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-400" />
              <span>Data Upload Guide</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-blue-300">
            <div className="space-y-4">
              <p className="text-sm">
                To upload your air quality dataset (5000+ rows) to Supabase:
              </p>
              
              <ol className="space-y-3 pl-6 list-decimal">
                <li>
                  <div className="flex flex-col">
                    <span className="text-white font-medium">Create the table</span>
                    <span className="text-sm">
                      Go to your Supabase project dashboard, navigate to the Table Editor, and click "New Table".
                      Use the schema provided above or create it via SQL Editor.
                    </span>
                  </div>
                </li>
                <li>
                  <div className="flex flex-col">
                    <span className="text-white font-medium">Prepare your CSV file</span>
                    <span className="text-sm">
                      Ensure your CSV has headers matching the table column names. For large datasets,
                      consider splitting into multiple files (1000 rows each).
                    </span>
                  </div>
                </li>
                <li>
                  <div className="flex flex-col">
                    <span className="text-white font-medium">Upload via Supabase UI</span>
                    <span className="text-sm">
                      In Table Editor, select the table and click "Insert" → "Import Data" → 
                      "CSV". Browse for your file and follow the upload prompts.
                    </span>
                  </div>
                </li>
                <li>
                  <div className="flex flex-col">
                    <span className="text-white font-medium">Alternative: Programmatic Upload</span>
                    <span className="text-sm">
                      For very large datasets, use the Supabase JS client to upload data 
                      programmatically in batches.
                    </span>
                    <div className="rounded bg-black/40 p-2 text-xs font-mono mt-2 overflow-auto">
                      <p className="text-white">// Batch upload example</p>
                      <p className="text-white">const batches = chunkArray(airQualityData, 1000);</p>
                      <p className="text-white">for (const batch of batches) {`{`}</p>
                      <p className="pl-2 text-white">const {`{ error }`} = await supabase</p>
                      <p className="pl-4 text-white">.from('air_quality_data')</p>
                      <p className="pl-4 text-white">.insert(batch);</p>
                      <p className="text-white">{`}`}</p>
                    </div>
                  </div>
                </li>
              </ol>
              
              <div className="mt-4 flex items-center gap-2 text-yellow-300 text-sm">
                <FileUp className="h-4 w-4" />
                <span>For ML analysis purposes, ensure your dataset has sufficient variety in pollutant values and corresponding AQI categories.</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="flex flex-col items-center justify-center gap-3 mt-6">
        <Button 
          className="bg-blue-500 hover:bg-blue-600 w-full flex items-center"
          onClick={() => window.open('https://supabase.com', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Get Started with Supabase
        </Button>
        
        <div className="text-sm text-blue-300 text-center max-w-md">
          Once you've set up Supabase, you'll be able to upload and analyze your air quality dataset with various machine learning algorithms.
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetupGuide;
