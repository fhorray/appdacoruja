"use client";

import { useState } from 'react';
import { AlertCircle, CheckCircle2, User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from '@/hooks/use-form';

export default function AuthPage() {
    const router = useRouter();
    const { login, register } = useAuth();
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        onSubmit: async ({ value }) => {
            setError('');
            setLoading(true);

            if (mode === 'signup') {
                if (value.password !== value.confirmPassword) {
                    setError('As senhas não coincidem.');
                    setLoading(false);
                    return;
                }

                await register.email({
                    email: value.email,
                    password: value.password,
                    name: value.name,
                    callbackURL: '/dashboard',
                }, {
                    onError: (ctx) => {
                        setError(ctx.error.message || 'Erro ao criar conta.');
                        setLoading(false);
                    },
                    onSuccess: () => {
                        setSuccess(true);
                        setLoading(false);
                        toast.success('Conta criada com sucesso!');
                        setTimeout(() => router.push('/dashboard'), 2000);
                    },
                });
            } else {
                await login.email({
                    email: value.email,
                    password: value.password,
                    rememberMe: true,
                    callbackURL: '/dashboard',
                }, {
                    onError: (ctx) => {
                        if (ctx.error.message?.includes('Invalid login credentials')) {
                            setError('Email ou senha incorretos.');
                        } else {
                            setError(ctx.error.message || 'Erro ao fazer login.');
                        }
                        setLoading(false);
                    },
                    onSuccess: () => {
                        toast.success('Login realizado!');
                        setLoading(false);
                        router.push('/dashboard');
                    }
                });
            }
        },
    });

    const handleSocialAuth = async (provider: 'github' | 'google' | 'facebook') => {
        setError('');
        setLoading(true);
        try {
            await login.social({
                provider,
                callbackURL: '/dashboard',
            });
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError('Erro ao conectar com rede social.');
        }
    };

    if (success && mode === 'signup') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
                <Card className="w-full max-w-md animate-in zoom-in-95 duration-500 text-center py-12 border-primary/20 bg-primary/5">
                    <CardContent>
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-4">Conta criada!</h1>
                        <p className="text-muted-foreground mb-8">Você será redirecionado para o seu novo painel em instantes...</p>
                        <Button onClick={() => router.push('/dashboard')} className="w-full h-12 text-lg">
                            Acessar Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black relative overflow-hidden">
            {/* Subtle Wavy Pattern Overlay on Main Background */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 13 50 13s16.36 2.347 25.96 5.937l1.768.661c.368.138.73.272 1.088.402H100V0H0v20h21.184z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
            
            {/* Subtle Glow Effects on Main Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-[1000px] grid lg:grid-cols-2 gap-0 items-stretch bg-background rounded-[32px] overflow-hidden border border-border/60 relative z-10 shadow-2xl">
                
                {/* Left side Image or Brand Graphic - Hidden on small screens */}
                <div className="hidden lg:flex flex-col justify-center p-12 bg-[#003153] text-white h-auto relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="mb-10">
                           <Image 
                                src="/logo-blue.png" 
                                alt="App da Coruja" 
                                width={120} 
                                height={120} 
                                className="filter brightness-0 invert opacity-90"
                            />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
                            Finanças de forma <span className="text-white italic">simples.</span>
                        </h1>
                        <p className="text-blue-100/80 text-lg max-w-sm mb-10 leading-relaxed">
                            A plataforma definitiva para você retomar o controle total da sua vida financeira com inteligência.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-blue-50/90 text-sm font-medium">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                                Metas inteligentes e automáticas
                            </div>
                            <div className="flex items-center gap-3 text-blue-50/90 text-sm font-medium">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                                Relatórios visuais em tempo real
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side form */}
                <div className="p-8 sm:p-14 w-full flex flex-col justify-center">
                    <div className="lg:hidden mb-10 flex justify-center">
                        <Image src="/logo-blue.png" alt="App da Coruja" width={110} height={110} />
                    </div>

                    <div className="mb-10 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">
                            {mode === 'login' ? 'Boas-vindas' : 'Crie sua conta'}
                        </h2>
                        <p className="text-muted-foreground text-[15px]">
                            {mode === 'login' 
                                ? 'Acesse sua conta para gerenciar suas finanças.' 
                                : 'Comece agora sua jornada para a liberdade financeira.'}
                        </p>
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
                        className="space-y-5 animate-in slide-in-from-bottom-6 duration-700 fade-in"
                    >
                        {mode === 'signup' && (
                            <form.AppField
                                name="name"
                                children={(field) => (
                                    <field.InputField
                                        label="Nome completo"
                                        icon={User}
                                        placeholder="Seu nome"
                                        className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                                        required
                                    />
                                )}
                            />
                        )}

                        <form.AppField
                            name="email"
                            children={(field) => (
                                <field.InputField
                                    label="Email"
                                    type="email"
                                    icon={Mail}
                                    placeholder="seu@email.com"
                                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                                    required
                                />
                            )}
                        />

                        <form.AppField
                            name="password"
                            children={(field) => (
                                <div className="space-y-2">
                                     <div className="flex items-center justify-between ml-1">
                                        <label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Senha</label>
                                        {mode === 'login' && (
                                            <a href="#" className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity">
                                                Esqueceu?
                                            </a>
                                        )}
                                    </div>
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

                        {mode === 'signup' && (
                            <form.AppField
                                name="confirmPassword"
                                children={(field) => (
                                    <field.InputField
                                        label="Confirmar senha"
                                        type="password"
                                        icon={Lock}
                                        placeholder="••••••••"
                                        className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                                        required
                                    />
                                )}
                            />
                        )}

                        <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-bold mt-8 rounded-xl transition-all active:scale-[0.98] bg-[#003153] hover:bg-[#002540] text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : mode === 'login' ? (
                                <>Entrar <ArrowRight className="w-4 h-4 ml-2" /></>
                            ) : (
                                'Criar Minha Conta'
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/50"></div>
                        </div>
                        <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                            <span className="px-4 bg-background text-muted-foreground/60">Ou</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleSocialAuth('google')}
                            disabled={loading}
                            className="w-full h-12 font-bold border-none bg-muted/30 hover:bg-muted/50 rounded-xl transition-all active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </Button>
                    </div>

                    <p className="mt-10 text-center text-[13px] text-muted-foreground">
                        {mode === 'login' ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
                        <button
                            type="button"
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setError('');
                                setSuccess(false);
                                form.reset();
                            }}
                            className="text-primary font-bold hover:underline transition-all"
                        >
                            {mode === 'login' ? 'Começar gratuitamente' : 'Entrar agora'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
