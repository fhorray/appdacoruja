"use client";

import { useState } from 'react';
import { User, LogOut, KeyRound, Save, Mail } from 'lucide-react';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';

export default function SettingsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const currentUser = user;

    const [name, setName] = useState(currentUser?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const handleLogout = async () => {
        await authClient.signOut();
        router.push('/');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            await authClient.updateUser({
                name
            });
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar perfil.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingPassword(true);
        try {
            await authClient.changePassword({
                newPassword,
                currentPassword,
                revokeOtherSessions: true
            });
            alert('Senha atualizada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar senha. Verifique sua senha atual.');
        } finally {
            setIsSavingPassword(false);
        }
    };

    // Get initials for avatar
    const getInitials = (userName: string | null | undefined) => {
        if (!userName) return 'U';
        return userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (!currentUser) {
        return <LoadingScreen />;
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500 max-w-4xl">
            <PageHeader 
                title="Configurações" 
                description="Gerencie as configurações da sua conta e perfil"
            />

            <div className="grid gap-6">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Perfil</CardTitle>
                        <CardDescription>
                            Atualize seu nome de exibição e imagem de perfil.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20">
                                    {currentUser.image && <AvatarImage src={currentUser.image} alt={currentUser.name} />}
                                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                        {getInitials(currentUser.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-foreground">Sua foto de perfil</h4>
                                    <p className="text-sm text-muted-foreground">Será exibida na navegação do aplicativo.</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 max-w-sm">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome completo</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            className="pl-9"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            className="pl-9 bg-muted/50"
                                            value={currentUser.email}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">O endereço de email não pode ser alterado.</p>
                                </div>
                            </div>
                            
                            <Button type="submit" disabled={isSavingProfile || !name || name === currentUser.name}>
                                {isSavingProfile ? 'Salvando...' : 'Salvar alterações'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Account Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Segurança da Conta</CardTitle>
                        <CardDescription>
                            Atualize sua senha para manter sua conta segura.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Senha atual</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        className="pl-9"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nova senha</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        className="pl-9"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>
                            
                            <Button type="submit" className="mt-2" disabled={isSavingPassword || !currentPassword || !newPassword}>
                                {isSavingPassword ? 'Atualizando...' : 'Atualizar senha'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20">
                    <CardHeader>
                        <CardTitle className="text-red-600 dark:text-red-400">Sessão</CardTitle>
                        <CardDescription className="text-red-600/80 dark:text-red-400/80">
                            Encerre sua sessão de forma segura
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            variant="destructive"
                            onClick={handleLogout}
                            className="w-full sm:w-auto"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sair da conta
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
