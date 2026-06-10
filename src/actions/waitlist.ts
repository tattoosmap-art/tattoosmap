"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function joinWaitlist(email: string, userType: 'artist' | 'client' | 'both') {
    if (!email || !email.includes('@')) {
        return { error: "Please enter a valid email address." };
    }

    try {
        const { error } = await supabaseAdmin
            .from('waitlist')
            .insert({
                email: email.trim().toLowerCase(),
                user_type: userType,
                created_at: new Date().toISOString()
            });

        if (error) {
            if (error.code === '23505') {
                return { success: true, message: "YOU ARE ALREADY ON THE LIST. WE WILL REACH OUT WHEN WE LAUNCH IN YOUR AREA." };
            }
            throw error;
        }

        revalidatePath('/');
        return { success: true, message: "YOU ARE ON THE LIST. WE WILL REACH OUT WHEN WE LAUNCH IN YOUR AREA." };
    } catch (err: any) {
        console.error("Waitlist error:", err);
        return { error: "Something went wrong. Please try again later." };
    }
}
