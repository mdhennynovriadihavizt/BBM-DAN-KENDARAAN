import React, { useState } from 'react';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Fuel,
  Gauge,
  Receipt,
  Sparkles,
  Ticket,
  User,
  X,
  Zap,
} from 'lucide-react';
import { AutoApprovalSettings, FuelRequest, FuelType, Vehicle } from '../types';
import { evaluateFuelRequest, FUEL_PRICES } from '../services/autoApprovalEngine';

interface FuelRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  settings: AutoApprovalSettings;
  onSubmit: (newFuelRequest: FuelRequest, updatedVehicle: Vehicle) => void;
}

export const FuelRequestModal: React.FC<FuelRequestModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  settings,
  onSubmit,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const [driverName, setDriverName] = useState(selectedVehicle?.assignedDriver || 'Pak Bambang Susilo');
  const [currentOdometer, setCurrentOdometer] = useState<number>(selectedVehicle ? selectedVehicle.currentOdometer + 280 : 18700);
  const [fuelType, setFuelType] = useState<FuelType>(selectedVehicle?.fuelType || 'Pertamax');
  const [requestedLiters, setRequestedLiters] = useState<number>(30);
  const [spbuName, setSpbuName] = useState('SPBU Pertamina 31.12801');
  const [spbuLocation, setSpbuLocation] = useState('Jl. MT Haryono Kav 22, Jakarta Selatan');
  const [purposeNotes, setPurposeNotes] = useState('Pengisian rutin operasional perjalanan dinas ke klien');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [submittedResult, setSubmittedResult] = useState<FuelRequest | null>(null);

  if (!isOpen) return null;

  const estimatedCost = Math.round(requestedLiters * (FUEL_PRICES[fuelType] || 12950));
  const lastOdometer = selectedVehicle ? selectedVehicle.currentOdometer : 18000;
  const distanceCovered = Math.max(0, currentOdometer - lastOdometer);
  const calculatedKmPerLiter = requestedLiters > 0 && distanceCovered > 0
    ? Number((distanceCovered / requestedLiters).toFixed(2))
    : selectedVehicle?.efficiencyRatio || 12;

  // Live Auto Evaluation check
  const liveEvaluation = evaluateFuelRequest(
    {
      driverName,
      vehicleId: selectedVehicle?.id || '',
      currentOdometer,
      fuelType,
      requestedLiters,
      estimatedCost,
    },
    selectedVehicle,
    lastOdometer,
    settings
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const evaluation = evaluateFuelRequest(
      {
        driverName,
        vehicleId: selectedVehicle.id,
        currentOdometer,
        fuelType,
        requestedLiters,
        estimatedCost,
      },
      selectedVehicle,
      lastOdometer,
      settings
    );

    const fuelCode = `BBM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newFuelRequest: FuelRequest = {
      id: 'fuel-' + Date.now(),
      fuelCode,
      driverName,
      vehicleId: selectedVehicle.id,
      vehiclePlate: selectedVehicle.plateNumber,
      vehicleName: selectedVehicle.name,
      odometerReading: currentOdometer,
      distanceSinceLastFuelKm: distanceCovered,
      fuelType,
      requestedLiters,
      estimatedCost,
      spbuName,
      spbuLocation,
      purposeNotes,
      receiptNumber: receiptNumber || `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
      calculatedKmPerLiter: evaluation.calculatedKmPerLiter,
      status: evaluation.approved ? 'Disetujui Otomatis' : 'Menunggu Review',
      approvalType: evaluation.approvalType,
      approvalReason: evaluation.reason,
      voucherCode: evaluation.voucherCode,
      createdAt: new Date().toLocaleString('id-ID'),
    };

    // Update vehicle odometer and tank level
    const updatedVehicle: Vehicle = {
      ...selectedVehicle,
      currentOdometer: Math.max(selectedVehicle.currentOdometer, currentOdometer),
      currentFuelLevel: Math.min(selectedVehicle.tankCapacity, selectedVehicle.currentFuelLevel + requestedLiters),
    };

    setSubmittedResult(newFuelRequest);
    onSubmit(newFuelRequest, updatedVehicle);
  };

  const handleResetAndClose = () => {
    setSubmittedResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Formulir Pengajuan BBM Driver Operasional
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Klaim voucher dan pengisian bahan bakar resmi dengan audit rasio konsumsi otomatis
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedResult ? (
          /* Submission Feedback with Digital Fuel Voucher */
          <div className="p-6 space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
              {submittedResult.approvalType === 'Otomatis' ? (
                <Ticket className="w-8 h-8" />
              ) : (
                <Clock className="w-8 h-8 text-amber-600" />
              )}
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-slate-500 tracking-wider">
                NOMOR PENGAJUAN: {submittedResult.fuelCode}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {submittedResult.approvalType === 'Otomatis'
                  ? 'Voucher BBM Disetujui Otomatis!'
                  : 'Pengajuan BBM Masuk Antrean Verifikasi Fleet Manager'}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                {submittedResult.approvalReason}
              </p>
            </div>

            {submittedResult.voucherCode && (
              <div className="bg-slate-900 text-white rounded-xl p-5 max-w-md mx-auto text-left space-y-3 relative overflow-hidden shadow-lg">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold tracking-wide">E-VOUCHER BBM DIGITAL</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded">
                    SIAP DIGUNAKAN
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] text-slate-400 block">KODE VOUCHER</span>
                    <span className="text-xl font-mono font-extrabold tracking-wider text-emerald-400">
                      {submittedResult.voucherCode}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">NOMINAL PLAFON</span>
                    <span className="text-base font-mono font-bold">
                      Rp {submittedResult.estimatedCost.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-400">Plat:</span> {submittedResult.vehiclePlate}
                  </div>
                  <div>
                    <span className="text-slate-400">Driver:</span> {submittedResult.driverName}
                  </div>
                  <div>
                    <span className="text-slate-400">BBM:</span> {submittedResult.fuelType} ({submittedResult.requestedLiters} L)
                  </div>
                  <div>
                    <span className="text-slate-400">Efisiensi:</span> {submittedResult.calculatedKmPerLiter} km/L
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleResetAndClose}
              className="py-2.5 px-6 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              Tutup & Selesai
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Auto-Approval Engine Plausibility Bar */}
            <div
              className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                liveEvaluation.approved
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}
            >
              <Zap className={`w-4 h-4 shrink-0 mt-0.5 ${liveEvaluation.approved ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div>
                <span className="font-bold block">
                  {liveEvaluation.approved
                    ? 'Memenuhi Standar Efisiensi & Langsung Diterbitkan E-Voucher'
                    : 'Perhatian: Di luar ambang batas otomatis'}
                </span>
                <span className="text-[11px] opacity-90 block mt-0.5">
                  {liveEvaluation.reason}
                </span>
              </div>
            </div>

            {/* Vehicle Selection & Driver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Pilih Kendaraan Operasional *
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => {
                    setSelectedVehicleId(e.target.value);
                    const v = vehicles.find((item) => item.id === e.target.value);
                    if (v) {
                      setFuelType(v.fuelType);
                      if (v.assignedDriver) setDriverName(v.assignedDriver);
                      setCurrentOdometer(v.currentOdometer + 150);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} - {v.name} ({v.fuelType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Driver / Pengemudi *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Odometer & Mileage Calculation Box */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-slate-500" />
                  Pengecekan Odometer & Rasio KM/L
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Odo Terakhir: {lastOdometer.toLocaleString('id-ID')} km
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Angka Speedometer Saat Ini (KM) *
                  </label>
                  <input
                    type="number"
                    min={lastOdometer}
                    required
                    value={currentOdometer}
                    onChange={(e) => setCurrentOdometer(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Jarak Ditempuh Sejak Isi Terakhir
                  </label>
                  <div className="px-3 py-1.5 text-xs bg-slate-100 rounded-md font-mono font-bold text-slate-800">
                    {distanceCovered} km
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Kalkulasi Rasio Efisiensi
                  </label>
                  <div
                    className={`px-3 py-1.5 text-xs rounded-md font-mono font-bold ${
                      calculatedKmPerLiter < settings.fuelMinKmPerLiter
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {calculatedKmPerLiter} km / Liter
                  </div>
                </div>
              </div>
            </div>

            {/* Fuel Details: Type, Liters, Cost */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Jenis Bahan Bakar
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as FuelType)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                >
                  <option value="Pertamax">Pertamax (Rp 12.950/L)</option>
                  <option value="Dexlite">Dexlite (Rp 14.550/L)</option>
                  <option value="Solar">Solar (Rp 6.800/L)</option>
                  <option value="Pertalite">Pertalite (Rp 10.000/L)</option>
                  <option value="Pertamax Turbo">Pertamax Turbo (Rp 14.400/L)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Jumlah Liter yang Diajukan
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={selectedVehicle?.tankCapacity || 75}
                    value={requestedLiters}
                    onChange={(e) => setRequestedLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                  <span className="text-xs text-slate-500 font-mono">Liter</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Estimasi Biaya Transaksi
                </label>
                <div className="px-3 py-2 text-xs bg-slate-100 rounded-lg font-mono font-bold text-slate-900">
                  Rp {estimatedCost.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* SPBU Details & Receipt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama SPBU Rekanan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: SPBU Pertamina 31.12801"
                  value={spbuName}
                  onChange={(e) => setSpbuName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Lokasi / Alamat SPBU
                </label>
                <input
                  type="text"
                  value={spbuLocation}
                  onChange={(e) => setSpbuLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Purpose Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Keterangan Perjalanan / Alasan Pengisian *
              </label>
              <textarea
                rows={2}
                required
                value={purposeNotes}
                onChange={(e) => setPurposeNotes(e.target.value)}
                placeholder="Misal: Pengisian tangki dinas untuk antar tamu dewan pengawas ke Bandara Soetta"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                Kirim Pengajuan Voucher BBM
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
