import Image from "next/image";
import LOGO_ICON from "../../../public/assets/images/logo/logo-icon.png"
import LOGO_TEXT from "../../../public/assets/images/logo/logo-text.png"

interface LogoType {
  text: string;
  onClick: () => void;
}

export const Logo = ({ text = "reddit", onClick }: LogoType) => {
  return (
    <button onClick={onClick} className="w-40 cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity">
      <Image src={LOGO_ICON} alt="LOGO_ICON" className="w-12 object-fill"/>
      <Image src={LOGO_TEXT} alt="LOGO_TEXT" className="mt-2"/>
    </button>
  );
};
