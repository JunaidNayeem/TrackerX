import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Zap,
  HeartPulse,
  Wallet,
  Circle,
  Home,
  Plane,
  GraduationCap,
  Gift,
  Briefcase,
  type LucideProps,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  utensils: Utensils,
  car: Car,
  "shopping-bag": ShoppingBag,
  film: Film,
  zap: Zap,
  "heart-pulse": HeartPulse,
  wallet: Wallet,
  circle: Circle,
  home: Home,
  plane: Plane,
  "graduation-cap": GraduationCap,
  gift: Gift,
  briefcase: Briefcase,
}

interface CategoryIconProps extends LucideProps {
  icon: string
}

export function CategoryIcon({ icon, ...props }: CategoryIconProps) {
  const IconComponent = iconMap[icon] || Circle
  return <IconComponent {...props} />
}
