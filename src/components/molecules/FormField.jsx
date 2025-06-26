import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import DatePicker from '@/components/atoms/DatePicker';

const FormField = ({ type = 'input', name, ...props }) => {
  if (type === 'select') {
    return <Select name={name} {...props} />;
  }
  
  if (type === 'datepicker' || type === 'date' || type === 'datetime-local') {
    const dateType = type === 'datetime-local' ? 'datetime' : 'date';
    return <DatePicker name={name} type={dateType} {...props} />;
  }
  
  return <Input name={name} {...props} />;
};

export default FormField;