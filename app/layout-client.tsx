"use client";

import { Home, Receipt, TrendingUp, Target, Upload, Settings, Menu, Plus, PiggyBank, Shield, LogOut, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { CustomSheet } from '@/components/custom-sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
import Image from 'next/image';

interface LayoutClientProps {
  children: React.ReactNode;
}

const mainNav = [
  { name: 'Dashboard', icon: Home, href: '/' },
  { name: 'Transações', icon: Receipt, href: '/transactions' },
  { name: 'Investimentos', icon: PiggyBank, href: '/investments' },
  { name: 'Limites', icon: Target, href: '/limits' },
];

const secondaryNav = [
  { name: 'Importação', icon: Upload, href: '/import' },
  { name: 'Configurações', icon: Settings, href: '/settings' },
];

const AppSidebar = ({ user, handleLogout, pathname }: { user: any, handleLogout: () => void, pathname: string }) => {
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <Sidebar className="border-r hidden md:flex z-20">
      <SidebarHeader className="p-4 md:p-6 flex items-center justify-center border-b">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image src="/logo-blue.png" alt="App da Coruja" width={110} height={110} className="w-auto" priority />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active} 
                      tooltip={item.name}
                      className={cn("py-5", active && "text-primary bg-primary/5 font-semibold relative")}
                    >
                      <Link href={item.href}>
                        {active && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-md" />
                        )}
                        <Icon className={cn("!size-5", active ? "text-primary" : "text-muted-foreground")} />
                        <span className="ml-2 text-sm">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider mb-1">Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active} 
                      tooltip={item.name}
                      className="py-5"
                    >
                      <Link href={item.href}>
                        <Icon className="!size-5" />
                        <span className="ml-2 text-sm">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t bg-background shrink-0">
        {user && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-9 w-9 border shrink-0">
                <AvatarImage src={user.image || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm font-medium truncate">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/');
  };

  const isAuthPage = pathname === "/auth";

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  // For mobile bottom bar (max 4 items + "Menu")
  const mobileNav = mainNav.slice(0, 3);
  const mobileMoreNav = [
    mainNav[3], // Limites
    ...secondaryNav
  ];

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen bg-slate-50 dark:bg-background overflow-hidden relative">
        <AppSidebar user={user} handleLogout={handleLogout} pathname={pathname} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0 scroll-smooth bg-slate-50 dark:bg-background">
          <div className="container mx-auto max-w-7xl pt-4 md:pt-8 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", active && "stroke-[2.5px]")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          <CustomSheet
            title="Menu Adicional"
            side="bottom"
            className="h-[85vh] rounded-t-xl"
            content={({ close }) => (
              <div className="flex flex-col gap-6 py-2">
                
                {user && (
                  <div className="flex items-center gap-3 mb-2 bg-muted/30 p-4 rounded-xl">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={user.image || ''} />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  {mobileMoreNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                          <Icon className="w-5 h-5" />
                        </div>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                <Separator />

                <button
                  onClick={() => {
                    close();
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                >
                  <div className="bg-destructive/10 p-2 rounded-lg text-destructive">
                    <LogOut className="w-5 h-5" />
                  </div>
                  Sair com segurança
                </button>
              </div>
            )}
          >
            <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium">Mais</span>
            </button>
          </CustomSheet>
        </div>
      </div>
    </div>
    </SidebarProvider>
  );
}
