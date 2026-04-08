"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createCity, updateCity, deleteCity } from "@/app/actions/manage-city"
import type { fetchCitiesWithCoords } from "@/lib/supabase/queries"

type City = Awaited<ReturnType<typeof fetchCitiesWithCoords>>[number]

interface CityManagementTabProps {
  cities: City[]
}

export function CityManagementTab({ cities }: CityManagementTabProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<City | null>(null)
  const [name, setName] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openAdd() {
    setEditingCity(null)
    setName("")
    setLatitude("")
    setLongitude("")
    setError(null)
    setDialogOpen(true)
  }

  function openEdit(city: City) {
    setEditingCity(city)
    setName(city.name)
    setLatitude(city.latitude?.toString() ?? "")
    setLongitude(city.longitude?.toString() ?? "")
    setError(null)
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const lat = latitude.trim() ? parseFloat(latitude) : null
    const lng = longitude.trim() ? parseFloat(longitude) : null

    if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
      setError("Latitude must be between -90 and 90.")
      setSaving(false)
      return
    }
    if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
      setError("Longitude must be between -180 and 180.")
      setSaving(false)
      return
    }

    const result = editingCity
      ? await updateCity(editingCity.id, name, lat, lng)
      : await createCity(name, lat, lng)

    setSaving(false)

    if (result.success) {
      setDialogOpen(false)
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteCity(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    if (result.success) {
      router.refresh()
    }
  }

  return (
    <>
      <div
        className="overflow-hidden rounded-xl bg-white"
        style={{
          border: "1px solid #DCE6F1",
          boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #EEF3F9" }}
        >
          <div>
            <p
              className="text-sm font-semibold text-[#0D1B2A]"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              City Management
            </p>
            <p className="text-xs text-[#4A607A]">
              Add, edit, or remove available cities
            </p>
          </div>
          <Button size="sm" onClick={openAdd} className="gap-1.5">
            <Plus className="size-3.5" aria-hidden />
            Add City
          </Button>
        </div>

        {/* City list */}
        <div className="p-5">
          {cities.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#F4F6FB]">
                <MapPin className="size-7 text-[#8BACC8]" aria-hidden />
              </div>
              <p className="text-sm font-medium text-[#0D1B2A]">
                No cities configured yet
              </p>
              <p className="text-xs text-[#8BACC8]">
                Add a city to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {cities.map((city) => (
                <div
                  key={city.id}
                  className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-[#F4F8FF]"
                  style={{ border: "1px solid #EEF3F9" }}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="size-4 shrink-0 text-[#1A56DB]" aria-hidden />
                    <div>
                      <p className="text-sm font-semibold text-[#0D1B2A]">
                        {city.name}
                      </p>
                      {city.latitude != null && city.longitude != null ? (
                        <p className="font-mono text-xs text-[#4A607A]">
                          {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                        </p>
                      ) : (
                        <p className="text-xs text-[#8BACC8]">
                          No coordinates set
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-[#4A607A] hover:text-[#0D1B2A]"
                      onClick={() => openEdit(city)}
                      aria-label={`Edit ${city.name}`}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-[#4A607A] hover:text-red-600"
                      onClick={() => setDeleteTarget(city)}
                      aria-label={`Delete ${city.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCity ? "Edit City" : "Add City"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0D1B2A]">
                City Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Iloilo City"
                style={{ borderColor: "#DCE6F1" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0D1B2A]">
                  Latitude
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 10.7202"
                  style={{ borderColor: "#DCE6F1" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0D1B2A]">
                  Longitude
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 122.5621"
                  style={{ borderColor: "#DCE6F1" }}
                />
              </div>
            </div>
            <p className="text-xs text-[#8BACC8]">
              Coordinates are used to match passengers to cities based on their
              pickup location.
            </p>
            {error ? (
              <p
                className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600"
                style={{ border: "1px solid #FECACA" }}
              >
                {error}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={saving || !name.trim()}
            >
              {saving
                ? "Saving…"
                : editingCity
                  ? "Update"
                  : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Drivers assigned to this city will be unassigned. This action can
              be reversed by re-adding the city.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
