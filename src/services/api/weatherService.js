import weatherData from '../mockData/weather.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const weatherService = {
  async getForecast() {
    await delay(500);
    return [...weatherData];
  },

  async getTodaysWeather() {
    await delay(300);
    const today = new Date().toISOString().split('T')[0];
    const todayWeather = weatherData.find(w => w.date === today);
    
    if (!todayWeather) {
      // Return current day weather (first item) if today's date not found
      return { ...weatherData[0] };
    }
    
    return { ...todayWeather };
  }
};

export default weatherService;