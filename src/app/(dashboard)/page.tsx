"use client";

import React, { useEffect, useState } from 'react';
import {
    Users,
    Store,
    DollarSign,
    Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalRestaurants: 0,
        activeRestaurants: 0,
        totalUsers: 0,
        totalRevenue: 0,
        totalReservations: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            try {
                // Fetch Total Restaurants
                const { count: restCount } = await supabase
                    .from('restaurants')
                    .select('*', { count: 'exact', head: true });

                const { count: activeCount } = await supabase
                    .from('restaurants')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_active', true);

                // Fetch Total Users
                const { count: userCount } = await supabase
                    .from('user_profiles')
                    .select('*', { count: 'exact', head: true });

                // Fetch Total Revenue (Sum of total from takeaway_orders)
                const { data: orders } = await supabase
                    .from('takeaway_orders')
                    .select('total')
                    .eq('status', 'COMPLETED');

                const revenue = orders?.reduce((acc, curr) => acc + (curr.total || 0), 0) || 0;

                // Fetch total reservations
                const { count: resCount } = await supabase
                    .from('reservations')
                    .select('*', { count: 'exact', head: true });

                setStats({
                    totalRestaurants: restCount || 0,
                    activeRestaurants: activeCount || 0,
                    totalUsers: userCount || 0,
                    totalRevenue: revenue,
                    totalReservations: resCount || 0
                });
            } catch (err) {
                console.error("Error fetching admin stats:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const cards = [
        { title: 'Restaurantes', value: stats.totalRestaurants, detail: `${stats.activeRestaurants} Activos`, icon: Store, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Usuarios Globales', value: stats.totalUsers, detail: 'Cuentas creadas', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'Ingresos Totales', value: `$${stats.totalRevenue.toLocaleString('es-CL')}`, detail: 'Total General', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
        { title: 'Reservas Totales', value: stats.totalReservations, detail: 'Histórico global', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    if (loading) {
        return <div className="animate-pulse space-y-8">
            <div className="h-10 w-48 bg-zinc-800 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-zinc-800 rounded-2xl" />)}
            </div>
            <div className="h-96 bg-zinc-800 rounded-3xl" />
        </div>;
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    Vista General <span className="text-blue-500/20">—</span>
                    <span className="text-zinc-500 text-lg font-bold uppercase tracking-widest mt-1">Global Metrics</span>
                </h1>
                <p className="text-zinc-500 font-medium">Estado actual de todo el ecosistema Almuerzo.cl</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-zinc-950 border border-zinc-800 p-6 rounded-[2rem] hover:border-zinc-700 transition-all shadow-xl shadow-black/20 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-3 rounded-2xl", card.bg)}>
                                <card.icon className={cn("w-6 h-6", card.color)} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">Real-time</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black tracking-tighter">{card.value}</p>
                            <p className="text-xs font-bold text-zinc-500">{card.title}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-zinc-900/50 flex items-center gap-1.5 overflow-hidden">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-600 truncate">{card.detail}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Removed fake system health and quick action widgets here. Only real metrics left. */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            </div>
        </div>
    );
}
