import React from 'react';

interface IconButtonType {
    icon: React.ComponentType<{ size?: number }>;
    iconMobile?: React.ComponentType<{ size?: number }>;
    label?: string,
    variant?: string,
    onClick: () => void,
}

export const IconButton = ({ icon: Icon, iconMobile: IconMobile, label, variant = 'default', onClick }: IconButtonType) => {
  const baseStyles = "flex items-center gap-2 px-3 py-2 rounded-full transition-colors";
  const variants:any = {
    default: "",
    primary: "bg-orange-500 text-white hover:bg-orange-600",
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} cursor-pointer`}
      aria-label={label}
    >
      {IconMobile ? (
        <>
          <span className="md:hidden" aria-hidden="true"><IconMobile size={20} /></span>
          <span className="hidden md:block" aria-hidden="true"><Icon size={20} /></span>
        </>
      ) : (
        <Icon size={20} />
      )}
      {label && <span className="hidden md:inline text-sm font-semibold">{label}</span>}
    </button>
  );
};