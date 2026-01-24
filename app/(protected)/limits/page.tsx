"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { getCategoryLimitsAction } from "@/server/actions/finance-actions";
import { LimitsClient } from "./limits-client";


export default async function LimitsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login");
    }

    const limits = await getCategoryLimitsAction(session.user.id);
    return <LimitsClient initialLimits={limits} userId={session.user.id} />;
}
