import { useState } from "react";
import { FaRegEyeSlash } from "react-icons/fa";
import { FiLock } from "react-icons/fi";
import { LuEye } from "react-icons/lu";
import FormInput from "./FormInput";

interface PasswordInputProps {
  value: any;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function PasswordInput({
  value,
  error,
  onChange,
  onKeyPress,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormInput
      id="password"
      name="password"
      type={showPassword ? "text" : "password"}
      value={value}
      placeholder="••••••••"
      icon={<FiLock className="h-5 w-5 text-gray-400" />}
      error={error}
      onChange={onChange}
      onKeyPress={onKeyPress}
      rightElement={
        <button type="button" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <FaRegEyeSlash className="h-5 w-5 text-gray-400" />
          ) : (
            <LuEye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      }
    />
  );
}
