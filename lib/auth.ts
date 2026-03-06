import { supabase } from "./supabase";
import { UserProfile } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Auth Helpers
// Pure functions that wrap Supabase auth calls. Keep business logic here,
// away from components and context.
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthError {
    message: string;
}

/** Sign up with email and password. Creates a profile row on success. */
export async function signUp(
    email: string,
    password: string,
    name: string
): Promise<{ error: AuthError | null }> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name }, // stored in auth.users.raw_user_meta_data
        },
    });

    if (error) return { error: { message: error.message } };
    if (!data.user) return { error: { message: "Sign up failed. Please try again." } };

    // Create the profile row with the exact schema names
    // Note: The user has a trigger that might do this, but if we do an upsert
    // we make sure we don't break. We won't insert email or name here since 
    // the user's schema doesn't have those columns under `profiles`. Let's just 
    // insert the ID and business_name (mapped from name) to avoid SQL errors.
    const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        business_name: name,
        subscription_plan: "free",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    if (profileError) {
        // Non-fatal: profile might already exist via trigger.
        console.warn("[auth] profile upsert warning:", profileError.message);
    }

    return { error: null };
}

/** Sign in with email and password. */
export async function signIn(
    email: string,
    password: string
): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? { message: error.message } : null };
}

/** Sign in with Google (OAuth). This redirects the user to Google. */
export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });
    return { error: error ? { message: error.message } : null };
}

/** Sign out the current user. */
export async function signOut(): Promise<void> {
    await supabase.auth.signOut();
}

/**
 * Fetch the UserProfile for a given user ID from the `profiles` table.
 * Returns null if not found.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error || !data) return null;

    // `profiles` table does not have email/name in the struct, so we fetch it via the auth user context 
    // typically we merge this in the AuthContext. Here we just map the DB fields.
    return {
        id: data.id,
        businessName: data.business_name ?? null,
        logoUrl: data.logo_url ?? null,
        primaryColor: data.primary_color ?? "#000000",
        accentColor: data.accent_color ?? "#2563eb",
        defaultCurrency: data.default_currency ?? "NGN",
        subscriptionPlan: data.subscription_plan ?? "free",
        subscriptionStatus: data.subscription_status ?? "inactive",
        subscriptionRenewalDate: data.subscription_renewal_date ?? null,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
}

/**
 * Update specific fields on a user's profile.
 * Usage: updateProfile(userId, { name: "New Name" })
 */
export async function updateProfile(
    userId: string,
    updates: Partial<{
        business_name: string | null;
        logo_url: string | null;
        primary_color: string;
        accent_color: string;
        default_currency: string;
        subscription_plan: string;
        subscription_status: string;
        subscription_renewal_date: string | null;
        updated_at: string;
    }>
): Promise<{ error: AuthError | null }> {
    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

    return { error: error ? { message: error.message } : null };
}
