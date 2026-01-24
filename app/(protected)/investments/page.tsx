"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { getRetirementConfigAction, getFinancialProjectsAction } from "@/server/actions/investment-actions";
import { getTransactionsAction } from "@/server/actions/finance-actions";
import { InvestmentsClient } from "./investments-client";

export default async function InvestmentsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login");
    }

    const [config, projects, transactions] = await Promise.all([
        getRetirementConfigAction(session.user.id),
        getFinancialProjectsAction(session.user.id),
        getTransactionsAction() // All txs to filter investments
    ]);

    return <InvestmentsClient 
        initialConfig={config} 
        initialProjects={projects} 
        initialTransactions={transactions}
        userId={session.user.id} 
    />;
}
