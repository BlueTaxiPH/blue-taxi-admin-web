export const ACTIVE_STATUSES = new Set([
  "accepted",
  "navigating_to_pickup",
  "arrived_at_pickup",
  "waiting_for_passenger",
  "trip_in_progress",
  "dropped_off",
  "input_fare",
  "fare_confirmed",
])

export const STATUS_LABELS: Record<string, string> = {
  pending:               "Pending",
  accepted:              "Accepted",
  navigating_to_pickup:  "En Route",
  arrived_at_pickup:     "At Pickup",
  waiting_for_passenger: "Waiting",
  trip_in_progress:      "In Progress",
  dropped_off:           "Dropped Off",
  input_fare:            "Entering Fare",
  fare_confirmed:        "Fare Confirmed",
  completed:             "Completed",
  cancelled:             "Cancelled",
}

export const STATUS_COLORS: Record<string, string> = {
  pending:               "#F59E0B",
  accepted:              "#3B82F6",
  navigating_to_pickup:  "#3B82F6",
  arrived_at_pickup:     "#6366F1",
  waiting_for_passenger: "#8B5CF6",
  trip_in_progress:      "#1A56DB",
  dropped_off:           "#0D9488",
  input_fare:            "#059669",
  fare_confirmed:        "#10B981",
  completed:             "#059669",
  cancelled:             "#EF4444",
}
