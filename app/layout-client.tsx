"use client";

import { useState } from 'react';
import { Home, Receipt, TrendingUp, Target, Upload, Settings, Menu, X, Plus, PiggyBank, Shield, CreditCard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { QuickAddModal } from '@/components/finance/quick-add-modal';
import Image from 'next/image';

interface LayoutClientProps {
  children: React.ReactNode;
}

export function LayoutClient({ children }: LayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Check if admin - we'll assume role is on user object if we added it to schema/auth
  // But better-auth might put it on session.user.role if configured.
  // For now let's assume session.user exists.
  const isAdmin = (user as any)?.role === 'admin';

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/');
  };

  const navigation = [
    { name: 'Dashboard', icon: Home, page: 'dashboard', href: '/' },
    { name: 'Transações', icon: Receipt, page: 'transactions', href: '/transactions' },
    { name: 'Balanço Anual', icon: TrendingUp, page: 'annual', href: '/annual' },
    { name: 'Investimentos', icon: PiggyBank, page: 'investments', href: '/investments' },
    { name: 'Limites', icon: Target, page: 'limits', href: '/limits' },
    { name: 'Importação', icon: Upload, page: 'import', href: '/import' },
    { name: 'Configurações', icon: Settings, page: 'settings', href: '/settings' },
    { name: 'Planos', icon: CreditCard, page: 'planos', href: '/plans' },
    // Only show Admin if user is admin
    ...(isAdmin ? [{ name: 'Admin', icon: Shield, page: 'admin', href: '/admin' }] : []),
  ];

  // Helper to check active state
  // simple check: if href is /, active if pathname starts with /dashboard
  // strict check for /
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">

      {/* Header */}
      {pathname !== "/auth" &&
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Image
                    src="/logo-blue.png"
                    alt="App da Coruja"
                    width={90}
                    height={90}
                    className="w-auto cursor-pointer"
                  />

                </Link>
              </div>

              <div className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        active
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-2 space-y-1">
                {/* Removed SubscriptionStatus as payments were removed */}

                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                        active
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}

                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>
      }
      <main className="h-screen w-full mx-auto">
        {children}
      </main>

      {/* Floating Action Button for Quick Add */}
      {user && (
        <button
          onClick={() => setShowQuickAdd(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 group"
          aria-label="Adicionar transação"
        >
          <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* QuickAddModal would go here controlled by showQuickAdd */}
      {showQuickAdd && (
        <QuickAddModal
          onClose={() => setShowQuickAdd(false)}
          onSave={() => {
            setShowQuickAdd(false);
            router.refresh(); // Refresh data
          }}
        />
      )}
    </div>
  );
}
