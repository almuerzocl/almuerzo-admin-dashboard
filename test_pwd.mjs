import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/estebanzarate/Documents/Almuerzocl/almuerzo-admin-dashboard/.env' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
const { data, error } = await supabaseAdmin.auth.admin.listUsers();
console.log(data.users.map(u => ({ email: u.email, id: u.id, confirmed_at: u.confirmed_at })));
const u5 = data.users.find(u => u.email === 'user5@almuerzo.cl');
console.log('user5', u5);
}
run();
