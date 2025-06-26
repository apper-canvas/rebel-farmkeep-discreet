import { toast } from 'react-toastify';

const weatherService = {
  async getForecast() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "date" } },
          { field: { Name: "high" } },
          { field: { Name: "low" } },
          { field: { Name: "condition" } },
          { field: { Name: "precipitation" } },
          { field: { Name: "humidity" } },
          { field: { Name: "wind_speed" } }
        ],
        orderBy: [
          {
            fieldName: "date",
            sorttype: "ASC"
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('weather', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching weather forecast:", error);
      toast.error("Failed to fetch weather forecast");
      return [];
    }
  },

  async getTodaysWeather() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const today = new Date().toISOString().split('T')[0];
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "date" } },
          { field: { Name: "high" } },
          { field: { Name: "low" } },
          { field: { Name: "condition" } },
          { field: { Name: "precipitation" } },
          { field: { Name: "humidity" } },
          { field: { Name: "wind_speed" } }
        ],
        where: [
          {
            FieldName: "date",
            Operator: "EqualTo",
            Values: [today]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('weather', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        // Return fallback weather data
        return { 
          date: today, 
          high: 75, 
          low: 55, 
          condition: 'sunny', 
          precipitation: 0, 
          humidity: 45, 
          wind_speed: 8 
        };
      }
      
      if (response.data && response.data.length > 0) {
        return response.data[0];
      } else {
        // Return fallback weather data if no data found for today
        return { 
          date: today, 
          high: 75, 
          low: 55, 
          condition: 'sunny', 
          precipitation: 0, 
          humidity: 45, 
          wind_speed: 8 
        };
      }
    } catch (error) {
      console.error("Error fetching today's weather:", error);
      // Return fallback weather data
      return { 
        date: new Date().toISOString().split('T')[0], 
        high: 75, 
        low: 55, 
        condition: 'sunny', 
        precipitation: 0, 
        humidity: 45, 
        wind_speed: 8 
      };
    }
  }
};

export default weatherService;