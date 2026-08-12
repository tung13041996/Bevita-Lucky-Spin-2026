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
  selectedPrizeIds: number[];   // đổi từ single → array
  spin1PrizeId: number;
  spin2PrizeId: number | null;
  spin3PrizeId: number | null;
  timestamp: string;
}

export interface AppState {
  name: string;
  phone: string;
  spins: SpinResult[];
  selectedPrizeIds: number[];   // đổi từ single → array
  isClaimed: boolean;
  isSpinning: boolean;
  error: string | null;
  showModal: boolean;
  lastSpunPrize: SpinResult | null;
  showFinalPopup: boolean;
}
