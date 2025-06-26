import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, addDays } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import WeatherCard from '@/components/molecules/WeatherCard';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import weatherService from '@/services/api/weatherService';

const Weather = () => {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await weatherService.getForecast();
      setForecast(data);
    } catch (err) {
      setError(err.message || 'Failed to load weather data');
      toast.error('Failed to load weather forecast');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherAdvice = (weather) => {
    const advice = [];
    
    if (weather.precipitation > 70) {
      advice.push({
        type: 'warning',
        icon: 'CloudRain',
        message: 'Heavy rain expected - postpone irrigation and outdoor work'
      });
    } else if (weather.precipitation > 30) {
      advice.push({
        type: 'info',
        icon: 'Droplets',
        message: 'Light rain possible - monitor soil moisture levels'
      });
    }
    
    if (weather.high > 85) {
      advice.push({
        type: 'warning',
        icon: 'Thermometer',
        message: 'High temperatures - ensure adequate irrigation for crops'
      });
    }
    
    if (weather.windSpeed > 20) {
      advice.push({
        type: 'caution',
        icon: 'Wind',
        message: 'Strong winds - secure loose materials and check plant support'
      });
    }
    
    if (weather.humidity < 30) {
      advice.push({
        type: 'info',
        icon: 'Gauge',
        message: 'Low humidity - increase watering frequency for sensitive plants'
      });
    }
    
    return advice;
  };

  const getAdviceColor = (type) => {
    const colors = {
      warning: 'bg-red-50 border-red-200 text-red-800',
      caution: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    return colors[type] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-surface-200 rounded w-48 animate-pulse mb-2" />
          <div className="h-4 bg-surface-200 rounded w-96 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <SkeletonLoader count={5} type="card" />
        </div>
        <SkeletonLoader count={3} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadWeatherData} />
      </div>
    );
  }

  const todaysWeather = forecast[0];
  const todaysAdvice = todaysWeather ? getWeatherAdvice(todaysWeather) : [];

  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      animate="animate"
      className="p-6 space-y-8 max-w-full overflow-hidden"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Weather Forecast</h1>
        <p className="text-gray-600">
          5-day weather forecast with agricultural insights for your farming operations
        </p>
      </motion.div>

      {/* 5-Day Forecast */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">5-Day Forecast</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {forecast.map((weather, index) => (
            <motion.div
              key={weather.date}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
            >
              <WeatherCard 
                weather={weather} 
                isToday={index === 0}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Today's Detailed View */}
      {todaysWeather && (
        <motion.div variants={fadeInUp}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weather Details */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Conditions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-surface-50 rounded-lg">
                  <ApperIcon name="Thermometer" size={24} className="text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{todaysWeather.high}°F</div>
                  <div className="text-sm text-gray-600">High</div>
                </div>
                
                <div className="text-center p-4 bg-surface-50 rounded-lg">
                  <ApperIcon name="Snowflake" size={24} className="text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{todaysWeather.low}°F</div>
                  <div className="text-sm text-gray-600">Low</div>
                </div>
                
                <div className="text-center p-4 bg-surface-50 rounded-lg">
                  <ApperIcon name="Droplets" size={24} className="text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{todaysWeather.precipitation}%</div>
                  <div className="text-sm text-gray-600">Rain Chance</div>
                </div>
                
                <div className="text-center p-4 bg-surface-50 rounded-lg">
                  <ApperIcon name="Wind" size={24} className="text-gray-600 mx-auto mb-2" />
<div className="text-2xl font-bold text-gray-900">{todaysWeather.wind_speed}</div>
                  <div className="text-sm text-gray-600">mph</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-surface-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Humidity</span>
                  <span className="text-sm font-semibold text-gray-900">{todaysWeather.humidity}%</span>
                </div>
              </div>
            </Card>

            {/* Agricultural Advice */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Advisory</h3>
              {todaysAdvice.length === 0 ? (
                <div className="text-center py-8">
                  <ApperIcon name="CheckCircle" size={48} className="text-green-500 mx-auto mb-3" />
                  <p className="text-green-700 font-medium">Perfect weather conditions!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Ideal day for most farming activities
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysAdvice.map((advice, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${getAdviceColor(advice.type)}`}
                    >
                      <div className="flex items-start gap-2">
                        <ApperIcon name={advice.icon} size={18} className="flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{advice.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      )}

      {/* Weekly Summary */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Summary</h2>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(forecast.reduce((sum, day) => sum + day.high, 0) / forecast.length)}°F
              </div>
              <div className="text-sm text-gray-600">Avg High</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(forecast.reduce((sum, day) => sum + day.low, 0) / forecast.length)}°F
              </div>
              <div className="text-sm text-gray-600">Avg Low</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {forecast.filter(day => day.precipitation > 50).length}
              </div>
              <div className="text-sm text-gray-600">Rainy Days</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(forecast.reduce((sum, day) => sum + day.humidity, 0) / forecast.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg Humidity</div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Weather;