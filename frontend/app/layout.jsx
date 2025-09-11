import './globals.css';
import Nav from '../components/Nav.jsx';
export const metadata = { title: 'Workflow Platform' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900 min-h-screen">
        <Nav />
        <div className="container py-6">{children}</div>
      </body>
    </html>
  );
}
