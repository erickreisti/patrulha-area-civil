export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex">
        {/* Conteúdo Principal - SEM sidebar e header */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
