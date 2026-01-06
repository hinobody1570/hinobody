import { ReactNode } from "react";

interface FormInputProps {
  id: string;
  name: string;
  type?: string;
  value: any;
  placeholder?: string;
  icon?: ReactNode;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  rightElement?: ReactNode;
}

export default function FormInput({
  id,
  name,
  type = "text",
  value,
  placeholder,
  icon,
  error,
  onChange,
  onKeyPress,
  rightElement,
}: FormInputProps) {
  return (
    <div>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          className={`w-full ${
            icon ? "pl-10" : "pl-4"
          } ${rightElement ? "pr-12" : "pr-4"} py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
