import { useState } from 'react';
import { useBudgets, useCategoriesWithoutBudgets } from '../hooks/useCategories';
import { useBudgetStatus } from '../hooks/useStats';
import Card from '../components/Card';
import CurrencyDisplay from '../components/CurrencyDisplay';

export default function Budgets() {
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
  const categoriesWithoutBudgets = useCategoriesWithoutBudgets();
  const budgetStatus = useBudgetStatus();

  const [formData, setFormData] = useState({
    categoryId: categoriesWithoutBudgets[0]?.id || '',
    limitAmount: '',
    period: 'monthly' as 'monthly' | 'weekly',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const limitAmount = parseInt(formData.limitAmount, 10);
      if (isNaN(limitAmount) || limitAmount <= 0) throw new Error('El limite debe ser un numero positivo');

      if (editingId) {
        updateBudget(editingId, { limitAmount, period: formData.period });
        setEditingId(null);
      } else {
        if (!formData.categoryId) throw new Error('Debes seleccionar una categoria');
        addBudget({ categoryId: formData.categoryId, limitAmount, period: formData.period });
      }

      setFormData({ categoryId: categoriesWithoutBudgets[0]?.id || '', limitAmount: '', period: 'monthly' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const budget = budgets.find((b) => b.id === id);
    if (budget) {
      setFormData({ categoryId: budget.categoryId, limitAmount: budget.limitAmount.toString(), period: budget.period });
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Estas seguro de que deseas eliminar este presupuesto?')) {
      deleteBudget(id);
    }
  };

  const periodLabels = { monthly: 'Mensual', weekly: 'Semanal' };

  return (
    <div className="page-budgets">
      <h1>Gestionar Presupuestos</h1>

      <Card title={editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleAddOrUpdate} className="form">
          <div className="form-row">
            <div className="form-group">
              <label>Categoria *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                disabled={editingId !== null}
                required
              >
                <option value="">-- Selecciona una categoria --</option>
                {categoriesWithoutBudgets.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Limite (COP) *</label>
              <input
                type="number"
                value={formData.limitAmount}
                onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })}
                placeholder="100000"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Periodo *</label>
            <select value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'weekly' })} required>
              <option value="monthly">Mensual</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setFormData({ categoryId: categoriesWithoutBudgets[0]?.id || '', limitAmount: '', period: 'monthly' }); }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card title={`Estado de Presupuestos (${budgetStatus.length})`} className="mt-4">
        {budgetStatus.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>No hay presupuestos creados</p>
        ) : (
          <div className="budget-list">
            {budgetStatus.map((budget) => (
              <div key={budget.budgetId} className={`budget-item ${budget.isOverBudget ? 'over-budget' : ''}`}>
                <div className="budget-header">
                  <div>
                    <h4>{budget.categoryIcon} {budget.categoryName}</h4>
                    <p className="text-small">{periodLabels[budget.period]}</p>
                  </div>
                  <span className={budget.isOverBudget ? 'badge-error' : 'badge-success'}>
                    {budget.percentageUsed.toFixed(0)}%
                  </span>
                </div>
                <div className="progress-bar large">
                  <div className={`progress-fill ${budget.isOverBudget ? 'error' : ''}`} style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}></div>
                </div>
                <div className="budget-details">
                  <div className="detail-row"><span>Gastado:</span><strong><CurrencyDisplay amount={budget.spent} /></strong></div>
                  <div className="detail-row"><span>Limite:</span><strong><CurrencyDisplay amount={budget.limitAmount} /></strong></div>
                  <div className={`detail-row ${budget.remaining >= 0 ? 'success' : 'error'}`}>
                    <span>Disponible:</span><strong><CurrencyDisplay amount={budget.remaining} /></strong>
                  </div>
                </div>
                <div className="budget-actions">
                  <button className="btn-small btn-edit" onClick={() => handleEdit(budget.budgetId)}>Editar</button>
                  <button className="btn-small btn-delete" onClick={() => handleDelete(budget.budgetId)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
