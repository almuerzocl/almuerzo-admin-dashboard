"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Calendar,
    Download,
    Filter,
    BarChart3,
    PieChart,
    ChevronRight,
    Search,
    CreditCard,
    ArrowRightLeft,
    HandCoins
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { cn } from "@/lib/utils";

const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

export default function RevenueAdmin() {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        averageTicket: 0,
        totalCommissions: 0,
        collectionRate: 98.2 // static for now
    });
    const [recentTx, setRecentTx] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch last 7 days of completed orders
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);

                const { data: orders } = await supabase
                    .from('takeaway_orders')
                    .select('total, created_at, status')
                    .gte('created_at', weekAgo.toISOString());

                const { data: allOrders } = await supabase
                    .from('takeaway_orders')
                    .select('total, status')
                    .eq('status', 'COMPLETED');

                const { data: reservations } = await supabase
                    .from('reservations')
                    .select('created_at')
                    .gte('created_at', weekAgo.toISOString());

                const { data: latest } = await supabase
                    .from('takeaway_orders')
                    .select('id, total, created_at, status, restaurant_id')
                    .order('created_at', { ascending: false })
                    .limit(5);

                // Compute Stats
                const validOrders = allOrders?.filter(o => o.status === 'COMPLETED') || [];
                const totalRev = validOrders.reduce((acc, o) => acc + (o.total || 0), 0);
                const avgTicket = validOrders.length > 0 ? totalRev / validOrders.length : 0;
                const totalComms = totalRev * 0.1; // Using a 10% mock commission rate

                setStats({
                    totalRevenue: totalRev,
                    averageTicket: Math.round(avgTicket),
                    totalCommissions: Math.round(totalComms),
                    collectionRate: 98.2
                });

                // Compute Graph Data
                let grouped: Record<string, { value: number, reservations: number }> = {};
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    grouped[DAYS[d.getDay()]] = { value: 0, reservations: 0 };
                }

                (orders || []).forEach(o => {
                    const dayName = DAYS[new Date(o.created_at).getDay()];
                    if (grouped[dayName] && o.status === 'COMPLETED') {
                        grouped[dayName].value += (o.total || 0);
                    }
                });

                (reservations || []).forEach(r => {
                    const dayName = DAYS[new Date(r.created_at).getDay()];
                    if (grouped[dayName]) {
                        grouped[dayName].reservations += 1;
                    }
                });

                setChartData(Object.entries(grouped).map(([name, vals]) => ({
                    name,
                    value: vals.value,
                    reservations: vals.reservations
                })));

                // Compute recent transactions
                if (latest) {
                    setRecentTx(latest.map(tx => ({
                        id: `#TX-${tx.id.substring(0, 6).toUpperCase()}`,
                        rest: 'Restaurante Asociado', // Could join table for exact name
                        date: new Date(tx.created_at).toLocaleString('es-CL', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
                        amount: `+$${(tx.total || 0).toLocaleString('es-CL')}`,
                        status: tx.status === 'COMPLETED' ? 'CONFIRMADO' : 'PENDIENTE',
                        method: 'Vía App'
                    })));
                }

            } catch (error) {
                console.error("Error fetching revenue data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center flex-col items-center py-20 mt-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-zinc-500 font-medium">Cargando métricas financieras...</p>
        </div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        Ingresos Globales
                    </h1>
                    <p className="text-slate-400 font-medium">Análisis de transacciones y performance financiera</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-slate-900 border border-slate-800 text-slate-300 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md">
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                        <Calendar className="w-4 h-4" />
                        Ver Histórico
                    </button>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Recaudado (Mes)", value: `$${stats.totalRevenue.toLocaleString('es-CL')}`, change: "+12.5%", icon: DollarSign, color: "blue", positive: true },
                    { label: "Tickets Promedio", value: `$${stats.averageTicket.toLocaleString('es-CL')}`, change: "", icon: ArrowRightLeft, color: "orange", positive: false },
                    { label: "Comisiones Almuerzo", value: `$${stats.totalCommissions.toLocaleString('es-CL')}`, change: "+8.1%", icon: HandCoins, color: "emerald", positive: true },
                    { label: "Tasa de Cobro", value: `${stats.collectionRate}%`, change: "+0.5%", icon: TrendingUp, color: "purple", positive: true },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col gap-4 relative overflow-hidden group hover:border-slate-700 transition-all">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            stat.color === 'blue' ? "bg-blue-500/10 text-blue-400" :
                                stat.color === 'orange' ? "bg-orange-500/10 text-orange-400" :
                                    stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" :
                                        "bg-purple-500/10 text-purple-400"
                        )}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <div className="flex items-end gap-2">
                                <p className="text-2xl font-black text-white leading-none">{stat.value}</p>
                                <span className={cn(
                                    "text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5",
                                    stat.positive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                )}>
                                    {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                Tendencia Semanal
                            </h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Ingresos Brutos vs Proyección</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    tickFormatter={(val) => `$${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px', fontWeight: 800, color: '#fff' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Transactions List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-white tracking-tight">Transacciones Recientes</h3>
                    <button className="text-[10px] font-black uppercase text-blue-400 tracking-widest hover:text-blue-300 transition-colors">Ver Todo</button>
                </div>

                <div className="grid gap-3">
                    {recentTx.length > 0 ? recentTx.map((tx, i) => (
                        <div key={i} className="bg-slate-900/30 border border-slate-800/50 p-5 rounded-3xl flex items-center gap-6 hover:bg-slate-900/50 hover:border-slate-700 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors shadow-inner">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-black text-white">{tx.rest}</p>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    <span>{tx.id}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {tx.date}</span>
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-lg font-black text-white">{tx.amount}</p>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{tx.method}</p>
                            </div>
                            <div className="pl-4">
                                <button className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 hover:text-blue-400 hover:border-blue-500/50 transition-all shadow-sm">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-slate-500 font-medium">No hay transacciones recientes.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

const statColorMap: Record<string, string> = {
    blue: "bg-blue-500",
    slate: "bg-slate-500",
    orange: "bg-orange-500",
};
