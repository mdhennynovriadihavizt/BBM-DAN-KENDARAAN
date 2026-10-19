import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Plus,
  Search,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { RequestStatus, UserRole, Vehicle, VehicleRequest } from '../types';

interface VehicleRequestsListProps {
  requests: VehicleRequest[];
  vehicles: Vehicle[];
  userRole: UserRole;
  onOpenNewModal: () => void;
  onApproveManual: (requestId: string, vehicleId: string, driver: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onCompleteTrip: (requestId: string) => void;
}

export const VehicleRequestsList: React.FC<VehicleRequestsListProps> = ({
  requests,
  vehicles,
  userRole,
  onOpenNewModal,
  onApproveManual,
  onRejectRequest,
  onCompleteTrip,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<VehicleRequest | null>(null);

  // Manual Approval Dialog State
  const [isApprovingModalOpen, setIsApprovingModalOpen] = useState(false);
  const [targetVehicleId, setTargetVehicleId] = useState(vehicles[0]?.id || '');
  const [targetDriver, setTargetDriver] = useState('Pak Bambang Susilo (Driver Pool)');

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.requestCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requesterDepartment.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'all') return true;
    if (filterStatus === 'auto') return r.approvalType === 'Otomatis';
    if (filterStatus === 'pending') return r.status === 'Menunggu Review';
    if (filterStatus === 'active') return r.status === 'Sedang Beroperasi';
    if (filterStatus === 'completed') return r.status === 'Selesai';
    return true;
  });

  const availableVehicles = vehicles.filter((v) => v.status === 'Tersedia');

  const handleOpenApproveDialog = (req: VehicleRequest) => {
    setSelectedRequest(req);
    if (availableVehicles.length > 0) {
      setTargetVehicleId(availableVehicles[0].id);
      setTargetDriver(availableVehicles[0].assignedDriver || 'Pak Bambang Susilo (Driver Pool)');
    }
    setIsApprovingModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedRequest) return;
    onApproveManual(selectedRequest.id, targetVehicleId, targetDriver);
    setIsApprovingModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Daftar Permintaan Kendaraan Operasional
          </h2>
          <p className="text-xs text-slate-500">
            Pengajuan dinas pegawai dengan verifikasi auto-approval dan alokasi armada
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajukan Permintaan Kendaraan
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode permintaan, pemohon, tujuan, divisi..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-md transition-colors ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Semua ({requests.length})
          </button>
          <button
            onClick={() => setFilterStatus('auto')}
            className={`px-3 py-1 rounded-md transition-colors ${filterStatus === 'auto' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Auto-Approved ({requests.filter((r) => r.approvalType === 'Otomatis').length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-md transition-colors ${filterStatus === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Menunggu Review ({requests.filter((r) => r.status === 'Menunggu Review').length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1 rounded-md transition-colors ${filterStatus === 'active' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Aktif Jalan ({requests.filter((r) => r.status === 'Sedang Beroperasi').length})
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Kode & Pemohon</th>
                <th className="py-3 px-4">Tujuan & Agenda</th>
                <th className="py-3 px-4">Jadwal Keberangkatan</th>
                <th className="py-3 px-4">Jarak & Penumpang</th>
                <th className="py-3 px-4">Armada & Driver</th>
                <th className="py-3 px-4">Status & Alasan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold text-slate-900 block">
                      {req.requestCode}
                    </span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      {req.requesterName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Div. {req.requesterDepartment}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-1 font-semibold text-slate-900 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{req.destination}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {req.purpose}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">
                      {req.departureDate}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {req.departureTime} s/d {req.returnTime}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 block">
                      {req.estimatedDistanceKm} km
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {req.passengerCount} Penumpang
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {req.vehiclePlate ? (
                      <div>
                        <span className="font-mono text-[11px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                          {req.vehiclePlate}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]">
                          {req.assignedDriver || 'Mandiri'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Belum dialokasikan</span>
                    )}
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
                          <Clock className="w-3 h-3" />
                          Menunggu Review
                        </span>
                      )}
                      {req.status === 'Sedang Beroperasi' && (
                        <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          Sedang Berjalan
                        </span>
                      )}
                      {req.status === 'Selesai' && (
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          Selesai
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate" title={req.approvalReason}>
                      {req.approvalReason}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {req.status === 'Menunggu Review' && userRole === 'manajer' && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenApproveDialog(req)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => onRejectRequest(req.id, 'Jadwal operasional penuh')}
                          className="px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          Tolak
                        </button>
                      </div>
                    )}

                    {req.status === 'Sedang Beroperasi' && (
                      <button
                        onClick={() => onCompleteTrip(req.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        Selesaikan
                      </button>
                    )}

                    {req.status !== 'Menunggu Review' && req.status !== 'Sedang Beroperasi' && (
                      <span className="text-slate-400 text-[11px]">Terverifikasi</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    Tidak ada permohonan kendaraan yang cocok dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Approval Modal for Manager */}
      {isApprovingModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Persetujuan Manual Permintaan Kendaraan
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedRequest.requestCode} · {selectedRequest.requesterName}
                </span>
              </div>
              <button
                onClick={() => setIsApprovingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-slate-600">
              <div><strong>Tujuan:</strong> {selectedRequest.destination}</div>
              <div><strong>Jarak:</strong> {selectedRequest.estimatedDistanceKm} km</div>
              <div><strong>Alasan Manual:</strong> {selectedRequest.approvalReason}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Pilih Armada yang Tersedia
                </label>
                <select
                  value={targetVehicleId}
                  onChange={(e) => {
                    setTargetVehicleId(e.target.value);
                    const v = vehicles.find((x) => x.id === e.target.value);
                    if (v && v.assignedDriver) setTargetDriver(v.assignedDriver);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} - {v.name} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Penugasan Driver
                </label>
                <input
                  type="text"
                  value={targetDriver}
                  onChange={(e) => setTargetDriver(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsApprovingModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Setujui & Alokasikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
