import Image from "next/image";
import LOGO_ICON from "../../../public/assets/images/logo/logo-icon.png"
import LOGO_TEXT from "../../../public/assets/images/logo/logo-text.png"

interface LogoType {
  text: string;
  onClick: () => void;
}

export const Logo = ({ text = "reddit", onClick }: LogoType) => {
  return (
    <button onClick={onClick} className="w-28 sm:w-32 md:w-40 cursor-pointer flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity">
      <Image src={LOGO_ICON} alt="LOGO_ICON" className="w-8 sm:w-10 md:w-12 object-fill"/>
      <Image src={LOGO_TEXT} alt="LOGO_TEXT" className="mt-2 hidden sm:block"/>
    </button>
  );
};
