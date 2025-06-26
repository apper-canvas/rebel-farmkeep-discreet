import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';

const WeatherCard = ({ weather, isToday = false, className = '' }) => {
  const getWeatherIcon = (condition) => {
    const icons = {
      'sunny': 'Sun',
      'partly-cloudy': 'CloudSun',
      'cloudy': 'Cloud',
      'rainy': 'CloudRain',
      'stormy': 'CloudLightning',
      'snowy': 'CloudSnow'
    };
    return icons[condition] || 'Sun';
  };

  const getConditionColor = (condition) => {
    const colors = {
      'sunny': 'text-yellow-500',
      'partly-cloudy': 'text-blue-400',
      'cloudy': 'text-gray-500',
      'rainy': 'text-blue-600',
      'stormy': 'text-purple-600',
      'snowy': 'text-blue-300'
    };
    return colors[condition] || 'text-gray-500';
  };

  const weatherDate = new Date(weather.date);

  return (
    <Card 
      className={`text-center ${isToday ? 'ring-2 ring-primary ring-opacity-50' : ''} ${className}`}
      hover
    >
      {isToday && (
        <div className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium mb-3 inline-block">
          Today
        </div>
      )}
      
      <div className="space-y-3">
        {/* Date */}
        <p className="text-sm font-medium text-gray-600">
          {format(weatherDate, 'EEE, MMM d')}
        </p>

        {/* Weather Icon */}
        <div className={`mx-auto w-12 h-12 flex items-center justify-center ${getConditionColor(weather.condition)}`}>
          <ApperIcon name={getWeatherIcon(weather.condition)} size={48} />
        </div>

        {/* Temperature */}
        <div>
          <p className="text-2xl font-bold text-gray-900">{weather.high}°</p>
          <p className="text-sm text-gray-500">{weather.low}°</p>
        </div>

        {/* Condition */}
        <p className="text-sm font-medium text-gray-700 capitalize">
          {weather.condition.replace('-', ' ')}
        </p>

        {/* Additional Info */}
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <ApperIcon name="Droplets" size={12} />
              <span>{weather.precipitation}%</span>
            </div>
            <div className="flex items-center gap-1">
              <ApperIcon name="Wind" size={12} />
              <span>{weather.windSpeed} mph</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1">
            <ApperIcon name="Gauge" size={12} />
            <span>{weather.humidity}% humidity</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherCard;