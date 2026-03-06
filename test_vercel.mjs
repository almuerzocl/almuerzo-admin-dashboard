import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/estebanzarate/Documents/Almuerzocl/almuerzo-admin-dashboard/.env' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
const { data, error } = await supabaseAdmin.auth.admin.getUserById('ddc39ee6-3604-4382-9cc5-b21ef5d567fd');
console.log(data);
}
run();
