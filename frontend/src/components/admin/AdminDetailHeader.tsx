import React from "react";
import { FaArrowLeft } from "react-icons/fa";

interface propTypes {
    title: string;
    onClick: ()=> void;
}

const AdminDetailHeader = ({title, onClick}:propTypes ) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={onClick} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 cursor-pointer">
          <FaArrowLeft size={22} />
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </button>
      </div>
    </div>
  );
};

export default AdminDetailHeader;
