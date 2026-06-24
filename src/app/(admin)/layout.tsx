import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen">{children}</div>
    </>
  );
}
