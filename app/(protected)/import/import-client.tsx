"use client";

import { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { useFinance } from '@/hooks/use-finance';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

export function ImportClient({ userId }: { userId: string }) {
    const router = useRouter();
    const { createTransaction } = useFinance(userId);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState({
        date: '',
        description: '',
        value: '',
        category: '',
        type: '' // Optional or auto-detect
    });
    const [importing, setImporting] = useState(false);
    const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Preview/Confirm

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    setHeaders(results.meta.fields || []);
                    setCsvData(results.data);
                    setStep(2);
                },
                skipEmptyLines: true,
            });
        }
    };

    const handleImport = async () => {
        setImporting(true);
        let successCount = 0;
        let errorCount = 0;

        for (const row of csvData) {
            try {
                // Basic parsing logic
                const dateVal = row[mapping.date];
                const descVal = row[mapping.description];
                const valueVal = row[mapping.value];
                const catVal = row[mapping.category] || 'Outros';

                // Attempt to parse value
                // Allow comma or dot decimal
                let amount = parseFloat(valueVal?.replace(',', '.') || '0');
                if (isNaN(amount)) amount = 0;

                // Determine type if mapping not provided or auto logic
                // If amount < 0, maybe expense? Or mapping.type column?
                // Assuming simple logic: negative is expense, positive is income unless specified
                let type = 'expense';
                if (mapping.type && row[mapping.type]) {
                    const t = row[mapping.type].toLowerCase();
                    if (t === 'receita' || t === 'income' || t === 'crédito') type = 'income';
                } else {
                    if (amount < 0) {
                        type = 'expense';
                        amount = Math.abs(amount);
                    } else {
                        type = 'income'; // default positive to income? Or expense? Usually bank statement + is income, - is expense.
                    }
                }

                // Parse Date: assume YYYY-MM-DD or DD/MM/YYYY
                let dateObj = new Date();
                if (dateVal.includes('/')) {
                    const parts = dateVal.split('/');
                    if (parts.length === 3) dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                } else {
                    dateObj = new Date(dateVal);
                }
                if (isNaN(dateObj.getTime())) dateObj = new Date(); // Fallback

                const year = dateObj.getFullYear();
                const month = `${year}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

                await createTransaction.mutateAsync({
                    date: dateObj,
                    description: descVal,
                    amount: String(amount),
                    category: catVal,
                    type: type as 'expense' | 'income',
                    status: 'paid', // Imported transactions usually paid
                    month,
                    year,
                    userId
                });
                successCount++;
            } catch (e) {
                console.error(e);
                errorCount++;
            }
        }

        setImporting(false);
        alert(`Importação concluída! ${successCount} sucessos, ${errorCount} erros.`);
        router.push('/');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                    <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Importar Transações</h2>
            </div>

            {step === 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <FileText className="w-16 h-16 text-gray-300" />
                        <h3 className="text-xl font-semibold text-gray-900">Selecione seu arquivo CSV</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Faça upload do extrato bancário ou planilha para importar suas transações automaticamente.
                        </p>
                        <label className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all cursor-pointer font-medium">
                            Escolher Arquivo
                            <Input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                        </label>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Mapear Colunas</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Coluna Data</label>
                                <select className="w-full border rounded p-2" onChange={e => setMapping({ ...mapping, date: e.target.value })}>
                                    <option value="">Selecione</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Coluna Descrição</label>
                                <select className="w-full border rounded p-2" onChange={e => setMapping({ ...mapping, description: e.target.value })}>
                                    <option value="">Selecione</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Coluna Valor</label>
                                <select className="w-full border rounded p-2" onChange={e => setMapping({ ...mapping, value: e.target.value })}>
                                    <option value="">Selecione</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Coluna Categoria (Opcional)</label>
                                <select className="w-full border rounded p-2" onChange={e => setMapping({ ...mapping, category: e.target.value })}>
                                    <option value="">Selecione (Usa 'Outros' se vazio)</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleImport}
                            disabled={importing || !mapping.date || !mapping.value}
                            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                            {importing ? 'Importando...' : 'Confirmar Importação'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
