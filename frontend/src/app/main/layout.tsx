import MainLayoutWrapper from "@/layouts/MainLayoutWrapper";

/**
 * Layout for routes that need Sidebar and TopHeader.
 * Chat (/main/chat) uses a different full-screen layout and is not wrapped.
 * Note: URLs will include /main/ prefix (e.g., /main/home, /main/dashboard)
 */
export default function MainLayoutRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayoutWrapper>{children}</MainLayoutWrapper>;
}

