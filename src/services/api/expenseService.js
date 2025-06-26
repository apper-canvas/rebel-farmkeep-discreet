import { toast } from 'react-toastify';

const expenseService = {
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
          { field: { Name: "amount" } },
          { field: { Name: "category" } },
          { field: { Name: "description" } },
          { field: { Name: "date" } },
          { field: { Name: "farm_id" } }
        ]
      };
      
      const response = await apperClient.fetchRecords('expense', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to fetch expenses");
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
          { field: { Name: "amount" } },
          { field: { Name: "category" } },
          { field: { Name: "description" } },
          { field: { Name: "date" } },
          { field: { Name: "farm_id" } }
        ]
      };
      
      const response = await apperClient.getRecordById('expense', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching expense with ID ${id}:`, error);
      toast.error("Failed to fetch expense");
      return null;
    }
  },

  async getByFarmId(farmId) {
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
          { field: { Name: "amount" } },
          { field: { Name: "category" } },
          { field: { Name: "description" } },
          { field: { Name: "date" } },
          { field: { Name: "farm_id" } }
        ],
        where: [
          {
            FieldName: "farm_id",
            Operator: "EqualTo",
            Values: [parseInt(farmId)]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('expense', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching expenses by farm ID:", error);
      toast.error("Failed to fetch expenses");
      return [];
    }
  },

  async getSummaryByCategory(farmId = null) {
    try {
      const expenses = farmId ? await this.getByFarmId(farmId) : await this.getAll();
      
      const summary = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});
      
      return summary;
    } catch (error) {
      console.error("Error getting category summary:", error);
      toast.error("Failed to get expense summary");
      return {};
    }
  },

  async create(expenseData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [{
          amount: parseFloat(expenseData.amount),
          category: expenseData.category,
          description: expenseData.description,
          date: expenseData.date,
          farm_id: parseInt(expenseData.farmId)
        }]
      };
      
      const response = await apperClient.createRecord('expense', params);
      
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
      console.error("Error creating expense:", error);
      toast.error("Failed to create expense");
      throw error;
    }
  },

  async update(id, expenseData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [{
          Id: parseInt(id),
          amount: parseFloat(expenseData.amount),
          category: expenseData.category,
          description: expenseData.description,
          date: expenseData.date,
          farm_id: parseInt(expenseData.farmId)
        }]
      };
      
      const response = await apperClient.updateRecord('expense', params);
      
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
      console.error("Error updating expense:", error);
      toast.error("Failed to update expense");
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
      
      const response = await apperClient.deleteRecord('expense', params);
      
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
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
      throw error;
    }
  },

  // Analytics functions for charts
  async getExpensesByTimeRange(startDate, endDate, farmId = null) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const whereConditions = [
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
      ];
      
      if (farmId) {
        whereConditions.push({
          FieldName: "farm_id",
          Operator: "EqualTo",
          Values: [parseInt(farmId)]
        });
      }
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "amount" } },
          { field: { Name: "category" } },
          { field: { Name: "description" } },
          { field: { Name: "date" } },
          { field: { Name: "farm_id" } }
        ],
        where: whereConditions
      };
      
      const response = await apperClient.fetchRecords('expense', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching expenses by time range:", error);
      return [];
    }
  },

  async getTrendData(period = 'monthly', farmId = null) {
    try {
      const expenses = farmId ? await this.getByFarmId(farmId) : await this.getAll();
      
      const groupedData = {};
      
      expenses.forEach(expense => {
        const date = new Date(expense.date);
        let key;
        
        if (period === 'monthly') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else {
          key = date.getFullYear().toString();
        }
        
        if (!groupedData[key]) {
          groupedData[key] = { total: 0, categories: {} };
        }
        
        groupedData[key].total += expense.amount;
        groupedData[key].categories[expense.category] = 
          (groupedData[key].categories[expense.category] || 0) + expense.amount;
      });

      return Object.entries(groupedData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, data]) => ({
          period,
          total: data.total,
          categories: data.categories
        }));
    } catch (error) {
      console.error("Error getting trend data:", error);
      return [];
    }
  },

  async getFarmComparison() {
    try {
      const expenses = await this.getAll();
      const farmTotals = {};
      
      expenses.forEach(expense => {
        const farmId = expense.farm_id;
        if (!farmTotals[farmId]) {
          farmTotals[farmId] = { total: 0, categories: {} };
        }
        
        farmTotals[farmId].total += expense.amount;
        farmTotals[farmId].categories[expense.category] = 
          (farmTotals[farmId].categories[expense.category] || 0) + expense.amount;
      });

      return farmTotals;
    } catch (error) {
      console.error("Error getting farm comparison:", error);
      return {};
    }
  },

  async getCropExpenses(cropId = null) {
    try {
      const expenses = await this.getAll();
      
      const cropData = {};
      expenses.forEach(expense => {
        if (!cropData[expense.category]) {
          cropData[expense.category] = 0;
        }
        cropData[expense.category] += expense.amount;
      });
      
      return cropData;
    } catch (error) {
      console.error("Error getting crop expenses:", error);
      return {};
    }
  }
};

export default expenseService;