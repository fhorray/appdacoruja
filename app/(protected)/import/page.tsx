"use client";

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import Papa from 'papaparse';
import { useFinance } from '@/hooks/use-finance';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';

export default function ImportPage() {
    const { user } = useAuth();
    const userId = user?.id as string;
    const router = useRouter();
    const { createTransaction } = useFinance(userId || "");

    const [isDragging, setIsDragging] = useState(false);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState({
        date: '',
        description: '',
        value: '',
        category: '',
        type: '' 
    });
    const [importing, setImporting] = useState(false);
    const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Done

    const onFileLoad = (file: File) => {
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                setHeaders(results.meta.fields || []);
                setCsvData(results.data);
                setStep(2);
            },
            skipEmptyLines: true,
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileLoad(file);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === "text/csv") {
            onFileLoad(file);
        } else {
            alert("Por favor, selecione um arquivo formato CSV.");
        }
    }, []);

    const handleImport = async () => {
        if (!userId) return;
        setImporting(true);
        let successCount = 0;
        let errorCount = 0;

        for (const row of csvData) {
            try {
                const dateVal = row[mapping.date];
                const descVal = row[mapping.description];
                const valueVal = row[mapping.value];
                const catVal = row[mapping.category] || 'Outros';

                let amount = parseFloat(valueVal?.replace(',', '.') || '0');
                if (isNaN(amount)) amount = 0;

                let type = 'expense';
                if (mapping.type && row[mapping.type]) {
                    const t = row[mapping.type].toLowerCase();
                    if (t === 'receita' || t === 'income' || t === 'crédito') type = 'income';
                } else {
                    if (amount < 0) {
                        type = 'expense';
                        amount = Math.abs(amount);
                    } else {
                        type = 'income'; 
                    }
                }

                let dateObj = new Date();
                if (dateVal && dateVal.includes('/')) {
                    const parts = dateVal.split('/');
                    if (parts.length === 3) dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                } else if (dateVal) {
                    dateObj = new Date(dateVal);
                }
                if (isNaN(dateObj.getTime())) dateObj = new Date(); 

                const year = dateObj.getFullYear();
                const month = `${year}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

                await createTransaction.mutateAsync({
                    date: dateObj,
                    description: descVal,
                    amount: String(amount),
                    category: catVal,
                    type: type as 'expense' | 'income',
                    status: 'paid',
                    month,
                    year,
                    userId
                } as any);
                successCount++;
            } catch (e) {
                console.error(e);
                errorCount++;
            }
        }

        setImporting(false);
        setStep(3);
        setTimeout(() => {
            router.push('/transactions');
        }, 3000);
    };

    const StepIndicator = ({ num, title, current }: { num: number, title: string, current: boolean }) => (
        <div className={`flex items-center gap-2 ${step >= num ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm transition-colors ${step >= num ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                {step > num ? <CheckCircle2 className="w-5 h-5 text-primary-foreground" /> : num}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${current ? 'text-foreground' : ''}`}>{title}</span>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500 max-w-4xl">
            <PageHeader 
                title="Importar Transações" 
                description="Automatize o registro fazendo upload do extrato bancário (CSV)"
            />

            <div className="flex items-center justify-center gap-2 sm:gap-4 py-4 mb-4">
                <StepIndicator num={1} title="Upload CSV" current={step === 1} />
                <div className={`h-1 w-8 sm:w-16 rounded transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                <StepIndicator num={2} title="Mapear Colunas" current={step === 2} />
                <div className={`h-1 w-8 sm:w-16 rounded transition-colors ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
                <StepIndicator num={3} title="Concluído" current={step === 3} />
            </div>

            {step === 1 && (
                <Card 
                    className={`border-2 border-dashed transition-all ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-primary/20' : 'bg-primary/10'}`}>
                            <Upload className={`w-10 h-10 ${isDragging ? 'text-primary' : 'text-primary'}`} />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            Arraste e solte seu arquivo CSV aqui
                        </h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Ou clique no botão abaixo para selecionar um arquivo do seu computador.
                        </p>
                        <Label htmlFor="csv-upload" className="cursor-pointer">
                            <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                Escolher Arquivo CSV
                            </span>
                            <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                        </Label>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <Card className="animate-in slide-in-from-bottom-4 duration-300">
                    <CardHeader>
                        <CardTitle>Mapear Colunas do Arquivo</CardTitle>
                        <CardDescription>
                            Associe as colunas do seu arquivo CSV com os campos usados no aplicativo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Data *</Label>
                                <Select value={mapping.date} onValueChange={(v) => setMapping(m => ({ ...m, date: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a coluna de Data" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Descrição *</Label>
                                <Select value={mapping.description} onValueChange={(v) => setMapping(m => ({ ...m, description: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a coluna de Descrição" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Valor *</Label>
                                <Select value={mapping.value} onValueChange={(v) => setMapping(m => ({ ...m, value: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a coluna de Valor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Categoria <span className="text-muted-foreground font-normal">(Opcional)</span></Label>
                                <Select value={mapping.category || 'none'} onValueChange={(v) => setMapping(m => ({ ...m, category: v === 'none' ? '' : v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Usa 'Outros' se vazio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Usa 'Outros' por padrão</SelectItem>
                                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6 mt-2">
                        <Button variant="outline" onClick={() => setStep(1)} disabled={importing}>
                            Voltar
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={importing || !mapping.date || !mapping.description || !mapping.value}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {importing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Importando ({csvData.length} registros)...
                                </>
                            ) : (
                                <>
                                    Importar Transações
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 3 && (
                <Card className="border-emerald-200 bg-emerald-50 content-center text-center py-12 dark:bg-emerald-950/20 dark:border-emerald-900/50 animate-in zoom-in-95 duration-500">
                    <CardContent>
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Importação Concluída!</h3>
                        <p className="text-emerald-700 dark:text-emerald-400">
                            Suas transações foram importadas com sucesso. Redirecionando...
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
