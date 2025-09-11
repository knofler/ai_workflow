"use client";
import { useEffect, useRef, useState } from 'react';

export default function Nav() {
  const [open, setOpen] = useState({ forms: false, admin: false, reports: false });
  const [dark, setDark] = useState(false);
  const navRef = useRef(null);
  useEffect(()=>{
    const saved = localStorage.getItem('theme');
    const isDark = saved ? saved === 'dark' : false;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);
  useEffect(()=>{
    const onDocClick = (e) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target)) setOpen({ forms:false, admin:false, reports:false });
    };
    document.addEventListener('mousedown', onDocClick);
    return ()=> document.removeEventListener('mousedown', onDocClick);
  }, []);
  const toggleTheme = () => {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };
  const Menu = ({ label, keyName, items }) => (
    <div className="relative">
      <button
        className="text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 inline-flex items-center gap-1 focus:outline-none"
        aria-haspopup="true"
        aria-expanded={open[keyName]}
        onClick={()=> setOpen(o=> ({...o, [keyName]: !o[keyName]}))}
      >
        {label}
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/></svg>
      </button>
      {open[keyName] && (
        <div className="absolute left-0 top-full pt-2 bg-transparent z-50">
          <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg min-w-48 p-1">
          {items.map(i=> (
            <a key={i.href} className="block px-3 py-2 text-sm text-zinc-700 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded" href={i.href} onClick={()=> setOpen(o=> ({...o, [keyName]: false}))}>{i.label}</a>
          ))}
          </div>
        </div>
      )}
    </div>
  );
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/60 backdrop-blur" ref={navRef}>
      <nav className="container flex items-center gap-6 py-3">
        <a className="text-xl font-semibold text-zinc-900 dark:text-zinc-100" href="/">Workflow</a>

        <Menu label="Forms" keyName="forms" items={[
          { label: 'FDT Form', href: '/fdt' },
          { label: 'Concrete', href: '/concrete' },
          { label: 'New Project', href: '/projects/new' },
          { label: 'New Truck', href: '/trucks/new' },
          { label: 'New Physical Props', href: '/masters/physical-props/new' },
        ]} />

        <Menu label="Reports" keyName="reports" items={[
          { label: 'Concrete Reports', href: '/reports/concrete' },
          { label: 'FDT Reports', href: '/reports/fdt' },
        ]} />

        <Menu label="Admin" keyName="admin" items={[
          { label: 'Definitions', href: '/definitions' },
          { label: 'Workflows', href: '/workflows' },
          { label: 'Instances', href: '/instances' },
        ]} />

        <div className="ml-auto flex items-center gap-3">
          <button className="text-sm text-zinc-700 dark:text-zinc-200" onClick={toggleTheme}>{dark ? 'Light' : 'Dark'} Mode</button>
          <a className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900" href="/login">Login</a>
        </div>
      </nav>
    </header>
  );
}
