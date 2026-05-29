export default function LoadingSpinner({ className = 'h-8 w-auto' }: { className?: string }) {
  return (
    <div className="flex items-center justify-center">
      <img src="/logo-icon.svg" alt="loading" className={`${className} opacity-40 animate-spin-slow`} />
    </div>
  );
}
