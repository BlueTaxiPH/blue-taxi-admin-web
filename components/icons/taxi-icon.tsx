import { cn } from "@/lib/utils"

function TaxiIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-10", className)}
      {...props}
    >
      <path d="M8 17h8" />
      <path d="M6 11l2-4h8l2 4" />
      <path d="M6 11v6" />
      <path d="M18 11v6" />
      <circle cx="7.5" cy="17" r="1.5" />
      <circle cx="16.5" cy="17" r="1.5" />
      <path d="M4 7h16" />
    </svg>
  )
}

export { TaxiIcon }
