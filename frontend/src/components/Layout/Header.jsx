export default function Header() {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-blue-600" />
          <span className="font-semibold">Expense Management</span>
        </div>
        <div className="text-xs text-gray-500">Built with React + Tailwind</div>
      </div>
    </header>
  )
}
