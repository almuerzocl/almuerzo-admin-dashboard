import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { email, password, first_name, last_name, role, restaurant_id } = await req.json();

        if (!email || !password || !first_name || !last_name || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: `Server config error. URL: ${!!supabaseUrl}, KEY: ${!!supabaseServiceKey}` }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // 1. Create the user in Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                first_name,
                last_name,
            },
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        const user = authData.user;

        // Check constraint profiles_role_check allows ('user', 'admin', 'super_admin')
        // We map 'restaurant' from the UI logic to 'admin' so the DB insertion succeeds.
        const dbRole = role === 'restaurant' ? 'admin' : role;

        // 2. Insert into profiles with the correct role and restaurant_id
        const profilePayload: any = {
            id: user.id,
            email,
            first_name,
            last_name,
            role: dbRole
        };

        if (restaurant_id) {
            profilePayload.restaurant_id = restaurant_id;
        }

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert(profilePayload);

        if (profileError) {
            // Revert auth user if profile creation fails? For safe measure.
            await supabaseAdmin.auth.admin.deleteUser(user.id);
            return NextResponse.json({ error: profileError.message }, { status: 400 });
        }

        return NextResponse.json({ message: 'User created successfully', user }, { status: 201 });

    } catch (err: any) {
        console.error("User creation error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
