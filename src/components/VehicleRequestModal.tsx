import React, { useId, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Sparkles,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { AutoApprovalSettings, Vehicle, VehicleRequest } from '../types';
import { evaluateVehicleRequest } from '../services/autoApprovalEngine';

interface VehicleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  settings: AutoApprovalSettings;
  onSubmit: (newRequest: VehicleRequest, assignedVehicle?: Vehicle) => void;
}

export const VehicleRequestModal: React.FC<VehicleRequestModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  settings,
  onSubmit,
}) => {
  const [requesterName, setRequesterName] = useState('Indra Gunawan');
  const [requesterDepartment, setRequesterDepartment] = useState('Keuangan');
  const [requesterPhone, setRequesterPhone] = useState('0812-3456-7890');
  const [purpose, setPurpose] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [departureTime, setDepartureTime] = useState('08:30');
  const [returnDate, setReturnDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [returnTime, setReturnTime] = useState('17:00');
  const [passengerCount, setPassengerCount] = useState(2);
  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState(35);
  const [requiresDriver, setRequiresDriver] = useState(true);
  const [notes, setNotes] = useState('');
  const [submittedResult, setSubmittedResult] = useState<VehicleRequest | null>(null);

  if (!isOpen) return null;

  // Live auto-approval evaluation check
  const candidateRequest = {
    requesterName,
    requesterDepartment,
    requesterPhone,
    purpose: purpose || 'Keperluan Dinas Operasional',
    destination: destination || 'Tujuan Dinas',
    departureDate,
    departureTime,
    returnDate,
    returnTime,
    passengerCount,
    estimatedDistanceKm,
    requiresDriver,
    notes,
  };

  const autoEvaluation = evaluateVehicleRequest(candidateRequest, vehicles, settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !purpose) return;

    const evaluation = evaluateVehicleRequest(candidateRequest, vehicles, settings);
    const requestCode = `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newRequest: VehicleRequest = {
      id: 'req-' + Date.now(),
      requestCode,
      ...candidateRequest,
      vehicleId: evaluation.assignedVehicle?.id,
      vehiclePlate: evaluation.assignedVehicle?.plateNumber,
      vehicleName: evaluation.assignedVehicle?.name,
      assignedDriver: evaluation.assignedDriver,
      status: evaluation.approved ? 'Disetujui Otomatis' : 'Menunggu Review',
      approvalType: evaluation.approvalType,
      approvalReason: evaluation.reason,
      approvedAt: evaluation.approved ? new Date().toLocaleString('id-ID') : undefined,
      createdAt: new Date().toLocaleString('id-ID'),
    };

    setSubmittedResult(newRequest);
    onSubmit(newRequest, evaluation.assignedVehicle);
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
              Formulir Permintaan Kendaraan Dinas Operasional
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pengajuan mobilisasi dinas dengan sistem persetujuan otomatis cerdas
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
          /* Submission Feedback with Instant Approval Badge */
          <div className="p-6 space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
              {submittedResult.approvalType === 'Otomatis' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <Clock className="w-8 h-8 text-amber-600" />
              )}
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-slate-500 tracking-wider">
                NOMOR PERMINTAAN: {submittedResult.requestCode}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {submittedResult.approvalType === 'Otomatis'
                  ? 'Permintaan Disetujui Otomatis!'
                  : 'Pengajuan Berhasil Dikirim (Menunggu Review)'}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                {submittedResult.approvalReason}
              </p>
            </div>

            {submittedResult.vehiclePlate && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Armada Dialokasikan:</span>
                  <span className="font-semibold text-slate-900">
                    {submittedResult.vehicleName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Plat Nomor:</span>
                  <span className="font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-900">
                    {submittedResult.vehiclePlate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Driver Bertugas:</span>
                  <span className="font-semibold text-blue-700">
                    {submittedResult.assignedDriver}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Jadwal Keberangkatan:</span>
                  <span className="text-slate-800">
                    {submittedResult.departureDate} @ {submittedResult.departureTime}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleResetAndClose}
              className="py-2.5 px-6 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              Kembali ke Beranda
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Auto-Approval Engine Indicator Badge */}
            <div
              className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                autoEvaluation.approved
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}
            >
              <Zap className={`w-4 h-4 shrink-0 mt-0.5 ${autoEvaluation.approved ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div>
                <span className="font-bold block">
                  {autoEvaluation.approved
                    ? 'Memenuhi Kriteria Persetujuan Otomatis (Instant Approval)'
                    : 'Akan Memerlukan Review Manual dari Fleet Manager'}
                </span>
                <span className="text-[11px] opacity-90 block mt-0.5">
                  {autoEvaluation.reason}
                </span>
              </div>
            </div>

            {/* Requester Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Pemohon
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Divisi / Departemen
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={requesterDepartment}
                    onChange={(e) => setRequesterDepartment(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  >
                    <option value="Keuangan">Keuangan</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Pemasaran & Bisnis">Pemasaran & Bisnis</option>
                    <option value="Teknis & QA">Teknis & QA</option>
                    <option value="Umum & Logistik">Umum & Logistik</option>
                    <option value="SDM">SDM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nomor Kontak / WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={requesterPhone}
                  onChange={(e) => setRequesterPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Destination & Purpose */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tujuan Perjalanan / Lokasi Dinas *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gedung Surveyor Indonesia, Gatot Subroto Kav 56"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Keperluan / Agenda Tugas Dinas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rapat koordinasi stakeholder dan audit teknis semester II"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Date & Time Schedule */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Tgl Berangkat
                </label>
                <input
                  type="date"
                  required
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Jam Berangkat
                </label>
                <input
                  type="time"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Tgl Kembali
                </label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Jam Kembali
                </label>
                <input
                  type="time"
                  required
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                />
              </div>
            </div>

            {/* Trip Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Estimasi Jarak Tempuh (KM)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={estimatedDistanceKm}
                    onChange={(e) => setEstimatedDistanceKm(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                  <span className="text-xs text-slate-500 font-mono">km</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Maks. auto-approval: {settings.vehicleMaxDistanceKm} km
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Jumlah Penumpang
                </label>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                  <span className="text-xs text-slate-500">orang</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kebutuhan Driver
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      checked={requiresDriver === true}
                      onChange={() => setRequiresDriver(true)}
                      className="text-slate-900"
                    />
                    <span>Perlu Driver</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      checked={requiresDriver === false}
                      onChange={() => setRequiresDriver(false)}
                      className="text-slate-900"
                    />
                    <span>Lepas Kunci</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Membawa barang/dokumen berat, transit bandara, dll."
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
                Kirim Pengajuan Kendaraan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
