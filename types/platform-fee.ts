export interface PlatformFee {
  id: string;
  fee_amount: number;
  insurance_amount: number;
  label: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
