export default function Card({ title, action, children }) {
  return (
    <section className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        <div className="ml-auto">{action}</div>
      </div>
      {children}
    </section>
  );
}
