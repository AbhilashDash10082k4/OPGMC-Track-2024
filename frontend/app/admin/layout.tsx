
export const metadata = {
  title: "Admin - OPGMC Track",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-linear-to-b from-slate-900 via-slate-950 to-gray-900 text-white">
        {/* <Navbar /> */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
