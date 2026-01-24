"use client";

import { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

export function SettingsClient({ user }: { user: any }) {
    const router = useRouter();
    const handleLogout = async () => {
        await authClient.signOut();
        router.push('/');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-gray-100 rounded-full">
                        <User className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-gray-500">{user.email}</p>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair da conta
                    </button>
                </div>
            </div>
        </div>
    );
}
