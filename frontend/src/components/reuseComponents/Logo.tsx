interface LogoType {
  text: string;
  onClick: () => void;
}

export const Logo = ({ text = "reddit", onClick }: LogoType) => {
  return (
    <button onClick={onClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <span className="text-3xl font-bold text-orange-500 hidden sm:inline">{text}</span>
    </button>
  );
};
