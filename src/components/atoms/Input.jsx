import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = ({
  label,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  error = '',
  icon,
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
      {/* Input Field */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <ApperIcon name={icon} size={18} />
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={!showFloatingLabel ? placeholder : ''}
          disabled={disabled}
          className={`
            w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 bg-white
            ${icon ? 'pl-11' : ''}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-surface-300 focus:border-primary focus:ring-primary/20'
            }
            ${disabled ? 'bg-surface-100 cursor-not-allowed' : 'focus:ring-4'}
            placeholder-gray-400
          `}
          {...props}
        />
        
        {/* Floating Label */}
        {label && (
          <label
            className={`
              absolute left-4 transition-all duration-200 pointer-events-none
              ${icon ? 'left-11' : 'left-4'}
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

export default Input;