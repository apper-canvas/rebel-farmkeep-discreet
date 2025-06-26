import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';

const FormField = ({ type = 'input', name, ...props }) => {
  if (type === 'select') {
    return <Select name={name} {...props} />;
  }
  
  return <Input name={name} {...props} />;
};

export default FormField;