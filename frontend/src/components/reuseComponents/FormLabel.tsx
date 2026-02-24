
interface propType {
  labelTitle: string;
  htmlForTitle?: string;
  required?: boolean
}

const FormLabel = ({ labelTitle, htmlForTitle, required }: propType) => {
  return (
    <label htmlFor={htmlForTitle} className="block text-sm font-medium text-gray-700 mb-2">
      {labelTitle}{" "}{required && <span className="text-red-600">*</span>}
    </label>
  );
};

export default FormLabel;
