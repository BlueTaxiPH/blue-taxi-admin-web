export interface PlatformFee {
  id: string;
  fee_amount: number;
  insurance_amount: number;
  label: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  changed_by?: { first_name: string | null; last_name: string | null } | null;
}
