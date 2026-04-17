"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useForm } from '@/hooks/use-form';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { resetPassword } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const form = useForm({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        onSubmit: async ({ value }) => {
            if (value.password !== value.confirmPassword) {
                setError('As senhas não coincidem.');
                return;
            }

            setError('');
            setLoading(true);

            await resetPassword({
                newPassword: value.password,
            }, {
                onError: (ctx) => {
                    setError(ctx.error.message || 'Erro ao redefinir senha. Link pode estar expirado.');
                    setLoading(false);
                },
                onSuccess: () => {
                    setSuccess(true);
                    setLoading(false);
                    toast.success('Senha redefinida com sucesso!');
                    setTimeout(() => router.push('/auth'), 3000);
                }
            });
        }
    });

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black relative overflow-hidden">
                <Card className="w-full max-w-md animate-in zoom-in-95 duration-500 text-center py-12 border-primary/20 bg-primary/5 relative z-10">
                    <CardContent>
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-4">Senha redefinida!</h1>
                        <p className="text-muted-foreground mb-8">Sua senha foi alterada com sucesso. Você será redirecionado para o login em instantes...</p>
                        <Button onClick={() => router.push('/auth')} className="w-full h-12 text-lg">
                            Ir para Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 13 50 13s16.36 2.347 25.96 5.937l1.768.661c.368.138.73.272 1.088.402H100V0H0v20h21.184z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
            
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-[500px] bg-background rounded-[32px] overflow-hidden border border-border/60 relative z-10 shadow-2xl p-8 sm:p-12">
                <div className="mb-10 text-center">
                    <div className="flex justify-center mb-8">
                        <Image src="/logo-blue.png" alt="App da Coruja" width={80} height={80} />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">Nova senha</h2>
                    <p className="text-muted-foreground text-[15px]">Crie uma senha forte para proteger sua conta.</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-destructive/5 border border-destructive/10 text-destructive rounded-2xl flex items-start gap-3 animate-in fade-in duration-300">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }} 
                    className="space-y-5"
                >
                    <form.AppField
                        name="password"
                        children={(field) => (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Nova Senha</label>
                                <field.InputField
                                    type="password"
                                    icon={Lock}
                                    placeholder="••••••••"
                                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                                    required
                                />
                            </div>
                        )}
                    />

                    <form.AppField
                        name="confirmPassword"
                        children={(field) => (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Confirmar Nova Senha</label>
                                <field.InputField
                                    type="password"
                                    icon={Lock}
                                    placeholder="••••••••"
                                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                                    required
                                />
                            </div>
                        )}
                    />

                    <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-bold mt-8 rounded-xl transition-all active:scale-[0.98] bg-[#003153] hover:bg-[#002540] text-white"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Redefinir Senha'
                        )}
                    </Button>
                </form>

                <p className="mt-10 text-center text-[13px]">
                    <button
                        type="button"
                        onClick={() => router.push('/auth')}
                        className="text-muted-foreground hover:text-primary transition-all underline"
                    >
                        Voltar para login
                    </button>
                </p>
            </div>
        </div>
    );
}
