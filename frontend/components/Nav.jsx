export default function Nav() {
  return (
    <header className="border-b border-zinc-200 bg-white/70 backdrop-blur">
      <nav className="container flex items-center gap-6 py-3">
        <a className="text-xl font-semibold" href="/">Workflow</a>

        {/* Forms dropdown */}
        <div className="relative group" tabIndex={0}>
          <button className="text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1 focus:outline-none" aria-haspopup="true" aria-expanded="false">
            Forms
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/></svg>
          </button>
          <div className="absolute left-0 mt-2 hidden group-hover:block group-focus-within:block bg-white border border-zinc-200 rounded-md shadow-lg min-w-48 z-50">
            <a className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50" href="/fdt">FDT Form</a>
            <a className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50" href="/concrete">Concrete</a>
          </div>
        </div>

        {/* Admin dropdown */}
        <div className="relative group" tabIndex={0}>
          <button className="text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1 focus:outline-none" aria-haspopup="true" aria-expanded="false">
            Admin
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/></svg>
          </button>
          <div className="absolute left-0 mt-2 hidden group-hover:block group-focus-within:block bg-white border border-zinc-200 rounded-md shadow-lg min-w-48 z-50">
            <a className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50" href="/definitions">Definitions</a>
            <a className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50" href="/workflows">Workflows</a>
            <a className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50" href="/instances">Instances</a>
          </div>
        </div>

        <a className="text-zinc-600 hover:text-zinc-900 ml-auto" href="/login">Login</a>
      </nav>
    </header>
  );
}
