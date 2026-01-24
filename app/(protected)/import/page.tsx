"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { ImportClient } from "./import-client";

export default async function ImportPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login");
    }

    return <ImportClient userId={session.user.id} />;
}
