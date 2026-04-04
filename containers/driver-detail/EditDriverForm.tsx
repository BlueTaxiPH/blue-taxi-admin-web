'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateDriver } from '@/app/actions/update-driver';
import type { UpdateDriverInput } from '@/app/actions/update-driver';

interface DriverData {
  driverProfileId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityId: string | null;
  cityName: string;
  vehicleId: string | null;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlateNumber: string;
  vehicleColor: string;
  vehicleType: 'basic' | 'xl';
  verificationStatus: string;
}

interface City {
  id: string;
  name: string;
  is_active: boolean;
}

interface EditDriverFormProps {
  driver: DriverData;
  cities: City[];
}

const VERIFICATION_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

function EditableField({
  label,
  value,
  isEditing,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {isEditing ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type}
          className="h-8 text-sm"
        />
      ) : (
        <p className="text-sm font-medium">{value || '—'}</p>
      )}
    </div>
  );
}

export function EditDriverForm({ driver, cities }: EditDriverFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState(driver.firstName);
  const [lastName, setLastName] = useState(driver.lastName);
  const [email, setEmail] = useState(driver.email);
  const [phone, setPhone] = useState(driver.phone);
  const [cityId, setCityId] = useState(driver.cityId ?? '');
  const [vehicleMake, setVehicleMake] = useState(driver.vehicleMake);
  const [vehicleModel, setVehicleModel] = useState(driver.vehicleModel);
  const [vehiclePlate, setVehiclePlate] = useState(driver.vehiclePlateNumber);
  const [vehicleColor, setVehicleColor] = useState(driver.vehicleColor);
  const [vehicleType, setVehicleType] = useState<'basic' | 'xl'>(driver.vehicleType);
  const [verificationStatus, setVerificationStatus] = useState(driver.verificationStatus);

  function handleCancel() {
    setFirstName(driver.firstName);
    setLastName(driver.lastName);
    setEmail(driver.email);
    setPhone(driver.phone);
    setCityId(driver.cityId ?? '');
    setVehicleMake(driver.vehicleMake);
    setVehicleModel(driver.vehicleModel);
    setVehiclePlate(driver.vehiclePlateNumber);
    setVehicleColor(driver.vehicleColor);
    setVehicleType(driver.vehicleType);
    setVerificationStatus(driver.verificationStatus);
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  }

  function handleSave() {
    setError(null);
    setSuccess(false);

    const input: UpdateDriverInput = {
      driverProfileId: driver.driverProfileId,
      userId: driver.userId,
      firstName,
      lastName,
      email,
      phone,
      cityId: cityId || null,
      vehicleId: driver.vehicleId,
      vehicleMake,
      vehicleModel,
      vehiclePlateNumber: vehiclePlate,
      vehicleColor,
      vehicleType,
      verificationStatus,
    };

    startTransition(async () => {
      const result = await updateDriver(input);
      if (result.success) {
        setSuccess(true);
        setIsEditing(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">
          Driver Profile
        </h2>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
            >
              <X className="size-3.5 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending}
            >
              <Save className="size-3.5 mr-1" />
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setIsEditing(true); setSuccess(false); }}
          >
            <Pencil className="size-3.5 mr-1" />
            Edit
          </Button>
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
      ) : null}
      {success ? (
        <p className="text-sm text-green-700 bg-green-50 rounded-md px-3 py-2">Driver updated successfully.</p>
      ) : null}

      {/* Personal Info */}
      <div className="grid grid-cols-2 gap-4">
        <EditableField label="First Name" value={firstName} isEditing={isEditing} onChange={setFirstName} />
        <EditableField label="Last Name" value={lastName} isEditing={isEditing} onChange={setLastName} />
        <EditableField label="Email" value={email} isEditing={isEditing} onChange={setEmail} type="email" />
        <EditableField label="Phone" value={phone} isEditing={isEditing} onChange={setPhone} type="tel" />
      </div>

      {/* City */}
      <div>
        <p className="text-xs text-muted-foreground mb-1">City</p>
        {isEditing ? (
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className="w-full rounded-md border px-3 py-1.5 text-sm"
          >
            <option value="">No city assigned</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        ) : (
          <p className="text-sm font-medium">
            {cities.find((c) => c.id === cityId)?.name || driver.cityName || '—'}
          </p>
        )}
      </div>

      {/* Vehicle */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">Vehicle</p>
        {isEditing ? (
          <div className="grid grid-cols-2 gap-3">
            <EditableField label="Make" value={vehicleMake} isEditing onChange={setVehicleMake} />
            <EditableField label="Model" value={vehicleModel} isEditing onChange={setVehicleModel} />
            <EditableField label="Plate Number" value={vehiclePlate} isEditing onChange={setVehiclePlate} />
            <EditableField label="Color" value={vehicleColor} isEditing onChange={setVehicleColor} />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as 'basic' | 'xl')}
                className="w-full rounded-md border px-3 py-1.5 text-sm"
              >
                <option value="basic">Basic</option>
                <option value="xl">XL</option>
              </select>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium">
            {vehicleMake || vehicleModel
              ? `${vehicleColor} ${vehicleMake} ${vehicleModel} · ${vehiclePlate}`.trim()
              : '—'}
          </p>
        )}
      </div>

      {/* Verification Status */}
      <div>
        <p className="text-xs text-muted-foreground mb-1">Verification Status</p>
        {isEditing ? (
          <select
            value={verificationStatus}
            onChange={(e) => setVerificationStatus(e.target.value)}
            className="w-full rounded-md border px-3 py-1.5 text-sm"
          >
            {VERIFICATION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        ) : (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            verificationStatus === 'approved'
              ? 'bg-emerald-100 text-emerald-800'
              : verificationStatus === 'suspended'
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'
          }`}>
            {VERIFICATION_STATUSES.find((s) => s.value === verificationStatus)?.label ?? verificationStatus}
          </span>
        )}
      </div>
    </div>
  );
}
