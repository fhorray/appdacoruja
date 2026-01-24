"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { getTransactionsAction } from "@/server/actions/finance-actions";
import { TransactionsClient } from "./transactions-client";

export default async function TransactionsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login");
    }

    // You could fetch initial filters here if user persisted preferences,
    // otherwise fetch recent transactions.
    const initialTransactions = await getTransactionsAction();

    return <TransactionsClient initialTransactions={initialTransactions} userId={session.user.id} />;
}
