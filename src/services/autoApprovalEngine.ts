import { AutoApprovalSettings, FuelRequest, Vehicle, VehicleRequest } from '../types';

export const defaultAutoApprovalSettings: AutoApprovalSettings = {
  vehicleMaxDistanceKm: 120, // Auto approve trips <= 120 km (Jabodetabek operational area)
  vehicleMaxDurationDays: 2,
  allowedDivisions: ['Operasional', 'Keuangan', 'Pemasaran & Bisnis', 'Teknis & QA', 'Umum & Logistik', 'SDM'],
  fuelMaxLitersPerRequest: 50,
  fuelMaxCostPerRequest: 750000,
  fuelMinKmPerLiter: 6.5,
  fuelMaxKmPerLiter: 22.0,
  allowAutoApprovalVehicles: true,
  allowAutoApprovalFuel: true,
};

export const FUEL_PRICES: Record<string, number> = {
  Pertalite: 10000,
  Pertamax: 12950,
  'Pertamax Turbo': 14400,
  Dexlite: 14550,
  Solar: 6800,
};

export function evaluateVehicleRequest(
  request: Omit<VehicleRequest, 'id' | 'requestCode' | 'status' | 'approvalType' | 'approvalReason' | 'createdAt'>,
  vehicles: Vehicle[],
  settings: AutoApprovalSettings = defaultAutoApprovalSettings
): {
  approved: boolean;
  approvalType: 'Otomatis' | 'Manual';
  reason: string;
  assignedVehicle?: Vehicle;
  assignedDriver?: string;
} {
  if (!settings.allowAutoApprovalVehicles) {
    return {
      approved: false,
      approvalType: 'Manual',
      reason: 'Sistem persetujuan otomatis kendaraan dinonaktifkan oleh Manajer Operasional.',
    };
  }

  // 1. Check distance
  if (request.estimatedDistanceKm > settings.vehicleMaxDistanceKm) {
    return {
      approved: false,
      approvalType: 'Manual',
      reason: `Estimasi jarak tempuh (${request.estimatedDistanceKm} km) melebihi batas persetujuan otomatis (maks. ${settings.vehicleMaxDistanceKm} km). Diperlukan verifikasi manajer.`,
    };
  }

  // 2. Check department validity
  if (!settings.allowedDivisions.includes(request.requesterDepartment)) {
    return {
      approved: false,
      approvalType: 'Manual',
      reason: `Divisi ${request.requesterDepartment} memerlukan persetujuan manual kepala divisi untuk mobilisasi kendaraan dinas.`,
    };
  }

  // 3. Find available vehicle
  const availableVehicles = vehicles.filter((v) => {
    // Capacity check
    const fitsCapacity = request.passengerCount <= (v.type === 'Minibus Operasional' ? 14 : v.type === 'Motor Kurir' ? 1 : 7);
    const isReady = v.status === 'Tersedia';
    // Not requiring urgent service
    const kmUntilService = (v.lastServiceKm + v.serviceIntervalKm) - v.currentOdometer;
    const serviceOk = kmUntilService > 200;

    return isReady && fitsCapacity && serviceOk;
  });

  if (availableVehicles.length === 0) {
    return {
      approved: false,
      approvalType: 'Manual',
      reason: 'Armada yang cocok sedang beroperasi atau dalam masa perawatan berkala. Masuk antrean review manual.',
    };
  }

  // Pick the most suitable vehicle (highest fuel efficiency or most suitable type)
  const selectedVehicle = availableVehicles[0];
  const driver = request.requiresDriver ? (selectedVehicle.assignedDriver || 'Pak Bambang Susilo (Driver Pool)') : 'Mandiri (Tanpa Driver)';

  return {
    approved: true,
    approvalType: 'Otomatis',
    reason: `Disetujui otomatis: Tujuan ${request.destination} (${request.estimatedDistanceKm} km) dalam radius operasional dan armada ${selectedVehicle.name} (${selectedVehicle.plateNumber}) siap digunakan.`,
    assignedVehicle: selectedVehicle,
    assignedDriver: driver,
  };
}

export function evaluateFuelRequest(
  request: {
    driverName: string;
    vehicleId: string;
    currentOdometer: number;
    fuelType: string;
    requestedLiters: number;
    estimatedCost: number;
  },
  vehicle: Vehicle,
  lastFuelOdometer: number,
  settings: AutoApprovalSettings = defaultAutoApprovalSettings
): {
  approved: boolean;
  approvalType: 'Otomatis' | 'Manual';
  reason: string;
  calculatedKmPerLiter: number;
  distanceCovered: number;
  voucherCode?: string;
} {
  const distanceCovered = Math.max(0, request.currentOdometer - lastFuelOdometer);
  const calculatedKmPerLiter = request.requestedLiters > 0 && distanceCovered > 0
    ? Number((distanceCovered / request.requestedLiters).toFixed(2))
    : vehicle.efficiencyRatio;

  if (!settings.allowAutoApprovalFuel) {
    return {
      approved: false,
      approvalType: 'Manual',
      reason: 'Sistem persetujuan otomatis voucher BBM sedang dinonaktifkan.',
      calculatedKmPerLiter,
      distanceCovered,
    };
  }

  // 1. Max liters check
  if (request.requestedLiters > settings.fuelMaxLitersPerRequest) {
    return {
      approved: false,
      approvalType: 'Manual',
      reason: `Permintaan BBM (${request.requestedLiters} L) melampaui plafon permohonan mandiri (${settings.fuelMaxLitersPerRequest} L). Menunggu review finance.`,
      calculatedKmPerLiter,
      distanceCovered,
    };
  }

  // 2. Max cost ceiling
  if (request.estimatedCost > settings.fuelMaxCostPerRequest) {
    return {
      approved: false,
      approvalType: 'Manual',
      reason: `Nominal BBM (Rp ${request.estimatedCost.toLocaleString('id-ID')}) melebihi plafon transaksi (Rp ${settings.fuelMaxCostPerRequest.toLocaleString('id-ID')}).`,
      calculatedKmPerLiter,
      distanceCovered,
    };
  }

  // 3. Efficiency / Anomaly detection: if odometer went backwards
  if (request.currentOdometer < vehicle.currentOdometer) {
    return {
      approved: false,
      approvalType: 'Manual',
      reason: `Odometer yang dimasukkan (${request.currentOdometer} km) lebih rendah dari catatan terakhir kendaraan (${vehicle.currentOdometer} km). Butuh verifikasi fisik speedometer.`,
      calculatedKmPerLiter: 0,
      distanceCovered: 0,
    };
  }

  // 4. KM per liter plausibility check if distance is significant
  if (distanceCovered > 50) {
    if (calculatedKmPerLiter < settings.fuelMinKmPerLiter) {
      return {
        approved: false,
        approvalType: 'Manual',
        reason: `Rasio konsumsi bahan bakar terdeteksi sangat boros (${calculatedKmPerLiter} km/L < batas wajar ${settings.fuelMinKmPerLiter} km/L). Memerlukan review fleet manager untuk deteksi kebocoran atau rute macet ekstrem.`,
        calculatedKmPerLiter,
        distanceCovered,
      };
    }
  }

  // Generate unique digital fuel voucher code
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const voucherCode = `VCHR-${vehicle.plateNumber.replace(/\s+/g, '')}-${randomSuffix}`;

  return {
    approved: true,
    approvalType: 'Otomatis',
    reason: `Disetujui otomatis: Konsumsi BBM normal (${calculatedKmPerLiter} km/L), kuota liter dan nominal dalam batas standar perusahaan. E-Voucher digital langsung diterbitkan.`,
    calculatedKmPerLiter,
    distanceCovered,
    voucherCode,
  };
}
