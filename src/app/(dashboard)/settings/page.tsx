"use client";

import { useEffect, useState } from "react";
import {
    Settings,
    ShieldAlert,
    Database,
    Server,
    Wrench,
    Bell,
    Globe,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Lock,
    Save,
    Map,
    DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsAdmin() {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        Configuración Global
                    </h1>
                    <p className="text-slate-400 font-medium">Variables de entorno y salud de la infraestructura</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Guardar Cambios
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Business Rules */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-6 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <Settings className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-white tracking-tight leading-none uppercase">Reglas de Negocio</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Radio de Búsqueda (KM)</label>
                                <div className="relative">
                                    <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="number"
                                        defaultValue={2.5}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Comisión Standard (%)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="number"
                                        defaultValue={10}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 p-6 bg-slate-950/50 rounded-3xl border border-slate-800 border-dashed">
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-black text-slate-300">Modo de Mantenimiento</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Bloquea el acceso a todas las plataformas</p>
                            </div>
                            <div className="h-8 w-14 bg-slate-800 rounded-full relative p-1 cursor-pointer hover:bg-slate-700 transition-colors">
                                <div className="h-6 w-6 bg-slate-500 rounded-full" />
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-6 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-white tracking-tight leading-none uppercase">Seguridad y Acceso</h3>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: "rls", label: "Supabase RLS Enforced", desc: "Todas las tablas auditadas por políticas de seguridad", enabled: true },
                                { id: "2fa", label: "2FA para Admins", desc: "Requerir autenticación adicional para panel admin", enabled: false },
                                { id: "logs", label: "Audit Logging", desc: "Registro detallado de cambios en restaurantes y usuarios", enabled: true },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-800/10 rounded-2xl transition-colors group">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-white flex items-center gap-2">
                                            {item.label}
                                            {item.enabled ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-slate-600" />}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{item.desc}</p>
                                    </div>
                                    <button className={cn(
                                        "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        item.enabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700"
                                    )}>
                                        {item.enabled ? "Activado" : "Desactivado"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Infrastructure Health */}
                <div className="space-y-8">
                    <section className="bg-slate-950 border border-slate-800 p-8 rounded-[3rem] space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[80px] rounded-full group-hover:bg-blue-500/10 transition-all duration-1000" />

                        <div className="space-y-1 relative">
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                <Server className="w-5 h-5 text-blue-400" />
                                Infraestructura
                            </h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Estado en tiempo real de servicios</p>
                        </div>

                        <div className="space-y-4 relative">
                            {[
                                { name: "Supabase DB", status: "Healthy", latency: "24ms", color: "emerald", icon: Database },
                                { name: "REST API", status: "Healthy", latency: "42ms", color: "emerald", icon: Globe },
                                { name: "Storage Service", status: "Healthy", latency: "128ms", color: "emerald", icon: Server },
                                { name: "Redis Cache", status: "Degraded", latency: "-", color: "rose", icon: RefreshCw },
                            ].map((service, i) => (
                                <div key={i} className="bg-slate-900/30 border border-slate-800/50 p-5 rounded-[2rem] flex items-center gap-4 hover:border-slate-700 transition-all">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        service.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                    )}>
                                        <service.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-white">{service.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{service.status}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{service.latency}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all mt-4">
                            Reiniciar Workers
                        </button>
                    </section>

                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                                <Wrench className="w-4 h-4" />
                            </div>
                            <p className="text-sm font-black text-white">Debug Tools</p>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Accede a las herramientas de desarrollador para depuración profunda de bases de datos y flujos de reserva.</p>
                        <button className="w-full py-3 bg-slate-800/10 hover:bg-slate-800 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-blue-500/10">
                            Abrir Dev Console
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
