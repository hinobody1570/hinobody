import ButtonLoader from "./ButtonLoader";

interface propTypes {
  handleSubmit: () => void;
  disabled?: boolean;
  title: string;
  loadingTitle?: string;
  className? : string
}

const FormButton = ({ handleSubmit, disabled, title, loadingTitle ,className}: propTypes) => {
  return (
    <button
      onClick={handleSubmit}
      disabled={disabled}
      className={`cursor-pointer w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${className }`}
    >
      {disabled ? (
        <span className="flex items-center justify-center">
          <ButtonLoader />
          {loadingTitle && loadingTitle}
        </span>
      ) : (
        <>{title}</>
      )}
    </button>
  );
};

export default FormButton;
