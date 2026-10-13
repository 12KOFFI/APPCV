export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-transparent',
    secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs',
    ghost: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    accent: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-xs border border-transparent',
    'danger-soft': 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
    'danger-outline': 'bg-transparent text-red-600 border border-red-200 hover:bg-red-50',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-full gap-1.5',
    md: 'text-sm px-4 py-2 rounded-full gap-2',
    lg: 'text-base px-6 py-3 rounded-full gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && <div className="spinner-sm" />}
      {children}
    </button>
  );
}
