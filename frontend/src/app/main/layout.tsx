import MainLayout from "@/components/layouts/MainLayout";

/**
 * Layout for routes that need Sidebar and TopHeader
 * 
 * Routes in the main folder will automatically use this layout.
 * The main content area will change based on the route.
 * Note: URLs will include /main/ prefix (e.g., /main/home, /main/dashboard)
 */
export default function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}

