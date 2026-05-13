'use server'

import { createClient } from "@/utils/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type AuthResponse = { error: string | null }

async function getOrigin() {
    const headersList = await headers();
    const host = headersList.get("host"); // Yields localhost:3000 or 192.168.0.5:3000
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    return `${protocol}://${host}`;
}

export async function loginWithEmail(formData: FormData): Promise<AuthResponse> {
    const supabase = await createClient();
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const { error } = await supabase.auth.signInWithPassword({ email, password})
    if (error) {
        return {error: error.message}
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signupWithEmail(formData: FormData): Promise<AuthResponse> {
    const supabase = await createClient();
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const origin = await getOrigin();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`
        }
    })

    if (error) {
        return {error: error.message}
    }

    redirect('/verify-email')
}

export async function signinWithGoogle() {
    const supabase = await createClient();
    const origin = await getOrigin();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        redirect('/auth-error?message=Could not authenticate with Google')
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}