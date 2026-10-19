import React, { useState } from 'react';
import { Check, Settings, Sliders, X, Zap } from 'lucide-react';
import { AutoApprovalSettings } from '../types';

interface AutoApprovalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AutoApprovalSettings;
  onSaveSettings: (settings: AutoApprovalSettings) => void;
}

export const AutoApprovalConfigModal: React.FC<AutoApprovalConfigModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AutoApprovalSettings>({ ...settings });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Konfigurasi Parameter Persetujuan Otomatis
              </h3>
              <p className="text-[11px] text-slate-500">
                Atur ambang batas dan batasan toleransi auto-approval armada & BBM
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Master Toggles */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-slate-800">
                Aktifkan Auto-Approval Permintaan Kendaraan
              </span>
              <input
                type="checkbox"
                checked={formData.allowAutoApprovalVehicles}
                onChange={(e) =>
                  setFormData({ ...formData, allowAutoApprovalVehicles: e.target.checked })
                }
                className="w-4 h-4 rounded text-slate-900"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-1 border-t border-slate-200">
              <span className="font-semibold text-slate-800">
                Aktifkan Auto-Approval Voucher BBM Driver
              </span>
              <input
                type="checkbox"
                checked={formData.allowAutoApprovalFuel}
                onChange={(e) =>
                  setFormData({ ...formData, allowAutoApprovalFuel: e.target.checked })
                }
                className="w-4 h-4 rounded text-slate-900"
              />
            </label>
          </div>

          {/* Vehicle Thresholds */}
          <div className="space-y-3 pt-1">
            <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
              Batas Permintaan Kendaraan Operasional
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Maks. Jarak Tempuh (KM)
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={formData.vehicleMaxDistanceKm}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleMaxDistanceKm: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                />
                <span className="text-[10px] text-slate-400">Jarak tempuh &gt; batas masuk review manual</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Maks. Durasi Hari Peminjaman
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.vehicleMaxDurationDays}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleMaxDurationDays: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                />
                <span className="text-[10px] text-slate-400">Dinas luar kota panjang perlu review</span>
              </div>
            </div>
          </div>

          {/* Fuel Thresholds */}
          <div className="space-y-3 pt-2">
            <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
              Batas Pengajuan BBM Driver
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Maks. Liter Per Pengisian
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={formData.fuelMaxLitersPerRequest}
                  onChange={(e) =>
                    setFormData({ ...formData, fuelMaxLitersPerRequest: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Plafon Maks. Biaya (Rp)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={formData.fuelMaxCostPerRequest}
                  onChange={(e) =>
                    setFormData({ ...formData, fuelMaxCostPerRequest: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Batas Bawah Efisiensi Konsumsi (KM / Liter)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="4.0"
                  max="15.0"
                  value={formData.fuelMinKmPerLiter}
                  onChange={(e) =>
                    setFormData({ ...formData, fuelMinKmPerLiter: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                />
                <span className="text-slate-500 font-mono">km/L</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Konsumsi di bawah {formData.fuelMinKmPerLiter} km/L dianggap anomali dan mewajibkan audit manager
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              Simpan Konfigurasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
