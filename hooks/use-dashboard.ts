import { useQuery } from "@tanstack/react-query";
import { getDashboardDataAction, DashboardData } from "@/server/actions/finance-actions";

export function useDashboardData() {
    return useQuery<DashboardData>({
        queryKey: ['dashboard-data'],
        queryFn: async () => {
            const data = await getDashboardDataAction();
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
