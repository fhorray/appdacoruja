"use client";

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { authClient } from '@/lib/auth/client';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { suggestCategory } from '@/lib/category-suggestions';
import { useCreditCards } from '@/hooks/use-credit-cards';

interface QuickAddModalProps {
  onClose: () => void;
  onSave: () => void;
}

export function QuickAddModal({ onClose, onSave }: QuickAddModalProps) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const {
    categoriesQuery,
    responsiblePersonsQuery,
    createTransaction,
    createCategory,
    createResponsiblePerson
  } = useFinance(userId || "");

  const { creditCardsQuery } = useCreditCards();
  const activeCards = creditCardsQuery.data?.filter(c => c.isActive) || [];

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    type: 'expense' as 'expense' | 'income',
    date: getLocalDateString(),
    amount: '',
    description: '',
    category: '',
    status: 'paid', // 'paid' | 'pending' -> mapped from 'Pago' | 'Em Aberto'
    paymentMethod: '',
    creditCardId: '',
    responsible: '',
    location: '',
    isRecurrent: false,
    recurrenceType: 'single' as 'single' | 'monthly_until_december',
    recurrenceMonths: '',
  });

  const onDescriptionChange = (desc: string) => {
    const suggested = suggestCategory(desc);
    setFormData(prev => ({
      ...prev,
      description: desc,
      category: (desc.length > 2 && suggested) ? suggested : prev.category
    }));
  };

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewResponsavel, setShowNewResponsavel] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newResponsavelName, setNewResponsavelName] = useState('');

  const PAYMENT_METHODS = [
    { id: 'money', label: 'Dinheiro' },
    { id: 'debit_card', label: 'Cartão de Débito' },
    { id: 'credit_card', label: 'Cartão de Crédito' },
    { id: 'pix', label: 'Pix' },
    { id: 'bank_transfer', label: 'Transferência Bancária' },
    { id: 'bank_slip', label: 'Boleto' },
    { id: 'other', label: 'Outro' }
  ];
  const STATUS_OPTIONS = [
    { label: 'Pago', value: 'paid' },
    { label: 'Em Aberto', value: 'pending' }
  ];

  // Filter categories by type
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
        type: formData.type,
        userId: userId,
        isActive: true
      });

      setFormData({ ...formData, category: newCategoryName.trim() });
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (error) {
      alert('Erro ao adicionar categoria. Ela pode já existir.');
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
    } catch (error) {
      alert('Erro ao adicionar responsável. Ele pode já existir.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      alert('Você precisa estar logado para adicionar transações.');
      return;
    }

    try {
      const [yearStr, monthStr, dayStr] = formData.date.split('-');
      const year = parseInt(yearStr);
      const month = String(parseInt(monthStr)).padStart(2, '0'); // ensure 2 digits
      const monthLabel = `${year}-${month}`; // matches YYYY-MM format used in original

      const baseTransactionData = {
        type: formData.type,
        amount: Number(formData.amount), // cast to number for InsertTransaction type
        description: formData.description,
        category: formData.category,
        status: formData.status,
        paymentMethod: formData.paymentMethod || null,
        creditCardId: formData.paymentMethod === 'credit_card' && formData.creditCardId ? formData.creditCardId : null,
        responsible: formData.responsible || null,
        location: formData.location || null,
        isRecurrent: formData.isRecurrent,
        recurrenceType: formData.isRecurrent ? formData.recurrenceType : 'single',
        userId: userId,
      };

      if (formData.isRecurrent && formData.recurrenceType === 'monthly_until_december') {
        const recurrenceGroup = crypto.randomUUID();
        const numMonths = formData.recurrenceMonths ? parseInt(formData.recurrenceMonths) : null;

        let currentDate = new Date(year, parseInt(month) - 1, parseInt(dayStr));
        let monthCount = 0;
        const maxMonths = numMonths || (12 - parseInt(month) + 1);

        const promises = [];

        while (monthCount < maxMonths) {
          const currentYear = currentDate.getFullYear();
          // Break if auto-recurrence until Dec passes current year (unless specific num months provided)
          if (!numMonths && currentYear > year) break;

          const currentMonthVal = String(currentDate.getMonth() + 1).padStart(2, '0');
          const currentMonthLabel = `${currentYear}-${currentMonthVal}`;

          // Format date as YYYY-MM-DD
          const formattedDate = `${currentYear}-${currentMonthVal}-${String(currentDate.getDate()).padStart(2, '0')}`;

          promises.push(createTransaction.mutateAsync({
            ...baseTransactionData,
            date: new Date(formattedDate), // Actions expect Date object or string? Schema has timestamp("date"). Drizzle usually handles Date obj.
            month: currentMonthLabel,
            year: currentYear,
            recurrenceGroup: recurrenceGroup,
          }));

          // Next month
          currentDate.setMonth(currentDate.getMonth() + 1);
          monthCount++;
        }

        await Promise.all(promises);
      } else {
        await createTransaction.mutateAsync({
          ...baseTransactionData,
          date: new Date(formData.date),
          month: monthLabel,
          year: year,
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Erro ao salvar transação');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-md sm:rounded-md shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">Nova Transação</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`py-3 px-4 rounded-md font-medium transition-all shadow-sm ${formData.type === 'expense'
                ? 'bg-red-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow'
                }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`py-3 px-4 rounded-md font-medium transition-all shadow-sm ${formData.type === 'income'
                ? 'bg-green-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow'
                }`}
            >
              Receita
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="0,00"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Conta de luz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  setShowNewCategory(true);
                } else {
                  setFormData({ ...formData, category: e.target.value });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
              <option value="__new__">+ Nova Categoria</option>
            </select>
            {showNewCategory && (
              <div className="mt-2 flex gap-2">
                <Input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da nova categoria"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all text-sm font-medium shadow-sm hover:shadow"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(false)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all text-sm font-medium shadow-sm hover:shadow"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="checkbox"
                checked={formData.isRecurrent}
                onChange={(e) => setFormData({
                  ...formData,
                  isRecurrent: e.target.checked,
                  recurrenceType: e.target.checked ? 'monthly_until_december' : 'single',
                  recurrenceMonths: ''
                })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">
                {formData.type === 'expense' ? 'Despesa Recorrente' : 'Receita Recorrente'}
              </span>
            </label>
            {formData.isRecurrent && (
              <div className="mt-3 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Duração da recorrência
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.recurrenceMonths}
                    onChange={(e) => setFormData({ ...formData, recurrenceMonths: e.target.value })}
                    placeholder="Número de meses"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <span className="flex items-center text-sm text-gray-600">meses</span>
                </div>
                <p className="text-xs text-blue-700">
                  {formData.recurrenceMonths
                    ? `Esta transação será criada por ${formData.recurrenceMonths} ${parseInt(formData.recurrenceMonths) === 1 ? 'mês' : 'meses'}`
                    : `Deixe vazio para criar até dezembro de ${new Date().getFullYear()}`
                  }
                </p>
              </div>
            )}
          </div>

          {formData.type === 'expense' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meio de Pagamento
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== 'credit_card') {
                      setFormData({ ...formData, paymentMethod: val, creditCardId: '', status: 'paid' });
                    } else {
                      setFormData({ ...formData, paymentMethod: val, status: 'pending' });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  {PAYMENT_METHODS.map(method => (
                    <option key={method.id} value={method.id}>{method.label}</option>
                  ))}
                </select>
              </div>

              {formData.paymentMethod === 'credit_card' && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cartão de Crédito
                  </label>
                  <select
                    value={formData.creditCardId}
                    onChange={(e) => setFormData({ ...formData, creditCardId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione o cartão</option>
                    {activeCards.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável
                </label>
                <select
                  value={formData.responsible}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setShowNewResponsavel(true);
                    } else {
                      setFormData({ ...formData, responsible: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  {activeResponsiblePersons.map(resp => (
                    <option key={resp.id} value={resp.name}>{resp.name}</option>
                  ))}
                  <option value="__new__">+ Novo Responsável</option>
                </select>
                {showNewResponsavel && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      type="text"
                      value={newResponsavelName}
                      onChange={(e) => setNewResponsavelName(e.target.value)}
                      placeholder="Nome do novo responsável"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddResponsavel}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all text-sm font-medium shadow-sm hover:shadow"
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewResponsavel(false)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all text-sm font-medium shadow-sm hover:shadow"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all font-medium shadow-sm hover:shadow"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createTransaction.isPending}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {createTransaction.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
