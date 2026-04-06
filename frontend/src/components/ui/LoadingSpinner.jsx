export default function LoadingSpinner({ size = 'md', message }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-2 border-surface-600 border-t-accent-cyan rounded-full animate-spin`} />
      {message && <p className="text-sm text-gray-500 font-mono">{message}</p>}
    </div>
  );
}
