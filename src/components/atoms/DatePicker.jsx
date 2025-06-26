import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';

const DatePicker = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  type = 'date', // 'date' or 'datetime'
  className = '',
  icon = 'Calendar',
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');

  // Convert value to input format when value changes
  useEffect(() => {
    if (value) {
      try {
        const date = typeof value === 'string' ? parseISO(value) : new Date(value);
        if (type === 'datetime') {
          // Format for datetime-local input (YYYY-MM-DDTHH:mm)
          setInputValue(format(date, "yyyy-MM-dd'T'HH:mm"));
        } else {
          // Format for date input (YYYY-MM-DD)
          setInputValue(format(date, 'yyyy-MM-dd'));
        }
      } catch (error) {
        setInputValue('');
      }
    } else {
      setInputValue('');
    }
  }, [value, type]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      if (newValue) {
        try {
          // Convert back to ISO string for consistency with existing date handling
          const date = new Date(newValue);
          onChange({ target: { name, value: date.toISOString() } });
        } catch (error) {
          onChange({ target: { name, value: newValue } });
        }
      } else {
        onChange({ target: { name, value: '' } });
      }
    }
  };

  const inputId = `${name}-${Math.random().toString(36).substr(2, 9)}`;
  const inputType = type === 'datetime' ? 'datetime-local' : 'date';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ApperIcon name={icon} className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <input
          id={inputId}
          name={name}
          type={inputType}
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:border-primary focus:ring-primary focus:ring-1
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            text-sm
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <ApperIcon name="AlertCircle" size={16} />
          {error}
        </p>
      )}
    </div>
  );
};

export default DatePicker;