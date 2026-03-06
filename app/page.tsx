import Link from "next/link";
import Image from "next/image";
import { ArrowRight, PieChart, Target, Zap, Shield, PiggyBank, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo-blue-flat.png" alt="App da Coruja" width={120} height={40} className="w-auto h-8" priority />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="ghost" className="hidden sm:inline-flex text-sm font-medium h-9">
                Entrar
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="h-9 px-4 rounded-full shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col relative z-10 pt-24 pb-16">
        
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-16 pb-20 md:pt-24 md:pb-32 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-8 border border-primary/20">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            O seu futuro financeiro
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.1]">
            Inteligência Financeira para <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Mentes Brilhantes.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance">
            Abandone as planilhas complexas. App da Coruja é a plataforma unificada que transforma seu planejamento financeiro de algo tedioso para uma experiência fluida e poderosa.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link href="/auth">
              <Button size="lg" className="rounded-full h-12 px-8 text-base shadow-lg shadow-primary/20 gap-2 w-full sm:w-auto">
                Acessar Plataforma <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="lg" className="rounded-full h-12 px-8 text-base w-full sm:w-auto">
                Conhecer Recursos
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Tudo que você precisa em um só lugar</h2>
            <p className="mt-4 text-muted-foreground">Construído para simplificar o controle e acelerar seus resultados.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <FeatureCard 
              icon={<Target className="w-6 h-6" />}
              title="Metas e Caixinhas"
              description="Separe seu dinheiro com propósito. Crie caixinhas para viagens, emergências e acompanhe o progresso."
              color="text-emerald-500"
              bg="bg-emerald-500/10"
            />
            
            <FeatureCard 
              icon={<PieChart className="w-6 h-6" />}
              title="Orçamento Inteligente"
              description="Defina limites por categoria e receba insights sobre seus gastos antes de estourar o orçamento."
              color="text-blue-500"
              bg="bg-blue-500/10"
            />

            <FeatureCard 
              icon={<PiggyBank className="w-6 h-6" />}
              title="Projetos Financeiros"
              description="Simule sua independência financeira e planeje projetos de longo prazo com projeção de rendimentos."
              color="text-amber-500"
              bg="bg-amber-500/10"
            />

            <FeatureCard 
              icon={<CreditCard className="w-6 h-6" />}
              title="Gestão de Cartões"
              description="Controle faturas, limites e transações parceladas. Uma visão completa antes da fatura fechar."
              color="text-indigo-500"
              bg="bg-indigo-500/10"
            />

            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Contas Fixas e Assinaturas"
              description="Nunca mais pague multas. Calendário inteligente que mostra exatamente o quanto da sua renda está comprometida."
              color="text-rose-500"
              bg="bg-rose-500/10"
            />

            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="Privacidade Absoluta"
              description="Seus dados são seus. Utilizamos tecnologias modernas para garantir máxima segurança das suas informações financeiras."
              color="text-slate-500"
              bg="bg-slate-500/10"
            />

          </div>
        </section>

        {/* Call to action */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full py-20 mt-10">
          <div className="rounded-3xl bg-gradient-to-b from-card to-background border shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
            
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight relative z-10 text-balance">
              Pronto para evoluir a forma como você lida com dinheiro?
            </h2>
            <p className="mt-4 text-muted-foreground relative z-10 max-w-xl mx-auto">
              Junte-se ao App da Coruja e assuma o controle hoje mesmo. Rápido, seguro e pensado para você.
            </p>
            <div className="mt-8 relative z-10">
               <Link href="/auth">
                <Button size="lg" className="rounded-full shadow-lg h-12 px-8">
                  Criar Conta Gratuita <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
               </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-border mt-auto relative z-10 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-2">
             <Image src="/icon.png" alt="Icon" width={24} height={24} className="opacity-50 grayscale" />
             <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} App da Coruja. Todos os direitos reservados.</p>
           </div>
           <div className="flex gap-4 text-sm font-medium text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Termos</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Suporte</Link>
           </div>
        </div>
      </footer>

    </div>
  );
}

function FeatureCard({ icon, title, description, color, bg }: { icon: React.ReactNode, title: string, description: string, color: string, bg: string }) {
  return (
    <div className="group relative bg-card border border-border/50 rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-border overflow-hidden">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bg} ${color}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/5 rounded-2xl transition-colors pointer-events-none" />
    </div>
  );
}
