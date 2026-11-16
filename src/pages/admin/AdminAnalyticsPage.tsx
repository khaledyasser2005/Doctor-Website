import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { analyticsApi } from '../../api/analyticsApi';
import { AnalyticsOverview } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { DoctorAdminLayout } from '../../components/layout/PortalLayouts';
import { StatCard } from '../../components/ui/StatCard';
import { ErrorState, SkeletonCard } from '../../components/ui/States';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#F59E0B',
  Accepted: '#27C2A4',
  Completed: '#10B981',
  Rejected: '#EF4444',
  Cancelled: '#64748B',
};

export function AdminAnalyticsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    analyticsApi
      .getOverview()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load analytics.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <DoctorAdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold">{t.adminNav.analytics}</h1>
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1">
            Visitor engagement, booking funnel performance, Google sign-ins, and consultation demand.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error || !data ? (
          <ErrorState description={error || undefined} onRetry={load} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                label="Total / Unique Visitors"
                value={`${data.summary.totalVisitors} / ${data.summary.uniqueVisitors}`}
                sublabel={`Profile views: ${data.summary.doctorProfileViews}`}
              />
              <StatCard
                label="Booking Conversion"
                value={`${data.summary.conversionRate}%`}
                sublabel={`Book CTA clicks: ${data.summary.bookClicks}`}
              />
              <StatCard
                label="WhatsApp Inquiries"
                value={data.summary.whatsappClicks}
                sublabel="Direct patient clicks"
                accent="gold"
              />
              <StatCard
                label="Account Activity"
                value={data.summary.newAccounts}
                sublabel={`Google Sign-Ins: ${data.summary.googleLogins} · Cancel rate: ${data.summary.cancellationRate}%`}
                accent="neutral"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visitors Line Chart */}
              <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
                <h2 className="text-base font-bold">Visitors Over Time</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.visitorsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="visitors" stroke="#27C2A4" strokeWidth={2} name="Visits" />
                      <Line
                        type="monotone"
                        dataKey="uniqueVisitors"
                        stroke="#C8A96B"
                        strokeWidth={2}
                        name="Unique"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Appointments Area Chart */}
              <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
                <h2 className="text-base font-bold">Appointments Over Time</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.appointmentsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#27C2A4"
                        fill="#27C2A4"
                        fillOpacity={0.22}
                        name="Total"
                      />
                      <Area
                        type="monotone"
                        dataKey="accepted"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.15}
                        name="Accepted"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Breakdown Donut */}
              <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
                <h2 className="text-base font-bold">Appointment Status Breakdown</h2>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusBreakdown.filter((s) => s.count > 0)}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={55}
                        outerRadius={88}
                        paddingAngle={4}
                      >
                        {data.statusBreakdown
                          .filter((s) => s.count > 0)
                          .map((entry) => (
                            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#27C2A4'} />
                          ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-xs">
                  {data.statusBreakdown.map((s) => (
                    <div key={s.status} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[s.status] }}
                      />
                      <span>
                        {s.status}: <strong className="font-mono">{s.count}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Requested Days Bar Chart */}
              <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
                <h2 className="text-base font-bold">Most Requested Days</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.mostRequestedDays}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#27C2A4" radius={[6, 6, 0, 0]} name="Requests" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Most Visited Pages */}
            <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-4">
              <h2 className="text-base font-bold">Most Visited Pages</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.popularPages.map((pg) => (
                  <div
                    key={pg.path}
                    className="rounded-xl border border-black/8 dark:border-white/8 bg-[#F6F7F5] dark:bg-[#151B22] px-4 py-3 flex items-center justify-between"
                  >
                    <span className="font-mono text-xs font-semibold truncate">{pg.path}</span>
                    <span className="font-mono text-sm font-bold text-[#148F77] dark:text-[#27C2A4]">
                      {pg.views}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DoctorAdminLayout>
  );
}
