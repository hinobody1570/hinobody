"use client";

interface ChatAvatarProps {
  letter: string; // can be image url OR single letter
  color?: string;
  size?: "sm" | "md" | "lg";
  showOnline?: boolean;
  gradient?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-9 h-9 text-[13px]",
  md: "w-11 h-11 text-[15px]",
  lg: "w-[72px] h-[72px] text-[26px]",
};

export function ChatAvatar({
  letter,
  color,
  size = "md",
  showOnline = false,
  gradient = false,
  className = "",
}: ChatAvatarProps) {
  // Simple check: if string starts with http or /
  const isImage =
    letter?.startsWith("http") || letter?.startsWith("/");

  const style =
    !isImage && color && !gradient
      ? { backgroundColor: color }
      : undefined;

  return (
    <div
      className={`
        flex-shrink-0 relative rounded-full flex items-center justify-center font-bold
        overflow-hidden
        ${sizeClasses[size]}
        ${
          !isImage
            ? gradient
              ? "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]"
              : "bg-red-500 text-white"
            : ""
        }
        ${className}
      `}
      style={style}
    >
      {isImage ? (
        <img
          src={letter}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{letter}</span>
      )}

      {showOnline && (
        <span
          className="absolute bottom-0.5 right-0.5 w-[11px] h-[11px] rounded-full bg-[#31d95e] border-2 border-black"
          aria-hidden
        />
      )}
    </div>
  );
}