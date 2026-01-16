import Image from "next/image";
import AvatarImage from "../../../public/assets/images/avatar_default_4.png";
import { useAuth } from "@/contexts/AuthContext";

interface AvatarType {
  color: string;
  onClick: () => void;
}

export const Avatar = ({ color = "bg-teal-400", onClick }: AvatarType) => {
  const { user } = useAuth();
  return (
    <button onClick={onClick} className="w-10 h-10 rounded-full hover:ring-2 hover:ring-gray-300 transition-all overflow-hidden cursor-pointer">
      <div className={`w-full h-full ${color} flex items-center justify-center`}>
        <Image width={50} height={50} src={user?.avatar ?? AvatarImage} alt="avatar" className="h-8 w-8" />
      </div>
    </button>
  );
};
