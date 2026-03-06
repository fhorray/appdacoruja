"use client";

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CustomSheet } from '../custom-sheet';
import { Button } from '../ui/button';

interface TransactionFormModalProps {
  children?: React.ReactNode;
  initialData?: any;
  mode: 'create' | 'edit';
  userId: string;
}

export function TransactionFormModal({ children, initialData, mode, userId }: TransactionFormModalProps) {
  return (
    <CustomSheet
      title={mode === 'create' ? 'Nova Transação' : 'Editar Transação'}
      side="right"
      className="w-full sm:max-w-md overflow-y-auto"
      content={({ close }) => (
        <TransactionFormContent initialData={initialData} mode={mode} userId={userId} close={close} />
      )}
    >
      {children}
    </CustomSheet>
  );
}

function TransactionFormContent({ initialData, mode, userId, close }: { initialData: any, mode: 'create'|'edit', userId: string, close: () => void }) {
  const {
    categoriesQuery,
    responsiblePersonsQuery,
    createTransaction,
    updateTransaction,
    createCategory,
    createResponsiblePerson
  } = useFinance(userId);

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    type: initialData?.type || 'expense',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : getLocalDateString(),
    amount: initialData?.amount ? String(initialData.amount) : '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    status: initialData?.status || 'paid',
    paymentMethod: initialData?.paymentMethod || '',
    responsible: initialData?.responsible || '',
    location: initialData?.location || '',
    isRecurrent: initialData?.isRecurrent || false,
    recurrenceType: initialData?.recurrenceType || 'single',
    recurrenceMonths: '',
  });

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewResponsavel, setShowNewResponsavel] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newResponsavelName, setNewResponsavelName] = useState('');

  const STATUS_OPTIONS = [
    { label: 'Pago', value: 'paid' },
    { label: 'Em Aberto', value: 'pending' }
  ];

  const filteredCategories = categoriesQuery.data?.filter(
    c => c.type === formData.type && c.isActive
  ) || [];

  const activeResponsiblePersons = responsiblePersonsQuery.data?.filter(
    r => r.isActive
  ) || [];

  async function handleAddCategory() {
    if (!newCategoryName.trim() || !userId) return;
    try {
      await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        type: formData.type as 'expense' | 'income',
        userId: userId,
        isActive: true
      });
      setFormData({ ...formData, category: newCategoryName.trim() });
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch {
      alert('Erro ao adicionar categoria.');
    }
  }

  async function handleAddResponsavel() {
    if (!newResponsavelName.trim() || !userId) return;
    try {
      await createResponsiblePerson.mutateAsync({
        name: newResponsavelName.trim(),
        userId: userId,
        isActive: true
      });
      setFormData({ ...formData, responsible: newResponsavelName.trim() });
      setNewResponsavelName('');
      setShowNewResponsavel(false);
    } catch {
      alert('Erro ao adicionar responsável.');
    }
  }

  async function handleSubmit() {
    if (!userId || !formData.amount || !formData.description || !formData.category) return;

    try {
      const [yearStr, monthStr] = formData.date.split('-');
      const year = parseInt(yearStr);
      const monthLabel = `${yearStr}-${monthStr}`;

      const baseTransactionData = {
        type: formData.type,
        amount: formData.amount,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        paymentMethod: formData.paymentMethod || null,
        responsible: formData.responsible || null,
        location: formData.location || null,
        isRecurrent: formData.isRecurrent,
        recurrenceType: formData.isRecurrent ? formData.recurrenceType : 'single',
        date: new Date(formData.date),
        month: monthLabel,
        year: year,
        userId: userId,
      };

      if (mode === 'create') {
        await createTransaction.mutateAsync(baseTransactionData as any);
      } else {
        await updateTransaction.mutateAsync({
          id: formData.id,
          ...baseTransactionData
        } as any);
      }
      close();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Erro ao salvar transação');
    }
  }

  const isSaving = createTransaction.isPending || updateTransaction.isPending;

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Button
          type="button"
          variant={formData.type === 'expense' ? 'default' : 'outline'}
          onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
          className={formData.type === 'expense' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
        >
          Despesa
        </Button>
        <Button
          type="button"
          variant={formData.type === 'income' ? 'default' : 'outline'}
          onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
          className={formData.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
        >
          Receita
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label>Valor *</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="text-lg"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Descrição *</Label>
        <Input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Categoria *</Label>
        <Select 
          value={formData.category} 
          onValueChange={(v) => {
            if (v === '__new__') setShowNewCategory(true);
            else setFormData({ ...formData, category: v });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            <SelectItem value="__new__">+ Nova Categoria</SelectItem>
          </SelectContent>
        </Select>
        {showNewCategory && (
          <div className="mt-2 flex gap-2 animate-in fade-in zoom-in-95">
            <Input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nome"
              className="flex-1"
            />
            <Button type="button" onClick={handleAddCategory} className="bg-emerald-600 hover:bg-emerald-700 text-white">OK</Button>
            <Button type="button" variant="outline" onClick={() => setShowNewCategory(false)}>✕</Button>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Data *</Label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Status *</Label>
        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'expense' && (
        <div className="space-y-1.5">
          <Label>Responsável</Label>
          <Select 
            value={formData.responsible || 'none'} 
            onValueChange={(v) => {
              if (v === '__new__') setShowNewResponsavel(true);
              else setFormData({ ...formData, responsible: v === 'none' ? '' : v });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {activeResponsiblePersons.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
              <SelectItem value="__new__">+ Novo</SelectItem>
            </SelectContent>
          </Select>
          {showNewResponsavel && (
            <div className="mt-2 flex gap-2 animate-in fade-in zoom-in-95">
              <Input
                type="text"
                value={newResponsavelName}
                onChange={(e) => setNewResponsavelName(e.target.value)}
                placeholder="Nome"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddResponsavel} className="bg-emerald-600 hover:bg-emerald-700 text-white">OK</Button>
              <Button type="button" variant="outline" onClick={() => setShowNewResponsavel(false)}>✕</Button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-4 border-t">
        <Button type="button" variant="outline" onClick={close} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit} 
          disabled={isSaving || !formData.amount || !formData.description || !formData.category} 
          className="w-full sm:w-auto"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}
