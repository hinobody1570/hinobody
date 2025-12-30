import { IoIosSearch } from "react-icons/io";
import { PiIntersectThree } from "react-icons/pi";

export const SearchBar = ({ placeholder = "Find anything" }) => {
  return (
    <div className="relative flex-1 max-w-2xl">
      {/* Left search icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <IoIosSearch size={20} />
      </div>

      {/* Input */}
      <input
      style={{padding: "8px"}}  
        type="text"
        placeholder={placeholder}
        className="
          w-full
          pl-12
          pr-24
          py-2.5
          bg-gray-100
          border border-gray-200
          rounded-full
          focus:outline-none
          focus:border-orange-500
          focus:bg-white
          transition-colors
          text-center
        "
      />

      {/* Right button inside input */}
      <button
        type="button"
        className="
          absolute
          right-2
          top-1/2
          -translate-y-1/2
          flex
          items-center
          gap-1
          px-3
          py-3
          rounded-full
          text-sm
          text-black
        "
      >
        <PiIntersectThree size={16} className="text-orange-600"/>
        Ask
      </button>
    </div>
  );
};
