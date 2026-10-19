import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Fuel,
  Info,
  PieChart,
  Printer,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { fuelTypeDistribution, monthlyFuelData } from '../data/mockData';
import { FuelRequest, Vehicle } from '../types';

interface FuelAnalyticsReportProps {
  fuelRequests: FuelRequest[];
  vehicles: Vehicle[];
}

export const FuelAnalyticsReport: React.FC<FuelAnalyticsReportProps> = ({
  fuelRequests,
  vehicles,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('Okt 2026');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const currentMonthData = monthlyFuelData.find((d) => d.month === selectedMonth) || monthlyFuelData[monthlyFuelData.length - 1];

  // Calculate efficiency leaderboard
  const vehicleStats = vehicles.map((v) => {
    const relatedFuelLogs = fuelRequests.filter((r) => r.vehicleId === v.id);
    const totalLitersLogged = relatedFuelLogs.reduce((acc, r) => acc + r.requestedLiters, 0);
    const totalCostLogged = relatedFuelLogs.reduce((acc, r) => acc + r.estimatedCost, 0);

    const avgEfficiency = relatedFuelLogs.length > 0
      ? Number((relatedFuelLogs.reduce((acc, r) => acc + r.calculatedKmPerLiter, 0) / relatedFuelLogs.length).toFixed(1))
      : v.efficiencyRatio;

    return {
      vehicle: v,
      totalLiters: totalLitersLogged,
      totalCost: totalCostLogged,
      efficiency: avgEfficiency,
      isAnomalous: avgEfficiency < 8.0 && v.type !== 'Minibus Operasional',
    };
  });

  // Sort by efficiency descending
  const sortedByEfficiency = [...vehicleStats].sort((a, b) => b.efficiency - a.efficiency);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Kode BBM', 'Tanggal', 'Driver', 'Plat Nomor', 'Kendaraan', 'Jenis BBM', 'Liter', 'Total Biaya (Rp)', 'Odometer (KM)', 'KM per Liter', 'Status', 'SPBU'];
    const rows = fuelRequests.map((r) => [
      r.fuelCode,
      r.createdAt,
      `"${r.driverName}"`,
      r.vehiclePlate,
      `"${r.vehicleName}"`,
      r.fuelType,
      r.requestedLiters,
      r.estimatedCost,
      r.odometerReading,
      r.calculatedKmPerLiter,
      r.status,
      `"${r.spbuName}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Konsumsi_BBM_${selectedMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Laporan Konsumsi Bahan Bakar & Efisiensi Biaya Bulanan
          </h2>
          <p className="text-xs text-slate-500">
            Audit rasio kilometer per liter (KM/L), tren pengeluaran SPBU, dan analisa penghematan armada
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none"
            >
              {monthlyFuelData.map((d) => (
                <option key={d.month} value={d.month}>
                  {d.month}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Rekap
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block mb-1">Konsumsi Total</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {currentMonthData.totalLiters.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-500">Liter</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-medium">
            <TrendingDown className="w-3 h-3" />
            <span>-8.5% vs bulan lalu</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block mb-1">Total Biaya BBM</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              Rp {currentMonthData.totalCost.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-medium">
            <TrendingDown className="w-3 h-3" />
            <span>Hemat Rp 1.400.000</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block mb-1">Rata-rata Rasio KM/L</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
              {currentMonthData.avgKmPerL}
            </span>
            <span className="text-xs text-slate-500">km / L</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+0.4 km/L (Lebih efisien)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block mb-1">Biaya per Kilometer</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              Rp {currentMonthData.costPerKm}
            </span>
            <span className="text-xs text-slate-500">/ km</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dihitung dari {currentMonthData.totalKm.toLocaleString('id-ID')} km total rute</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block mb-1">Efisiensi Rute Terverifikasi</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-blue-600 tabular-nums">
              94.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Voucher valid & sesuai logbook</p>
        </div>
      </div>

      {/* Middle Grid: Monthly Trend Bar Chart & Fuel Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tren Konsumsi Liter & Biaya Operasional (6 Bulan Terakhir)
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan fluktuasi konsumsi bahan bakar terhadap kilometer tempuh armada
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Mei - Oktober 2026</span>
          </div>

          {/* Simple custom CSS Bar Chart (Zero third-party charting bloat) */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-6 gap-3 items-end h-48 border-b border-slate-200 pb-2">
              {monthlyFuelData.map((d) => {
                const maxLiter = 1500;
                const heightPct = Math.round((d.totalLiters / maxLiter) * 100);
                const isSelected = d.month === selectedMonth;

                return (
                  <div
                    key={d.month}
                    onClick={() => setSelectedMonth(d.month)}
                    className="flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
                  >
                    <span className="text-[10px] font-mono font-semibold text-slate-600 group-hover:text-slate-900 tabular-nums">
                      {d.totalLiters} L
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-md relative flex items-end overflow-hidden h-36">
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          isSelected ? 'bg-slate-900' : 'bg-slate-300 group-hover:bg-slate-400'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-medium whitespace-nowrap ${isSelected ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                      {d.month.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-900 rounded-sm"></span>
                <span>Bulan Terpilih: <strong>{selectedMonth}</strong> ({currentMonthData.totalLiters} L / Rp {currentMonthData.totalCost.toLocaleString('id-ID')})</span>
              </span>
              <span className="text-[11px] font-mono">Efisiensi Rata-rata: {currentMonthData.avgKmPerL} KM/L</span>
            </div>
          </div>
        </div>

        {/* Fuel Type Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Distribusi Tipe Bahan Bakar
            </h3>
            <p className="text-xs text-slate-500">
              Porsi konsumsi BBM per jenis (Pertamax, Dexlite, Solar)
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {fuelTypeDistribution.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">{item.type}</span>
                  <span className="font-mono tabular-nums text-slate-600">
                    {item.liters} L ({item.percentage}%) · Rp {(item.cost / 1000000).toFixed(1)}jt
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.type === 'Pertamax'
                        ? 'bg-blue-600'
                        : item.type === 'Dexlite'
                        ? 'bg-amber-600'
                        : item.type === 'Solar'
                        ? 'bg-emerald-600'
                        : 'bg-teal-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Operational Policy Note */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">Kebijakan BBM Perusahaan:</span>
            <p>
              Kendaraan operasional diwajibkan menggunakan BBM non-subsidi (Pertamax/Dexlite) sesuai standar emisi Euro 4 & garansi pabrik.
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle Efficiency & Cost Leaderboard Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">
            Analisis Konsumsi & Efisiensi per Unit Kendaraan
          </h3>
          <p className="text-xs text-slate-500">
            Identifikasi kendaraan paling efisien vs kendaraan dengan konsumsi boros / perlu tune-up
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Kendaraan</th>
                <th className="py-3 px-4">Driver Bertugas</th>
                <th className="py-3 px-4">BBM Digunakan</th>
                <th className="py-3 px-4">Total Permintaan Liter</th>
                <th className="py-3 px-4">Total Biaya Tercatat</th>
                <th className="py-3 px-4">Rasio Konsumsi Riil</th>
                <th className="py-3 px-4">Kategori Efisiensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedByEfficiency.map((item) => {
                const v = item.vehicle;

                return (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                          {v.plateNumber}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900 block truncate max-w-[170px]">
                            {v.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {v.type}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {v.assignedDriver || 'Pool Umum'}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800">
                      {v.fuelType}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                      {item.totalLiters > 0 ? `${item.totalLiters} L` : '38 L (Est)'}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                      Rp {(item.totalCost > 0 ? item.totalCost : 490000).toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold tabular-nums">
                      <span className={item.efficiency >= 12 ? 'text-emerald-600' : 'text-slate-800'}>
                        {item.efficiency} km/L
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {item.isAnomalous ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700">
                          Boros (Perlu Cek Filter)
                        </span>
                      ) : item.efficiency >= 13 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                          Sangat Efisien
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          Standar Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
