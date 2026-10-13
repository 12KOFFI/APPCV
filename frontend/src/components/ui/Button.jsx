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
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] hover:-translate-y-0.5';

  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-black shadow-xs hover:shadow-md border border-slate-900',
    secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-2xs hover:shadow-xs',
    outline: 'bg-white text-blue-700 border border-blue-600 hover:bg-blue-50/50 hover:border-blue-700 shadow-2xs',
    ghost: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    accent: 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs hover:shadow-md border border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-xs border border-transparent',
    'danger-soft': 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
    'danger-outline': 'bg-transparent text-red-600 border border-red-200 hover:bg-red-50',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 rounded-md gap-1.5',
    md: 'text-xs sm:text-sm px-5 py-2.5 rounded-lg gap-2',
    lg: 'text-sm sm:text-base px-7 py-3 rounded-lg gap-2.5 font-bold',
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
