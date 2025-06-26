import expensesData from '../mockData/expenses.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let expenses = [...expensesData];

const expenseService = {
  async getAll() {
    await delay(300);
    return [...expenses];
  },

  async getById(id) {
    await delay(200);
    const expense = expenses.find(e => e.Id === parseInt(id, 10));
    if (!expense) {
      throw new Error('Expense not found');
    }
    return { ...expense };
  },

  async getByFarmId(farmId) {
    await delay(250);
    return expenses.filter(e => e.farmId === parseInt(farmId, 10)).map(e => ({ ...e }));
  },

  async getSummaryByCategory(farmId = null) {
    await delay(300);
    const filteredExpenses = farmId 
      ? expenses.filter(e => e.farmId === parseInt(farmId, 10))
      : expenses;
    
    const summary = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    
    return summary;
  },

  async create(expenseData) {
    await delay(400);
    const maxId = expenses.length > 0 ? Math.max(...expenses.map(e => e.Id)) : 0;
    const newExpense = {
      ...expenseData,
      Id: maxId + 1,
      farmId: parseInt(expenseData.farmId, 10),
      amount: parseFloat(expenseData.amount)
    };
    expenses.push(newExpense);
    return { ...newExpense };
  },

  async update(id, expenseData) {
    await delay(300);
    const index = expenses.findIndex(e => e.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Expense not found');
    }
    const updatedExpense = { 
      ...expenses[index], 
      ...expenseData, 
      Id: expenses[index].Id,
      farmId: parseInt(expenseData.farmId || expenses[index].farmId, 10),
      amount: parseFloat(expenseData.amount || expenses[index].amount)
    };
    expenses[index] = updatedExpense;
    return { ...updatedExpense };
  },

  async delete(id) {
    await delay(300);
    const index = expenses.findIndex(e => e.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Expense not found');
    }
    expenses.splice(index, 1);
expenses.splice(index, 1);
    return true;
  },

  // Analytics functions for charts
  async getExpensesByTimeRange(startDate, endDate, farmId = null) {
    await delay(250);
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const farmMatch = !farmId || expense.farmId === parseInt(farmId, 10);
      const dateMatch = expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
      return farmMatch && dateMatch;
    });
    return filteredExpenses.map(e => ({ ...e }));
  },

  async getTrendData(period = 'monthly', farmId = null) {
    await delay(300);
    const filteredExpenses = farmId 
      ? expenses.filter(e => e.farmId === parseInt(farmId, 10))
      : expenses;

    const groupedData = {};
    
    filteredExpenses.forEach(expense => {
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
  },

  async getFarmComparison() {
    await delay(300);
    const farmTotals = {};
    
    expenses.forEach(expense => {
      const farmId = expense.farmId;
      if (!farmTotals[farmId]) {
        farmTotals[farmId] = { total: 0, categories: {} };
      }
      
      farmTotals[farmId].total += expense.amount;
      farmTotals[farmId].categories[expense.category] = 
        (farmTotals[farmId].categories[expense.category] || 0) + expense.amount;
    });

    return farmTotals;
  },

  async getCropExpenses(cropId = null) {
    await delay(250);
    // For now, group by category since crop-specific expenses aren't in mock data
    // This can be enhanced when crop-expense relationships are added
    const filteredExpenses = expenses;
    
    const cropData = {};
    filteredExpenses.forEach(expense => {
      if (!cropData[expense.category]) {
        cropData[expense.category] = 0;
      }
      cropData[expense.category] += expense.amount;
    });
return cropData;
  }
};

export default expenseService;