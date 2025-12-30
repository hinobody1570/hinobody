import Image from "next/image";
import AvatarImage from '../../../public/assets/images/avatar_default_4.png'

interface AvatarType {
  color: string;
  onClick: () => void;
}

export const Avatar = ({ color = "bg-teal-400", onClick }: AvatarType) => {
  return (
    <button onClick={onClick} className="w-10 h-10 rounded-full hover:ring-2 hover:ring-gray-300 transition-all overflow-hidden">
      <div className={`w-full h-full ${color} flex items-center justify-center`}>
        <Image src={AvatarImage} alt="avatar" />
      </div>
    </button>
  );
};
