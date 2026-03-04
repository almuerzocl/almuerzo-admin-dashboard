"use client";

import { useState, useEffect } from "react";
import {
    LineChart,
    BarChart3,
    TrendingUp,
    Store,
    Users,
    DollarSign,
    Calendar,
    Activity,
    ChevronDown,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type TimeRange = 'hoy' | 'semana' | 'mes' | 'personalizado';

export default function AnalyticsAdmin() {
    const [timeRange, setTimeRange] = useState<TimeRange>('hoy');
    const [isSelectingCustom, setIsSelectingCustom] = useState(false);

    const [stats, setStats] = useState({
        ventasTotales: 0,
        reservas: 0,
        usuariosNuevos: 0,
        ticketsPromedio: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true);
            try {
                let startDate = new Date();
                if (timeRange === 'hoy') {
                    startDate.setHours(0, 0, 0, 0);
                } else if (timeRange === 'semana') {
                    startDate.setDate(startDate.getDate() - 7);
                } else if (timeRange === 'mes') {
                    startDate.setDate(startDate.getDate() - 30);
                } else {
                    // Start 14 days ago for custom mock as fallback
                    startDate.setDate(startDate.getDate() - 14);
                }

                const { data: orders } = await supabase
                    .from('takeaway_orders')
                    .select('total')
                    .gte('created_at', startDate.toISOString())
                    .eq('status', 'COMPLETED');

                const { count: resCount } = await supabase
                    .from('reservations')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', startDate.toISOString());

                const { count: userCount } = await supabase
                    .from('user_profiles')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', startDate.toISOString());

                const totalRevenue = (orders || []).reduce((acc, curr) => acc + (curr.total || 0), 0);
                const avgTicket = orders && orders.length > 0 ? totalRevenue / orders.length : 0;

                setStats({
                    ventasTotales: totalRevenue,
                    reservas: resCount || 0,
                    usuariosNuevos: userCount || 0,
                    ticketsPromedio: Math.round(avgTicket)
                });
            } catch (err) {
                console.error("Error fetching analytics:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, [timeRange]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header & Time Filters */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                        <LineChart className="w-8 h-8 text-blue-500" />
                        Analítica Avanzada
                    </h1>
                    <p className="text-zinc-400 font-medium mt-1">Rendimiento global, ventas e indicadores del sistema</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="bg-white/80 p-1 rounded-2xl border border-zinc-200 flex items-center">
                        <button
                            onClick={() => { setTimeRange('hoy'); setIsSelectingCustom(false); }}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                timeRange === 'hoy' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            En Vivo: Hoy
                        </button>
                        <button
                            onClick={() => { setTimeRange('semana'); setIsSelectingCustom(false); }}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                timeRange === 'semana' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => { setTimeRange('mes'); setIsSelectingCustom(false); }}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                timeRange === 'mes' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            Mes
                        </button>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => { setTimeRange('personalizado'); setIsSelectingCustom(!isSelectingCustom); }}
                            className={cn(
                                "px-5 py-2.5 h-full rounded-2xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2",
                                timeRange === 'personalizado'
                                    ? "bg-purple-600/10 text-purple-400 border-purple-500/50"
                                    : "bg-white/80 text-zinc-400 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900"
                            )}
                        >
                            <Calendar className="w-4 h-4" />
                            Personalizado
                            <ChevronDown className={cn("w-3 h-3 transition-transform", isSelectingCustom && "rotate-180")} />
                        </button>

                        {/* Optional Date Picker Mock dropdown */}
                        {isSelectingCustom && (
                            <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-zinc-200 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 hover:text-zinc-900 transition-colors">Seleccionar Fechas (Demo)</p>
                                <div className="space-y-2">
                                    <input type="date" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 color-scheme-dark" />
                                    <div className="text-center text-zinc-600 text-[10px] font-black uppercase">hasta</div>
                                    <input type="date" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 color-scheme-dark" />
                                    <button className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-colors" onClick={() => setIsSelectingCustom(false)}>Aplicar Rango</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                    { label: "Ventas Totales", val: `$${stats.ventasTotales.toLocaleString('es-CL')}`, trend: "+12.5%", pos: true, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Reservas", val: stats.reservas.toLocaleString('es-CL'), trend: "+5.2%", pos: true, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Usuarios Nuevos", val: stats.usuariosNuevos, trend: "-2.1%", pos: false, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
                    { label: "Tickets Promedio", val: `$${stats.ticketsPromedio.toLocaleString('es-CL')}`, trend: "+1.1%", pos: true, icon: Store, color: "text-amber-500", bg: "bg-amber-500/10" }
                ].map((stat, i) => (
                    <div key={i} className={cn("bg-white/60 border border-zinc-200 p-6 rounded-[2rem] hover:border-zinc-300 transition-all group", loading ? "opacity-50" : "opacity-100")}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-105", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1",
                                stat.pos ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                            )}>
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-3xl font-black tracking-tighter text-zinc-900 mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-400 transition-all">
                                {stat.val}
                            </p>
                            <p className="text-xs font-bold text-zinc-400 tracking-wide">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section Placeholder Removed to avoid mock info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            </div>
        </div>
    );
}
