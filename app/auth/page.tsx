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

export default function AuthPage() {
    const router = useRouter();
    const { login, register } = useAuth();
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (mode === 'signup') {
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                setLoading(false);
                return;
            }

            await register.email({
                email,
                password,
                name,
                callbackURL: '/',
            }, {
                onError: (ctx) => {
                    setError(ctx.error.message || 'Erro ao criar conta.');
                    setLoading(false);
                },
                onSuccess: () => {
                    setSuccess(true);
                    setLoading(false);
                    toast.success('Conta criada com sucesso!');
                    setTimeout(() => router.push('/'), 2000);
                },
            });
        } else {
            await login.email({
                email,
                password,
                rememberMe: true,
                callbackURL: '/',
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
                    router.push('/');
                }
            });
        }
    };

    const handleSocialAuth = async (provider: 'github' | 'google' | 'facebook') => {
        setError('');
        setLoading(true);
        try {
            await login.social({
                provider,
                callbackURL: '/',
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
                        <Button onClick={() => router.push('/')} className="w-full h-12 text-lg">
                            Acessar Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <div className="w-full max-w-[1000px] grid lg:grid-cols-2 gap-8 items-center bg-background rounded-3xl shadow-2xl overflow-hidden border">
                
                {/* Left side Image or Brand Graphic - Hidden on small screens */}
                <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-600 to-indigo-800 text-white h-full min-h-[600px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <Image src="/logo-white.png" alt="App da Coruja" width={180} height={180} className="mb-8 drop-shadow-lg filter brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Finanças Descomplicadas</h1>
                        <p className="text-blue-100 text-lg max-w-sm mb-8">
                            Junte-se a milhares de usuários e retome o controle da sua vida financeira com ferramentas poderosas e preditivas.
                        </p>
                        
                        <div className="flex items-center gap-4 text-blue-200 text-sm font-medium">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Metas inteligentes
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-4" /> Relatórios visuais
                        </div>
                    </div>
                </div>

                {/* Right side form */}
                <div className="p-8 sm:p-12 w-full max-w-md mx-auto">
                    <div className="lg:hidden mb-8 flex justify-center">
                        <Image src="/logo-blue.png" alt="App da Coruja" width={120} height={120} />
                    </div>

                    <div className="text-center sm:text-left mb-8 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                            {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                        </h2>
                        <p className="text-muted-foreground">
                            {mode === 'login' 
                                ? 'Insira suas credenciais para acessar sua conta.' 
                                : 'Preencha os dados abaixo para começar gratuitamente.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-bottom-6 duration-700 fade-in">
                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="name" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)}
                                        className="pl-10 h-11" 
                                        placeholder="João da Silva" 
                                        required 
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)}
                                    className="pl-10 h-11" 
                                    placeholder="seu@email.com" 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                {mode === 'login' && (
                                    <a href="#" className="text-sm font-medium text-primary hover:underline">
                                        Esqueceu a senha?
                                    </a>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="password" 
                                    type="password" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)}
                                    className="pl-10 h-11" 
                                    placeholder="••••••••" 
                                    required 
                                />
                            </div>
                        </div>

                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="confirmPassword" 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="pl-10 h-11" 
                                        placeholder="••••••••" 
                                        required 
                                    />
                                </div>
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full h-11 text-base font-semibold mt-6 shadow-md hover:shadow-lg transition-all"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : mode === 'login' ? (
                                <>Entrar <ArrowRight className="w-4 h-4 ml-2" /></>
                            ) : (
                                'Criar Conta'
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-background text-muted-foreground">Ou continue com</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleSocialAuth('google')}
                            disabled={loading}
                            className="w-full h-11 font-medium bg-background hover:bg-muted"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </Button>
                    </div>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        {mode === 'login' ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
                        <button
                            type="button"
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setError('');
                                setSuccess(false);
                                setPassword('');
                                setConfirmPassword('');
                            }}
                            className="text-primary hover:text-primary/80 font-semibold transition-colors focus:outline-none focus:underline"
                        >
                            {mode === 'login' ? 'Criar conta gratuitamente' : 'Entrar na sua conta'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
