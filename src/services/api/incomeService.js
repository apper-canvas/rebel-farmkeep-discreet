import mockData from '../mockData/income.json';

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Store for managing income data
let incomeData = [...mockData];
let nextId = Math.max(...incomeData.map(item => item.Id)) + 1;

const incomeService = {
  // Get all income records
  async getAll() {
    await delay(200);
    return [...incomeData];
  },

  // Get income by ID
  async getById(id) {
    await delay(200);
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error('Invalid ID format');
    }
    const income = incomeData.find(item => item.Id === parsedId);
    if (!income) {
      throw new Error('Income record not found');
    }
    return { ...income };
  },

  // Create new income record
  async create(incomeData) {
    await delay(300);
    const newIncome = {
      ...incomeData,
      Id: nextId++,
      date: incomeData.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(incomeData.amount) || 0
    };
    
    incomeData.push(newIncome);
    return { ...newIncome };
  },

  // Update existing income record
  async update(id, updatedData) {
    await delay(300);
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error('Invalid ID format');
    }
    
    const index = incomeData.findIndex(item => item.Id === parsedId);
    if (index === -1) {
      throw new Error('Income record not found');
    }
    
    const updatedIncome = {
      ...incomeData[index],
      ...updatedData,
      Id: parsedId, // Prevent ID changes
      amount: parseFloat(updatedData.amount) || incomeData[index].amount
    };
    
    incomeData[index] = updatedIncome;
    return { ...updatedIncome };
  },

  // Delete income record
  async delete(id) {
    await delay(250);
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error('Invalid ID format');
    }
    
    const index = incomeData.findIndex(item => item.Id === parsedId);
    if (index === -1) {
      throw new Error('Income record not found');
    }
    
    incomeData.splice(index, 1);
    return { success: true };
  },

  // Get income by date range
  async getByDateRange(startDate, endDate) {
    await delay(200);
    return incomeData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    }).map(item => ({ ...item }));
  },

  // Get income by category
  async getByCategory(category) {
    await delay(200);
    return incomeData.filter(item => item.category === category).map(item => ({ ...item }));
  },

  // Get monthly total
  async getMonthlyTotal(month, year) {
    await delay(200);
    const monthlyIncome = incomeData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === month && itemDate.getFullYear() === year;
    });
    
    const total = monthlyIncome.reduce((sum, item) => sum + item.amount, 0);
    return { total, count: monthlyIncome.length, items: monthlyIncome.map(item => ({ ...item })) };
  }
};

export default incomeService;