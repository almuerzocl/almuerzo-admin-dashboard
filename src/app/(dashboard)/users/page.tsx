"use client";

import { useEffect, useState } from "react";
import { Search, Plus, CheckCircle2, ShieldAlert, KeyRound, User, Save, X, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// Mocks extensions since schema might not have all these fields explicitly yet
interface ExtendedUser {
    id: string;
    active: boolean;
    blocked: boolean;
    first_name: string;
    last_name: string;
    email: string;
    reset_password?: string;
    // For Restaurant/Admin users
    role?: 'administrador' | 'reservas' | 'pedidos' | 'user' | 'restaurant' | 'admin' | 'superadmin' | string;
    usage_ratio?: string; // "1/3"
}

export default function UsersAdmin() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("pwa");

    const [pwaUsers, setPwaUsers] = useState<ExtendedUser[]>([]);
    const [restaurantUsers, setRestaurantUsers] = useState<ExtendedUser[]>([]);
    const [adminUsers, setAdminUsers] = useState<ExtendedUser[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newUserData, setNewUserData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'user',
        restaurant_id: ''
    });

    const [restaurantsList, setRestaurantsList] = useState<{ id: string, name: string }[]>([]);

    async function fetchUsers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('last_name', { ascending: true });

            if (error) throw error;

            const mapped: ExtendedUser[] = (data || []).map((u: any) => ({
                id: u.id,
                active: u.is_active !== false,
                blocked: false, // You might want to map this to an actual column later
                first_name: u.first_name || 'Sin Nombre',
                last_name: u.last_name || '',
                email: u.email || '',
                reset_password: "",
                role: u.role as any,
                usage_ratio: u.restaurant_id ? "—" : undefined
            }));

            // Split users into the three buckets based on role
            setPwaUsers(mapped.filter(u => u.role === 'user' || !u.role));
            setRestaurantUsers(mapped.filter(u => u.role === 'restaurant'));
            setAdminUsers(mapped.filter(u => u.role === 'admin' || u.role === 'superadmin'));

        } catch (err: any) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchRestaurantsList() {
        try {
            const { data, error } = await supabase
                .from('restaurants')
                .select('id, name')
                .eq('is_active', true)
                .order('name', { ascending: true });

            if (!error && data) {
                setRestaurantsList(data);
            }
        } catch (err) {
            console.error("Error fetching restaurants list:", err);
        }
    }

    useEffect(() => {
        fetchUsers();
        fetchRestaurantsList();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUserData)
            });
            const result = await res.json();

            if (!res.ok) {
                alert(`Error: ${result.error}`);
            } else {
                fetchUsers(); // Refresh list
                setIsAddModalOpen(false);
                setNewUserData({ first_name: '', last_name: '', email: '', password: '', role: 'user', restaurant_id: '' });
            }
        } catch (err: any) {
            alert(`Network error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const renderTable = (type: 'pwa' | 'restaurant' | 'admin', users: ExtendedUser[]) => {
        const filtered = users.filter(u =>
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="bg-white/50 border border-zinc-200 rounded-[2rem] overflow-hidden overflow-x-auto mt-6">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/50">
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest w-24 text-center">Activo</th>
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest w-24 text-center">Bloqueado</th>
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nombre del Usuario</th>
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">E-mail</th>
                            {type === 'restaurant' && (
                                <>
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Rol</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Uso Cuentas</th>
                                </>
                            )}
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Contraseña de Reinicio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={type === 'restaurant' ? 7 : 5} className="py-12 text-center text-zinc-400 font-bold text-sm uppercase tracking-widest">
                                    No se encontraron registros
                                </td>
                            </tr>
                        ) : (
                            filtered.map(user => (
                                <tr key={user.id} className="hover:bg-zinc-50/40 transition-colors">
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            {user.active ? (
                                                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold">No</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            {user.blocked ? (
                                                <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                                                    <ShieldAlert className="w-3.5 h-3.5" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold">No</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-zinc-800 text-sm">{user.first_name} {user.last_name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-zinc-400">{user.email}</p>
                                    </td>

                                    {type === 'restaurant' && (
                                        <>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                                                    user.role === 'administrador' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                                        user.role === 'reservas' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                                            "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                                                )}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xs font-black bg-zinc-100 px-2 py-1 rounded-md text-zinc-600">
                                                    {user.usage_ratio}
                                                </span>
                                            </td>
                                        </>
                                    )}

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 max-w-[200px]">
                                            <div className="relative flex-1">
                                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                                                <input
                                                    type="text"
                                                    placeholder="Nueva clave"
                                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                            <button className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                                                <Save className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                        <User className="w-8 h-8 text-blue-500" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-zinc-400 font-medium mt-1">Control de accesos y roles (PWA, Restorant y Administración)</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <TabsList className="bg-zinc-50/80 p-1 border border-zinc-200/50">
                        <TabsTrigger value="pwa" className="rounded-md font-bold text-sm tracking-tight data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                            Usuarios PWA
                        </TabsTrigger>
                        <TabsTrigger value="restaurant" className="rounded-md font-bold text-sm tracking-tight data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                            Usuarios RESTAURANTE
                        </TabsTrigger>
                        <TabsTrigger value="admin" className="rounded-md font-bold text-sm tracking-tight data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                            Administrador General
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Buscar registro..."
                                className="w-full bg-white border border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase text-[10px] h-10 px-5 rounded-xl shadow-lg shadow-blue-900/20"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Agregar Nuevo
                        </Button>
                    </div>
                </div>

                <TabsContent value="pwa" className="animate-in fade-in-50 duration-300">
                    {loading ? <div className="p-8 text-center text-zinc-400">Cargando...</div> : renderTable('pwa', pwaUsers)}
                </TabsContent>

                <TabsContent value="restaurant" className="animate-in fade-in-50 duration-300">
                    {loading ? <div className="p-8 text-center text-zinc-400">Cargando...</div> : renderTable('restaurant', restaurantUsers)}
                </TabsContent>

                <TabsContent value="admin" className="animate-in fade-in-50 duration-300">
                    {loading ? <div className="p-8 text-center text-zinc-400">Cargando...</div> : renderTable('admin', adminUsers)}
                </TabsContent>
            </Tabs>

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-50/80 backdrop-blur-sm px-4">
                    <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h2 className="text-xl font-black text-zinc-900 px-2">Crear Nuevo Usuario</h2>
                        <p className="text-zinc-400 text-sm font-medium px-2 mb-6">Asigne los datos correspondientes para el nuevo acceso.</p>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none placeholder:text-zinc-700 font-medium"
                                        placeholder="Ej. Juan"
                                        value={newUserData.first_name}
                                        onChange={(e) => setNewUserData({ ...newUserData, first_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">Apellido</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none placeholder:text-zinc-700 font-medium"
                                        placeholder="Ej. Perez"
                                        value={newUserData.last_name}
                                        onChange={(e) => setNewUserData({ ...newUserData, last_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none placeholder:text-zinc-700 font-medium"
                                    placeholder="correo@ejemplo.com"
                                    value={newUserData.email}
                                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">Definir Contraseña Inicial</label>
                                <input
                                    type="text"
                                    required
                                    minLength={6}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none placeholder:text-zinc-700 font-medium"
                                    placeholder="Contraseña (Mín. 6 caracteres)"
                                    value={newUserData.password}
                                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">Rol del Usuario</label>
                                <select
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none appearance-none font-medium"
                                    value={newUserData.role}
                                    onChange={(e) => {
                                        setNewUserData({ ...newUserData, role: e.target.value, restaurant_id: '' });
                                    }}
                                >
                                    <option value="user">Usuario PWA (Comensal)</option>
                                    <option value="restaurant">Administrador de Restaurant (Local)</option>
                                    <option value="admin">Administrador General (App)</option>
                                </select>
                            </div>

                            {newUserData.role === 'restaurant' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">Restaurante Asignado</label>
                                    <select
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none appearance-none font-medium"
                                        value={newUserData.restaurant_id}
                                        onChange={(e) => setNewUserData({ ...newUserData, restaurant_id: e.target.value })}
                                    >
                                        <option value="" disabled>Seleccione un restaurante...</option>
                                        {restaurantsList.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <Button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 font-bold tracking-widest uppercase text-xs h-12 rounded-xl"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase text-xs h-12 rounded-xl shadow-lg shadow-blue-900/20"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirmar Creación"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
