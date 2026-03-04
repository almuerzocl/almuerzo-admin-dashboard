"use client";

import { useEffect, useState } from "react";
import { Search, Plus, CheckCircle2, ShieldAlert, Star, Store, Save, ChevronRight, XCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface RestaurantAdminView {
    id: string;
    active: boolean;
    featured: boolean;
    featured_date: string; // fecha de edición
    name: string;
    authorized_users: number; // 1 | 5 | 10
    admin_email: string;
    plan: string;
}

export default function RestaurantsAdmin() {
    const [searchTerm, setSearchTerm] = useState("");
    const [restaurants, setRestaurants] = useState<RestaurantAdminView[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newRestaurant, setNewRestaurant] = useState({
        name: "",
        is_active: true,
        authorized_users: 1,
        subscription_plan: "Básico"
    });

    useEffect(() => {
        fetchRestaurants();
    }, []);

    async function fetchRestaurants() {
        setLoading(true);
        try {
            const { data: restData, error } = await supabase
                .from('restaurants')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            // Also fetch their admins to get the email
            const adminIds = [...new Set(restData.map((r: any) => r.admin_id).filter(Boolean))];
            let adminMap: Record<string, string> = {};
            if (adminIds.length > 0) {
                const { data: usersData } = await supabase
                    .from('user_profiles')
                    .select('id, email')
                    .in('id', adminIds);

                if (usersData) {
                    adminMap = usersData.reduce((acc: any, user: any) => {
                        acc[user.id] = user.email;
                        return acc;
                    }, {} as Record<string, string>);
                }
            }

            const mapped = restData.map((r: any) => ({
                id: r.id,
                active: r.is_active || false,
                featured: r.featured || false,
                featured_date: r.updated_at ? new Date(r.updated_at).toLocaleDateString() : '—',
                name: r.name,
                authorized_users: r.authorized_users || 1,
                admin_email: adminMap[r.admin_id] || 'Sin Asignar',
                plan: r.subscription_plan || 'Básico'
            }));

            setRestaurants(mapped);
        } catch (err) {
            console.error("Error fetching restaurants:", err);
        } finally {
            setLoading(false);
        }
    }

    const filtered = restaurants.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.admin_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUserLimitChange = async (id: string, newLimit: number) => {
        setRestaurants(prev => prev.map(r => r.id === id ? { ...r, authorized_users: newLimit } : r));
        try {
            await supabase.from('restaurants').update({ authorized_users: newLimit }).eq('id', id);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateRestaurant = async () => {
        if (!newRestaurant.name.trim()) return;
        setIsCreating(true);
        try {
            const { error } = await supabase.from('restaurants').insert({
                name: newRestaurant.name,
                is_active: newRestaurant.is_active,
                authorized_users: newRestaurant.authorized_users,
                subscription_plan: newRestaurant.subscription_plan
            });

            if (error) throw error;

            // Refresh list and close modal
            await fetchRestaurants();
            setIsModalOpen(false);
            setNewRestaurant({
                name: "",
                is_active: true,
                authorized_users: 1,
                subscription_plan: "Básico"
            });
        } catch (err) {
            console.error("Error creating restaurant:", err);
            alert("Error al crear el restaurante");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <Store className="w-8 h-8 text-blue-500" />
                        Gestión de Restaurantes
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Directorio global y capacidades de los locales asociados</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-4 h-4 mr-2" /> Agregar Nuevo Restaurante
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-[2rem] overflow-hidden overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest w-20 text-center">Activo</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nombre del Restaurante</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Usuarios Autorizados</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">E-mail Administrador</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Plan Suscrito</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-zinc-500 font-bold text-sm uppercase tracking-widest">
                                        No se encontraron restaurantes
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(restaurant => (
                                    <tr key={restaurant.id} className="hover:bg-zinc-900/40 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center">
                                                {restaurant.active ? (
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-600 flex items-center justify-center">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-zinc-200 text-sm">{restaurant.name}</p>
                                        </td>

                                        <td className="px-6 py-4 flex justify-center">
                                            <select
                                                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 font-bold cursor-pointer"
                                                value={restaurant.authorized_users}
                                                onChange={(e) => handleUserLimitChange(restaurant.id, parseInt(e.target.value))}
                                            >
                                                <option value={1}>1 Usuario</option>
                                                <option value={5}>5 Usuarios</option>
                                                <option value={10}>10 Usuarios</option>
                                            </select>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm text-zinc-400">{restaurant.admin_email}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                                                restaurant.plan === 'Pro' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                                    restaurant.plan === 'Enterprise' ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" :
                                                        "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                            )}>
                                                {restaurant.plan}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Creating Restaurant */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        {/* Close button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-900 text-zinc-500 hover:text-white transition-all"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                                        <Plus className="w-5 h-5 text-blue-500" />
                                    </div>
                                    Nuevo Restaurante
                                </h2>
                                <p className="text-zinc-500 text-sm font-medium mt-1">Completa los datos para dar de alta al socio</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nombre del Restaurante</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: La Piccola Italia"
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                                        value={newRestaurant.name}
                                        onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Usuarios Autorizados</label>
                                        <select
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                                            value={newRestaurant.authorized_users}
                                            onChange={(e) => setNewRestaurant({ ...newRestaurant, authorized_users: parseInt(e.target.value) })}
                                        >
                                            <option value={1}>1 Usuario</option>
                                            <option value={5}>5 Usuarios</option>
                                            <option value={10}>10 Usuarios</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Plan de Suscripción</label>
                                        <select
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                                            value={newRestaurant.subscription_plan}
                                            onChange={(e) => setNewRestaurant({ ...newRestaurant, subscription_plan: e.target.value })}
                                        >
                                            <option value="Básico">Básico</option>
                                            <option value="Pro">Pro</option>
                                            <option value="Enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={() => setNewRestaurant({ ...newRestaurant, is_active: !newRestaurant.is_active })}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative border",
                                            newRestaurant.is_active ? "bg-emerald-500/20 border-emerald-500/50" : "bg-zinc-900 border-zinc-800"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full transition-all",
                                            newRestaurant.is_active ? "right-1 bg-emerald-500 shadow-lg shadow-emerald-500/50" : "left-1 bg-zinc-700"
                                        )} />
                                    </button>
                                    <span className="text-sm font-bold text-zinc-300">Restaurante Activo</span>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold h-12 rounded-2xl border border-zinc-800"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleCreateRestaurant}
                                    disabled={isCreating || !newRestaurant.name.trim()}
                                    className="flex-2 bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-2xl shadow-xl shadow-blue-900/40 px-8"
                                >
                                    {isCreating ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Crear Restaurante"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

