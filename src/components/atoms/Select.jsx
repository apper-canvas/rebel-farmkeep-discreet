import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Select = ({
  label,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select an option',
  error = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;
  const showFloatingLabel = isFocused || hasValue;

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Select Field */}
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 bg-white appearance-none cursor-pointer
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-surface-300 focus:border-primary focus:ring-primary/20'
            }
            ${disabled ? 'bg-surface-100 cursor-not-allowed' : 'focus:ring-4'}
          `}
          {...props}
        >
          {!hasValue && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <ApperIcon name="ChevronDown" size={18} />
        </div>
        
        {/* Floating Label */}
        {label && (
          <label
            className={`
              absolute left-4 transition-all duration-200 pointer-events-none
              ${showFloatingLabel
                ? 'top-1 text-xs font-medium text-primary bg-white px-1 -ml-1'
                : 'top-1/2 -translate-y-1/2 text-gray-500'
              }
              ${error && showFloatingLabel ? 'text-red-600' : ''}
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <ApperIcon name="AlertCircle" size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;