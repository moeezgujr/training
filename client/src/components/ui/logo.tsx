interface LogoProps {
  className?: string;
  height?: number;
}

export function Logo({ className = "", height = 40 }: LogoProps) {
  return (
    <img 
      src="/logo.png"
      alt="Meeting Matters Logo" 
      className={className}
      height={height}
      style={{ height: `${height}px`, width: 'auto' }}
    />
  );
}