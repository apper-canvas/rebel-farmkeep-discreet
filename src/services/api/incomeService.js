import { toast } from 'react-toastify';

const incomeService = {
  async getAll() {
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
          { field: { Name: "source" } },
          { field: { Name: "description" } },
          { field: { Name: "amount" } },
          { field: { Name: "date" } },
          { field: { Name: "category" } },
          { field: { Name: "farm_id" } },
          { field: { Name: "crop_id" } }
        ]
      };
      
      const response = await apperClient.fetchRecords('income', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching income:", error);
      toast.error("Failed to fetch income");
      return [];
    }
  },

  async getById(id) {
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
          { field: { Name: "source" } },
          { field: { Name: "description" } },
          { field: { Name: "amount" } },
          { field: { Name: "date" } },
          { field: { Name: "category" } },
          { field: { Name: "farm_id" } },
          { field: { Name: "crop_id" } }
        ]
      };
      
      const response = await apperClient.getRecordById('income', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching income with ID ${id}:`, error);
      toast.error("Failed to fetch income");
      return null;
    }
  },

  async create(incomeData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [{
          source: incomeData.source,
          description: incomeData.description,
          amount: parseFloat(incomeData.amount),
          date: incomeData.date,
          category: incomeData.category,
          farm_id: incomeData.farmId ? parseInt(incomeData.farmId) : null,
          crop_id: incomeData.cropId ? parseInt(incomeData.cropId) : null
        }]
      };
      
      const response = await apperClient.createRecord('income', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      console.error("Error creating income:", error);
      toast.error("Failed to create income");
      throw error;
    }
  },

  async update(id, incomeData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [{
          Id: parseInt(id),
          source: incomeData.source,
          description: incomeData.description,
          amount: parseFloat(incomeData.amount),
          date: incomeData.date,
          category: incomeData.category,
          farm_id: incomeData.farmId ? parseInt(incomeData.farmId) : null,
          crop_id: incomeData.cropId ? parseInt(incomeData.cropId) : null
        }]
      };
      
      const response = await apperClient.updateRecord('income', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      console.error("Error updating income:", error);
      toast.error("Failed to update income");
      throw error;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('income', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error("Failed to delete income");
      throw error;
    }
  },

  async getByDateRange(startDate, endDate) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "source" } },
          { field: { Name: "description" } },
          { field: { Name: "amount" } },
          { field: { Name: "date" } },
          { field: { Name: "category" } },
          { field: { Name: "farm_id" } },
          { field: { Name: "crop_id" } }
        ],
        where: [
          {
            FieldName: "date",
            Operator: "GreaterThanOrEqualTo",
            Values: [startDate]
          },
          {
            FieldName: "date",
            Operator: "LessThanOrEqualTo",
            Values: [endDate]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('income', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching income by date range:", error);
      return [];
    }
  },

  async getByCategory(category) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "source" } },
          { field: { Name: "description" } },
          { field: { Name: "amount" } },
          { field: { Name: "date" } },
          { field: { Name: "category" } },
          { field: { Name: "farm_id" } },
          { field: { Name: "crop_id" } }
        ],
        where: [
          {
            FieldName: "category",
            Operator: "EqualTo",
            Values: [category]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('income', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching income by category:", error);
      return [];
    }
  },

  async getMonthlyTotal(month, year) {
    try {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      const monthlyIncome = await this.getByDateRange(startDate, endDate);
      const total = monthlyIncome.reduce((sum, item) => sum + item.amount, 0);
      
      return { 
        total, 
        count: monthlyIncome.length, 
        items: monthlyIncome
      };
    } catch (error) {
      console.error("Error getting monthly total:", error);
      return { total: 0, count: 0, items: [] };
    }
  }
};

export default incomeService;