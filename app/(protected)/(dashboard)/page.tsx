"use server";

import { getDashboardDataAction } from "@/server/actions/finance-actions";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
    const dashboardData = await getDashboardDataAction();
    return <DashboardClient initialData={dashboardData} />;
}
