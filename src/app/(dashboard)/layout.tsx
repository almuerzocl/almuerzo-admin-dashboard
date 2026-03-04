"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Users,
    Store,
    LayoutDashboard,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    Bell,
    Percent,
    UploadCloud,
    LineChart,
    ScrollText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    const menuItems = [
        { name: 'Status de la Plataforma', href: '/', icon: LayoutDashboard },
        { name: 'Ingresos y Facturación', href: '/revenue', icon: BarChart3 },
        { name: 'Gestión de Usuarios', href: '/users', icon: Users },
        { name: 'Gestión de Restaurantes', href: '/restaurants', icon: Store },
        { name: 'Gestión de Descuentos', href: '/discounts', icon: Percent },
        { name: 'Utilidades de Carga Masiva', href: '/bulk-upload', icon: UploadCloud },
        { name: 'Analítica', href: '/analytics', icon: LineChart },
        { name: 'Logs', href: '/logs', icon: ScrollText },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-800 flex">
            {/* Sidebar */}
            <aside className={cn(
                "bg-white border-r border-zinc-200 transition-all duration-300 flex flex-col fixed inset-y-0 z-50",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    {isSidebarOpen && (
                        <span className="font-black text-xl tracking-tight">ALMUERZO<span className="text-blue-500">.ADMIN</span></span>
                    )}
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                                    isActive
                                        ? "bg-blue-600/10 text-blue-500 border border-blue-500/20"
                                        : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-500" : "group-hover:text-zinc-900")} />
                                {isSidebarOpen && <span className="font-bold text-sm">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-200">
                    <button className="flex items-center gap-3 px-3 py-3 w-full text-zinc-400 hover:text-red-400 transition-colors">
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span className="font-bold text-sm">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={cn(
                "flex-1 transition-all duration-300",
                isSidebarOpen ? "ml-64" : "ml-20"
            )}>
                {/* Header */}
                <header className="h-20 bg-white/50 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-zinc-50 rounded-lg text-zinc-400"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <h2 className="text-lg font-black tracking-tight uppercase text-zinc-400">Panel de Control</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-zinc-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-zinc-900">Super Admin</p>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Global Ops</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full border-2 border-zinc-200 flex items-center justify-center font-black text-sm">
                                SA
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
