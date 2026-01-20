interface TapTypes {
  label: string;
  active: boolean;
  onClick: () => void;
}
export const Tab = ({ label, active, onClick }: TapTypes) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-semibold text-sm transition-colors relative ${active ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
    >
      {label}
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
    </button>
  );
};
