export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="text-5xl mb-4 opacity-30">{icon || '📭'}</div>
      <h3 className="text-base font-semibold text-gray-400 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
