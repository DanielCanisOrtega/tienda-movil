import { Button } from "@/components/ui/button"

interface ProfileActionButtonProps {
  label: string
  variant?: "default" | "outline"
}

export function ProfileActionButton({ label, variant = "default" }: ProfileActionButtonProps) {
  return (
    <Button
      className={`w-full ${
        variant === "default"
          ? "bg-primary hover:bg-primary-dark"
          : "bg-white text-primary border border-primary hover:bg-primary/10"
      }`}
    >
      {label}
    </Button>
  )
}

