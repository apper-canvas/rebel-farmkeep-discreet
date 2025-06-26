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
    return true;
  }
};

export default expenseService;