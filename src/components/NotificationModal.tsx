import React from 'react';
import { AlertCircle, AlertTriangle, Bell, CheckCheck, Info, X } from 'lucide-react';
import { ServiceNotification } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ServiceNotification[];
  onMarkAllAsRead: () => void;
  onSelectVehicle?: (vehicleId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectVehicle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden mt-12 animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900">
              Pusat Notifikasi & Pengingat Servis
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] text-slate-600 hover:text-slate-900 font-medium"
            >
              Tandai Dibaca
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 transition-colors ${
                notif.isRead ? 'bg-white' : 'bg-rose-50/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {notif.severity === 'urgent' ? (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  ) : notif.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-600" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                      {notif.vehiclePlate}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {notif.createdAt}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notif.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ada notifikasi pengingat aktif saat ini.
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
          <p className="text-[11px] text-slate-500">
            Sistem otomatis memeriksa odometer & masa berlaku KIR setiap saat.
          </p>
        </div>
      </div>
    </div>
  );
};
