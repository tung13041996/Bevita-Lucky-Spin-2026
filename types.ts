export interface Prize {
  id: number;
  name: string;
  weight: number;
  condition: string;
  color: string;
}

export interface SpinResult {
  prizeId: number;
  prizeName: string;
  condition: string;
}

export interface ClaimRecord {
  name: string;
  phone: string;
  spunPrizeIds: number[];     // 3 prizes đã quay (client-side)
  selectedPrizeIds: number[]; // prizes muốn nhận
  timestamp: string;
}

export interface AppState {
  name: string;
  phone: string;
  phoneError: string | null;
  spins: SpinResult[];
  selectedPrizeIds: number[];
  isClaimed: boolean;
  isSpinning: boolean;
  error: string | null;
  showModal: boolean;
  lastSpunPrize: SpinResult | null;
  showFinalPopup: boolean;
}