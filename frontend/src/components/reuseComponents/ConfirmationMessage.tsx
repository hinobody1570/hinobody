import { BiCheckCircle } from "react-icons/bi";
import FormButton from "./FormButton";

interface propTyps {
  message: string;
  title: string;
  onClick?: () => void
  buttonTitle?: string
}

const ConfirmationMessage = ({ message, title ,buttonTitle ,onClick}: propTyps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-4 flex justify-center">
          <BiCheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{message}</p>
        {buttonTitle && onClick && <FormButton className="mt-4" title={buttonTitle} handleSubmit={onClick}/>}
      </div>
    </div>
  );
};

export default ConfirmationMessage;
