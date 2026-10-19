export type UserRole = 'pegawai' | 'driver' | 'manajer';

export type VehicleType = 'Mobil Penumpang' | 'SUV' | 'Minibus Operasional' | 'Motor Kurir' | 'Blind Van Logistik';

export type FuelType = 'Pertalite' | 'Pertamax' | 'Pertamax Turbo' | 'Dexlite' | 'Solar';

export type VehicleStatus = 'Tersedia' | 'Sedang Beroperasi' | 'Dalam Perawatan' | 'Perlu Servis Segera';

export interface Vehicle {
  id: string;
  plateNumber: string;
  name: string;
  type: VehicleType;
  year: number;
  fuelType: FuelType;
  tankCapacity: number; // liters
  currentFuelLevel: number; // liters
  currentOdometer: number; // km
  serviceIntervalKm: number; // e.g. 10000 km
  lastServiceKm: number;
  lastServiceDate: string;
  stnkExpiryDate: string;
  kirExpiryDate?: string;
  assignedDriver?: string;
  driverPhone?: string;
  status: VehicleStatus;
  currentTripId?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    speed: number; // km/h
    heading: number;
    destination?: string;
    lastUpdated: string;
  };
  efficiencyRatio: number; // standard km/L
}

export type RequestStatus = 'Disetujui Otomatis' | 'Disetujui Manual' | 'Menunggu Review' | 'Sedang Berjalan' | 'Sedang Beroperasi' | 'Selesai' | 'Ditolak';

export interface VehicleRequest {
  id: string;
  requestCode: string;
  requesterName: string;
  requesterDepartment: string;
  requesterPhone: string;
  purpose: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  passengerCount: number;
  estimatedDistanceKm: number;
  requiresDriver: boolean;
  notes?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  vehicleName?: string;
  assignedDriver?: string;
  status: RequestStatus;
  approvalType: 'Otomatis' | 'Manual' | 'None';
  approvalReason: string;
  approvedAt?: string;
  createdAt: string;
}

export type FuelRequestStatus = 'Disetujui Otomatis' | 'Disetujui Manual' | 'Menunggu Review' | 'Selesai / Terisi' | 'Ditolak';

export interface FuelRequest {
  id: string;
  fuelCode: string;
  driverName: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleName: string;
  odometerReading: number;
  distanceSinceLastFuelKm: number;
  fuelType: FuelType;
  requestedLiters: number;
  estimatedCost: number; // IDR
  spbuName: string;
  spbuLocation: string;
  purposeNotes: string;
  receiptNumber?: string;
  calculatedKmPerLiter: number;
  status: FuelRequestStatus;
  approvalType: 'Otomatis' | 'Manual' | 'None';
  approvalReason: string;
  voucherCode?: string;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleName: string;
  serviceType: 'Ganti Oli & Filter' | 'Servis Rem & Kaki' | 'Tune Up Berkala' | 'Ganti Ban' | 'Uji KIR' | 'Pajak STNK Tahunan';
  odometerAtService: number;
  serviceDate: string;
  nextServiceKm: number;
  nextServiceDate: string;
  workshopName: string;
  cost: number;
  notes: string;
  status: 'Selesai' | 'Dijadwalkan' | 'Mendesak';
}

export interface ServiceNotification {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleName: string;
  title: string;
  description: string;
  severity: 'urgent' | 'warning' | 'info';
  kmRemaining?: number;
  daysRemaining?: number;
  createdAt: string;
  isRead: boolean;
}

export interface AutoApprovalSettings {
  vehicleMaxDistanceKm: number; // e.g. 100 km for auto-approval
  vehicleMaxDurationDays: number; // e.g. 2 days
  allowedDivisions: string[];
  fuelMaxLitersPerRequest: number; // e.g. 45 L
  fuelMaxCostPerRequest: number; // e.g. Rp 650.000
  fuelMinKmPerLiter: number; // e.g. 6.5 km/L minimum plausibility
  fuelMaxKmPerLiter: number; // e.g. 20.0 km/L maximum plausibility
  allowAutoApprovalVehicles: boolean;
  allowAutoApprovalFuel: boolean;
}
