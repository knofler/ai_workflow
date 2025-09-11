export default function Nav() {
  return (
    <header className="border-b border-zinc-200 bg-white/70 backdrop-blur">
      <nav className="container flex items-center gap-6 py-3">
        <a className="text-xl font-semibold" href="/">Workflow</a>
        <a className="text-zinc-600 hover:text-zinc-900" href="/definitions">Definitions</a>
        <a className="text-zinc-600 hover:text-zinc-900" href="/workflows">Workflows</a>
  <a className="text-zinc-600 hover:text-zinc-900" href="/fdt">FDT Form</a>
        <a className="text-zinc-600 hover:text-zinc-900" href="/instances">Instances</a>
        <a className="text-zinc-600 hover:text-zinc-900 ml-auto" href="/login">Login</a>
      </nav>
    </header>
  );
}
