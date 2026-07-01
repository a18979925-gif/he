import * as Icons from "lucide-react";

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function LucideIcon({ name, className, size = 18 }: LucideIconProps) {
  // Map dynamic string lookup
  const IconComponent = (Icons as any)[name];

  if (!IconComponent) {
    // Return standard fallback
    const Fallback = Icons.HelpCircle;
    return <Fallback className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
}
