/**
 * Chat route uses a full-screen layout (no sidebar, no top header).
 * Used only when the main layout wrapper skips MainLayout for /main/chat.
 */
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full overflow-hidden bg-black text-white">
      {children}
    </div>
  );
}
