
interface propType {
  labelTitle: string;
  htmlForTitle?: string;
}

const FormLabel = ({ labelTitle, htmlForTitle }: propType) => {
  return (
    <label htmlFor={htmlForTitle} className="block text-sm font-medium text-gray-700 mb-2">
      {labelTitle}{" "}
    </label>
  );
};

export default FormLabel;
