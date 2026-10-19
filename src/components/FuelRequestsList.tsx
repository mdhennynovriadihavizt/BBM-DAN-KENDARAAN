import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Fuel,
  Gauge,
  Plus,
  Receipt,
  Search,
  Ticket,
  User,
  Zap,
} from 'lucide-react';
import { FuelRequest, FuelRequestStatus, UserRole, Vehicle } from '../types';

interface FuelRequestsListProps {
  fuelRequests: FuelRequest[];
  vehicles: Vehicle[];
  userRole: UserRole;
  onOpenNewModal: () => void;
  onApproveManual: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
}

export const FuelRequestsList: React.FC<FuelRequestsListProps> = ({
  fuelRequests,
  vehicles,
  userRole,
  onOpenNewModal,
  onApproveManual,
  onRejectRequest,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVoucherModal, setActiveVoucherModal] = useState<FuelRequest | null>(null);

  const filteredRequests = fuelRequests.filter((r) => {
    const matchesSearch =
      r.fuelCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.spbuName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'all') return true;
    if (filterStatus === 'auto') return r.approvalType === 'Otomatis';
    if (filterStatus === 'pending') return r.status === 'Menunggu Review';
    if (filterStatus === 'completed') return r.status === 'Selesai / Terisi';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Daftar Pengajuan BBM Driver Operasional
          </h2>
          <p className="text-xs text-slate-500">
            Permohonan voucher bahan bakar, verifikasi struk SPBU, dan audit rasio KM per liter
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Driver: Ajukan Pengisian BBM
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode BBM, driver, plat kendaraan, SPBU..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-md transition-colors ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Semua ({fuelRequests.length})
          </button>
          <button
            onClick={() => setFilterStatus('auto')}
            className={`px-3 py-1 rounded-md transition-colors ${filterStatus === 'auto' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Auto-Approved ({fuelRequests.filter((r) => r.approvalType === 'Otomatis').length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-md transition-colors ${filterStatus === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Audit / Review ({fuelRequests.filter((r) => r.status === 'Menunggu Review').length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Kode & Driver</th>
                <th className="py-3 px-4">Kendaraan</th>
                <th className="py-3 px-4">Odometer & Efisiensi</th>
                <th className="py-3 px-4">BBM & Volume</th>
                <th className="py-3 px-4">Total Biaya (Rp)</th>
                <th className="py-3 px-4">Status & Alasan</th>
                <th className="py-3 px-4 text-right">Voucher / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold text-slate-900 block">
                      {req.fuelCode}
                    </span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      {req.driverName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {req.createdAt}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                      {req.vehiclePlate}
                    </span>
                    <div className="text-[11px] text-slate-600 mt-1 truncate max-w-[150px]">
                      {req.vehicleName}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-mono font-medium text-slate-800">
                      {req.odometerReading.toLocaleString('id-ID')} km
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-400">Rasio:</span>
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          req.calculatedKmPerLiter < 7
                            ? 'text-rose-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {req.calculatedKmPerLiter} km/L
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">
                      {req.requestedLiters} Liter
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {req.fuelType}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      Rp {req.estimatedCost.toLocaleString('id-ID')}
                    </span>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {req.spbuName}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-1.5">
                      {req.approvalType === 'Otomatis' && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                          <Zap className="w-3 h-3" />
                          Auto-Approved
                        </span>
                      )}
                      {req.status === 'Menunggu Review' && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          Perlu Audit
                        </span>
                      )}
                      {req.status === 'Selesai / Terisi' && (
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          Terisi
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate" title={req.approvalReason}>
                      {req.approvalReason}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {req.voucherCode ? (
                      <button
                        onClick={() => setActiveVoucherModal(req)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                      >
                        <Ticket className="w-3 h-3" />
                        {req.voucherCode.split('-').slice(-1)}
                      </button>
                    ) : req.status === 'Menunggu Review' && userRole === 'manajer' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onApproveManual(req.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => onRejectRequest(req.id, 'Anomali konsumsi BBM melebihi batas')}
                          className="px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Pending Review</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    Tidak ada pengajuan BBM yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Digital Voucher Modal */}
      {activeVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 text-white rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold tracking-wide">E-VOUCHER BBM DIGITAL</span>
              </div>
              <button
                onClick={() => setActiveVoucherModal(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">KODE OTORISASI SPBU</span>
              <div className="text-2xl font-mono font-extrabold text-emerald-400 tracking-wider">
                {activeVoucherModal.voucherCode}
              </div>
              <span className="text-xs font-mono text-slate-300">
                Plafon: Rp {activeVoucherModal.estimatedCost.toLocaleString('id-ID')} ({activeVoucherModal.requestedLiters} L)
              </span>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-3 text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Plat Nomor:</span>
                <span className="font-mono font-bold text-white">{activeVoucherModal.vehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Driver:</span>
                <span className="text-white">{activeVoucherModal.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipe BBM:</span>
                <span className="text-emerald-400">{activeVoucherModal.fuelType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SPBU Target:</span>
                <span className="text-white truncate max-w-[170px]">{activeVoucherModal.spbuName}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveVoucherModal(null)}
              className="w-full py-2 text-xs font-semibold text-slate-900 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors"
            >
              Tutup Voucher
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
