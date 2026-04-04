# City Management CRUD — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add city CRUD (create, read, update, delete) to the Pricing & Services page so admins can manage the list of available cities without touching SQL.

**Architecture:** Three server actions (create/update/delete) following the existing `requireAdmin()` + `createAdminClient()` pattern. A new `CityManagementCard` client component with an inline table + dialog modals for add/edit. Delete uses soft-delete (is_active = false) to preserve FK references. All changes revalidate the pricing page path.

**Tech Stack:** Next.js 16 server actions, Supabase admin client, shadcn/ui (Dialog, Input, Button, Table), TypeScript

---

## File Structure

```
New Files:
  app/actions/manage-city.ts              — Server actions: createCity, updateCity, deleteCity
  containers/pricing-and-services/CityManagementCard.tsx — Client component: city table + add/edit dialog

Modified Files:
  containers/pricing-and-services/PricingAndServicesPage.tsx — Add CityManagementCard to layout
```

---

### Task 1: Create server actions for city CRUD

**Files:**
- Create: `app/actions/manage-city.ts`

- [ ] **Step 1: Create the server action file with all three operations**

```typescript
// app/actions/manage-city.ts
'use server';

import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { revalidatePath } from 'next/cache';

export type CityActionResult =
  | { success: true }
  | { success: false; error: string };

export async function createCity(
  name: string,
  latitude: number | null,
  longitude: number | null,
): Promise<CityActionResult> {
  const auth = await requireAdmin();
  if ('error' in auth) return { success: false, error: auth.error };

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: 'City name is required.' };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('cities')
    .insert({ name: trimmed, latitude, longitude });

  if (error) {
    if (error.code === '23505') return { success: false, error: 'A city with this name already exists.' };
    return { success: false, error: error.message };
  }

  // Seed default city_services (both basic + xl available)
  const { data: city } = await adminClient
    .from('cities')
    .select('id')
    .eq('name', trimmed)
    .single();

  if (city) {
    await adminClient
      .from('city_services')
      .insert([
        { city_id: city.id, vehicle_type: 'basic', is_available: true },
        { city_id: city.id, vehicle_type: 'xl', is_available: true },
      ]);
  }

  revalidatePath('/pricing-and-services');
  return { success: true };
}

export async function updateCity(
  cityId: string,
  name: string,
  latitude: number | null,
  longitude: number | null,
): Promise<CityActionResult> {
  const auth = await requireAdmin();
  if ('error' in auth) return { success: false, error: auth.error };

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: 'City name is required.' };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('cities')
    .update({ name: trimmed, latitude, longitude })
    .eq('id', cityId);

  if (error) {
    if (error.code === '23505') return { success: false, error: 'A city with this name already exists.' };
    return { success: false, error: error.message };
  }

  revalidatePath('/pricing-and-services');
  return { success: true };
}

export async function deleteCity(
  cityId: string,
): Promise<CityActionResult> {
  const auth = await requireAdmin();
  if ('error' in auth) return { success: false, error: auth.error };

  const adminClient = createAdminClient();

  // Soft-delete: set is_active = false (preserves FK references in driver_profiles)
  const { error } = await adminClient
    .from('cities')
    .update({ is_active: false })
    .eq('id', cityId);

  if (error) return { success: false, error: error.message };

  // Nullify city_id on driver_profiles that reference this city
  await adminClient
    .from('driver_profiles')
    .update({ city_id: null })
    .eq('city_id', cityId);

  revalidatePath('/pricing-and-services');
  revalidatePath('/drivers');
  return { success: true };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd "D:/Blue Taxi Code/blue-taxi-admin-web" && npx tsc --noEmit`
Expected: Zero new errors

---

### Task 2: Create CityManagementCard component

**Files:**
- Create: `containers/pricing-and-services/CityManagementCard.tsx`

- [ ] **Step 1: Create the client component with city table + add/edit dialog**

```typescript
// containers/pricing-and-services/CityManagementCard.tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd "D:/Blue Taxi Code/blue-taxi-admin-web" && npx tsc --noEmit`
Expected: Zero new errors

---

### Task 3: Wire CityManagementCard into the Pricing page

**Files:**
- Modify: `containers/pricing-and-services/PricingAndServicesPage.tsx`

- [ ] **Step 1: Import and render CityManagementCard**

Add import at the top of the file:
```typescript
import { CityManagementCard } from './CityManagementCard';
```

Add `<CityManagementCard cities={cities} />` after the `VersionHistoryCard` in the layout JSX. Place it in the right column (alongside VersionHistoryCard) or as a full-width card below the grid — depending on current layout.

Find the section where `VersionHistoryCard` is rendered and add below it:
```typescript
<CityManagementCard cities={cities} />
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd "D:/Blue Taxi Code/blue-taxi-admin-web" && npx tsc --noEmit`
Expected: Zero new errors

- [ ] **Step 3: Manual verification**

1. Open `/pricing-and-services` — City Management card visible
2. Click "Add City" — dialog opens with name + lat/lng fields
3. Enter "Cebu City" with coordinates → click Add → city appears in list
4. Click pencil icon → edit dialog opens pre-filled → change name → click Update
5. Click trash icon → confirm dialog → city removed from list
6. Check driver management city dropdown — updated cities reflected
7. Check passenger app ride selection — city matching still works

---

## Verification Checklist

1. **Add city:** Name + coordinates → appears in city list, city dropdown, and driver filters
2. **Edit city:** Change name/coordinates → reflected everywhere
3. **Delete city:** Removed from list, drivers with this city get city_id = null
4. **Duplicate name:** Shows "A city with this name already exists" error
5. **Empty name:** Shows "City name is required" error
6. **Invalid coordinates:** Shows validation error for out-of-range lat/lng
7. **Auth:** All actions require admin role — non-admins see error
