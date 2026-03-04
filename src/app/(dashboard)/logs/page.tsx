"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Search,
    Download,
    Activity,
    Database,
    User,
    Shield,
    Clock,
    ScrollText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialLogs();

        // Real-time subscription for new logs
        const channel = supabase
            .channel('audit_logs')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'audit_logs' },
                (payload: any) => {
                    setLogs((current) => [payload.new, ...current]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchInitialLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);

        if (data) setLogs(data);
        setLoading(false);
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
            (log.table_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (log.actor_email || '').toLowerCase().includes(search.toLowerCase());

        if (filter === 'all') return matchesSearch;
        return matchesSearch && log.action === filter;
    });

    const getActionColor = (action: string) => {
        if (!action) return 'text-zinc-400';
        if (action.includes('DELETE') || action.includes('BAN') || action.includes('SUSPEND')) return 'text-rose-500';
        if (action.includes('UPDATE')) return 'text-amber-500';
        if (action.includes('INSERT') || action.includes('CREATE')) return 'text-emerald-500';
        return 'text-blue-500';
    };

    const getActionBg = (action: string) => {
        if (!action) return 'bg-zinc-100 border-zinc-300';
        if (action.includes('DELETE') || action.includes('BAN') || action.includes('SUSPEND')) return 'bg-rose-500/10 border-rose-500/20';
        if (action.includes('UPDATE')) return 'bg-amber-500/10 border-amber-500/20';
        if (action.includes('INSERT') || action.includes('CREATE')) return 'bg-emerald-500/10 border-emerald-500/20';
        return 'bg-blue-500/10 border-blue-500/20';
    };

    const getActionIcon = (action: string) => {
        if (!action) return <Activity className="w-4 h-4" />;
        if (action.includes('DELETE')) return <Database className="w-4 h-4" />;
        if (action.includes('BAN')) return <Shield className="w-4 h-4" />;
        return <Activity className="w-4 h-4" />;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                        <ScrollText className="w-8 h-8 text-blue-500" />
                        Audit Logs
                    </h1>
                    <p className="text-zinc-400 font-medium mt-1">Real-time system activity tracking</p>
                </div>

                <button className="bg-zinc-50 border border-zinc-200 text-zinc-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-100 transition-all shadow-lg hover:text-zinc-900">
                    <Download className="w-5 h-5" />
                    Exportar CSV
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white/50 p-4 border border-zinc-200 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:flex-1 md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="w-full bg-white/80 border border-zinc-200 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto p-1 bg-zinc-50 rounded-xl border border-zinc-200">
                    {['all', 'INSERT', 'UPDATE', 'DELETE', 'LOGIN'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all",
                                filter === f
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                            )}
                        >
                            {f === 'all' ? 'All Activity' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white/50 border border-zinc-200 rounded-[2rem] overflow-hidden">
                <div className="divide-y divide-zinc-800/50">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="p-6 hover:bg-zinc-50/40 transition-colors flex items-start gap-4 animate-pulse">
                                <div className="mt-1 p-3 rounded-xl bg-zinc-100 border border-zinc-300 w-10 h-10" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-zinc-100 rounded w-1/3" />
                                    <div className="h-3 bg-zinc-100 rounded w-1/4" />
                                    <div className="h-16 bg-zinc-50 rounded w-full border border-zinc-200" />
                                </div>
                            </div>
                        ))
                    ) : filteredLogs.length === 0 ? (
                        <div className="p-20 text-center text-zinc-400">
                            <Database className="w-12 h-12 mx-auto mb-4 text-zinc-700 opacity-50" />
                            <h3 className="text-zinc-900 font-bold text-lg mb-1">No hay registros</h3>
                            <p className="font-medium">No activity logs found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div key={log.id} className="p-6 hover:bg-zinc-50/40 transition-colors flex items-start gap-4 group">
                                <div className={cn(
                                    "mt-1 p-3 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105",
                                    getActionBg(log.action),
                                    getActionColor(log.action)
                                )}>
                                    {getActionIcon(log.action)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                        <p className="text-sm font-black text-zinc-900 truncate font-mono">
                                            <span className={getActionColor(log.action)}>{log.action}</span>
                                            <span className="text-zinc-400 text-xs px-2 font-sans tracking-wide">on</span>
                                            <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">{log.table_name}</span>
                                        </p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 tracking-tight">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-4">
                                        <User className="w-3.5 h-3.5 text-blue-500" />
                                        <span>{log.actor_email || 'System'}</span>
                                        <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                        <span className="px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 capitalize text-[10px] font-black tracking-widest leading-none">
                                            {log.actor_type || 'system'}
                                        </span>
                                    </div>

                                    {/* Data Diff Preview */}
                                    <div className="bg-zinc-50/50 border border-zinc-200/80 rounded-xl p-4 font-mono text-[11px] text-zinc-400 overflow-x-auto shadow-inner">
                                        {log.action === 'UPDATE' ? (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div>
                                                    <span className="text-rose-400 uppercase tracking-widest font-black text-[9px] block mb-2 opacity-80 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Old Data
                                                    </span>
                                                    <pre className="whitespace-pre-wrap leading-relaxed text-zinc-400">{JSON.stringify(log.old_data, null, 2)}</pre>
                                                </div>
                                                <div className="lg:border-l lg:border-dashed lg:border-zinc-200 lg:pl-6">
                                                    <span className="text-emerald-400 uppercase tracking-widest font-black text-[9px] block mb-2 opacity-80 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> New Data
                                                    </span>
                                                    <pre className="whitespace-pre-wrap leading-relaxed text-zinc-600">{JSON.stringify(log.new_data, null, 2)}</pre>
                                                </div>
                                            </div>
                                        ) : (
                                            <pre className="whitespace-pre-wrap leading-relaxed">
                                                {JSON.stringify(log.new_data || log.old_data, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
