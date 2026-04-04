import type { Driver } from "@/types/driver"

const SEED_DRIVERS: Driver[] = [
  {
    id: "DRV-8832",
    name: "Liam Johnson",
    phone: "+1 (555) 123-4567",
    city: "New York",
    serviceType: "Basic",
    status: "Active",
    docStatus: "Verified",
    rating: 4.92,
  },
  {
    id: "DRV-9921",
    name: "Sarah Connor",
    phone: "+1 (555) 987-6543",
    city: "London",
    serviceType: "Basic",
    status: "Inactive",
    docStatus: "Pending",
    rating: 4.5,
  },
  {
    id: "DRV-1102",
    name: "Michael Chen",
    phone: "+1 (555) 234-8901",
    city: "San Francisco",
    serviceType: "XL",
    status: "Suspended",
    docStatus: "Rejected",
    rating: 3.8,
  },
  {
    id: "DRV-4451",
    name: "Emily Davis",
    phone: "+1 (555) 777-1234",
    city: "New York",
    serviceType: "Basic",
    status: "Active",
    docStatus: "Verified",
    rating: 4.88,
  },
  {
    id: "DRV-3319",
    name: "James Wilson",
    phone: "+1 (555) 333-8888",
    city: "London",
    serviceType: "Basic",
    status: "Active",
    docStatus: "No Docs",
    rating: 4.75,
  },
]

// Expand to 48 drivers for pagination demo (repeat seeds with unique ids)
export const MOCK_DRIVERS: Driver[] = Array.from({ length: 48 }, (_, i) => {
  const d = SEED_DRIVERS[i % SEED_DRIVERS.length]
  return { ...d, id: `DRV-${String(1000 + i).padStart(4, "0")}` }
})
