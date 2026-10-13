export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`card-saas ${hover ? 'card-saas-hover cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`p-5 sm:p-6 pb-2 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-base sm:text-lg font-bold text-slate-900 tracking-tight ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-5 sm:p-6 pt-3 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`p-5 sm:p-6 pt-3 border-t border-slate-100 flex items-center justify-between ${className}`}>{children}</div>;
}
