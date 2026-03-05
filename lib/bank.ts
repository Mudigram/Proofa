import { supabase } from "./supabase";
import { SavedBankAccount } from "./types";

export interface BankError {
    message: string;
}

/**
 * Fetch all saved bank accounts for a user
 */
export async function getBankAccounts(userId: string): Promise<{ data: SavedBankAccount[] | null; error: BankError | null }> {
    const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

    if (error) {
        return { data: null, error: { message: error.message } };
    }

    const mappedData: SavedBankAccount[] = data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        bankName: row.bank_name,
        accountName: row.account_name,
        accountNumber: row.account_number,
        createdAt: row.created_at,
    }));

    return { data: mappedData, error: null };
}

/**
 * Add a new bank account for a user
 */
export async function addBankAccount(
    userId: string,
    account: Omit<SavedBankAccount, "id" | "userId" | "createdAt">
): Promise<{ error: BankError | null }> {
    // Check limit first (up to 3)
    const { count, error: countError } = await supabase
        .from("bank_accounts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

    if (countError) {
        return { error: { message: countError.message } };
    }

    if (count !== null && count >= 3) {
        return { error: { message: "Maximum of 3 bank accounts allowed." } };
    }

    const { error } = await supabase.from("bank_accounts").insert({
        user_id: userId,
        bank_name: account.bankName,
        account_name: account.accountName,
        account_number: account.accountNumber,
    });

    return { error: error ? { message: error.message } : null };
}

/**
 * Delete a bank account
 */
export async function deleteBankAccount(id: string, userId: string): Promise<{ error: BankError | null }> {
    // Ensure the user owns the account they are deleting
    const { error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    return { error: error ? { message: error.message } : null };
}
