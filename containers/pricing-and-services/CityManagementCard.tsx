'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createCity, updateCity, deleteCity } from '@/app/actions/manage-city';

interface City {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
}

interface CityManagementCardProps {
  cities: City[];
}

export function CityManagementCard({ cities }: CityManagementCardProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openAdd() {
    setEditingCity(null);
    setName('');
    setLatitude('');
    setLongitude('');
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(city: City) {
    setEditingCity(city);
    setName(city.name);
    setLatitude(city.latitude?.toString() ?? '');
    setLongitude(city.longitude?.toString() ?? '');
    setError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const lat = latitude.trim() ? parseFloat(latitude) : null;
    const lng = longitude.trim() ? parseFloat(longitude) : null;

    if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
      setError('Latitude must be between -90 and 90.');
      setSaving(false);
      return;
    }
    if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
      setError('Longitude must be between -180 and 180.');
      setSaving(false);
      return;
    }

    const result = editingCity
      ? await updateCity(editingCity.id, name, lat, lng)
      : await createCity(name, lat, lng);

    setSaving(false);

    if (result.success) {
      setDialogOpen(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleDelete(cityId: string, cityName: string) {
    if (!confirm(`Are you sure you want to remove "${cityName}"? Drivers assigned to this city will be unassigned.`)) {
      return;
    }

    const result = await deleteCity(cityId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <>
      <Card className="gap-4 py-5">
        <CardHeader className="px-5 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">City Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add, edit, or remove available cities
              </p>
            </div>
            <Button size="sm" onClick={openAdd}>
              <Plus className="size-4 mr-1.5" />
              Add City
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-5">
          {cities.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No cities configured yet. Add one to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {cities.map((city) => (
                <div
                  key={city.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{city.name}</p>
                      {city.latitude != null && city.longitude != null ? (
                        <p className="text-xs text-muted-foreground">
                          {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">No coordinates set</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => openEdit(city)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-500 hover:text-red-700"
                      onClick={() => void handleDelete(city.id, city.name)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCity ? 'Edit City' : 'Add City'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">City Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Iloilo City"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Latitude</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 10.7202"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Longitude</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 122.5621"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Coordinates are used to match passengers to cities based on their pickup location.
            </p>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving || !name.trim()}>
              {saving ? 'Saving...' : editingCity ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
