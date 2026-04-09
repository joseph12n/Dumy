import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { todayISO } from '../utils/dates';
import Card from '../components/Card';
import CurrencyDisplay from '../components/CurrencyDisplay';

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { categories } = useCategories();

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: categories[0]?.id || '',
    date: todayISO(),
    type: 'expense' as 'income' | 'expense',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const amount = parseInt(formData.amount, 10);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Monto debe ser un numero positivo');
      }

      if (editingId) {
        updateTransaction({
          id: editingId,
          amount,
          description: formData.description,
          categoryId: formData.categoryId,
          date: formData.date,
          type: formData.type,
        });
        setEditingId(null);
      } else {
        addTransaction({
          amount,
          description: formData.description,
          categoryId: formData.categoryId,
          date: formData.date,
          type: formData.type,
          receiptImagePath: null,
        });
      }

      setFormData({
        amount: '',
        description: '',
        categoryId: categories[0]?.id || '',
        date: todayISO(),
        type: 'expense',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar transaccion');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (tx) {
      setFormData({
        amount: tx.amount.toString(),
        description: tx.description,
        categoryId: tx.categoryId,
        date: tx.date,
        type: tx.type,
      });
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Estas seguro de que deseas eliminar esta transaccion?')) {
      deleteTransaction(id);
    }
  };

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="page-transactions">
      <h1>Gestionar Transacciones</h1>

      {/* Form */}
      <Card title={editingId ? 'Editar Transaccion' : 'Nueva Transaccion'}>
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleAddOrUpdate} className="form">
          <div className="form-row">
            <div className="form-group">
              <label>Tipo *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                required
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </div>

            <div className="form-group">
              <label>Monto (COP) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="18000"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoria *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fecha *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Descripcion</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ej: Almuerzo en restaurante"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ amount: '', description: '', categoryId: categories[0]?.id || '', date: todayISO(), type: 'expense' });
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </Card>

      {/* List */}
      <Card title={`Transacciones (${transactions.length})`} className="mt-4">
        {transactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>No hay transacciones. Crea una para comenzar!</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripcion</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  return (
                    <tr key={tx.id}>
                      <td>{tx.date}</td>
                      <td>{tx.description || '-'}</td>
                      <td>{cat && <><span>{cat.icon}</span> {cat.name}</>}</td>
                      <td>
                        <span className={`badge ${tx.type === 'income' ? 'badge-success' : 'badge-error'}`}>
                          {tx.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td><CurrencyDisplay amount={tx.amount} type={tx.type === 'income' ? 'signed' : 'normal'} /></td>
                      <td className="actions">
                        <button className="btn-small btn-edit" onClick={() => handleEdit(tx.id)} title="Editar">Editar</button>
                        <button className="btn-small btn-delete" onClick={() => handleDelete(tx.id)} title="Eliminar">Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
