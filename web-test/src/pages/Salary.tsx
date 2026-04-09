import { useState } from 'react';
import { useMonthlySalary, useSetMonthlySalary } from '../hooks/useSettings';
import { useMonthlyTotal } from '../hooks/useTransactions';
import Card from '../components/Card';
import CurrencyDisplay from '../components/CurrencyDisplay';

export default function Salary() {
  const salary = useMonthlySalary();
  const setSalary = useSetMonthlySalary();

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const totalExpense = useMonthlyTotal(year, month, 'expense');
  const totalIncome = useMonthlyTotal(year, month, 'income');

  const [inputValue, setInputValue] = useState(salary > 0 ? salary.toString() : '');
  const [saved, setSaved] = useState(false);

  const remaining = salary - totalExpense;
  const usedPct = salary > 0 ? (totalExpense / salary) * 100 : 0;
  const savingsRate = salary > 0 ? ((salary - totalExpense) / salary) * 100 : 0;

  const handleSave = () => {
    const amount = parseInt(inputValue, 10);
    if (isNaN(amount) || amount < 0) return;
    setSalary(amount);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Projected daily budget
  const daysLeft = new Date(year, month, 0).getDate() - today.getDate();
  const dailyBudget = remaining > 0 && daysLeft > 0 ? Math.round(remaining / daysLeft) : 0;

  return (
    <div className="page-salary">
      <h1>Salario Mensual</h1>

      {/* Input Form */}
      <Card title="Registrar Salario">
        <div className="form">
          <div className="form-group">
            <label>Salario Mensual (COP)</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ej: 1500000"
              min="0"
              step="10000"
            />
            <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Ingresa tu salario mensual neto (lo que recibes despues de deducciones)
            </p>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={!inputValue}>
              Guardar Salario
            </button>
          </div>

          {saved && <div className="success-box">Salario actualizado correctamente</div>}
        </div>
      </Card>

      {/* Salary Dashboard */}
      {salary > 0 && (
        <>
          <Card title="Estado del Salario" className="mt-4">
            <div className="stats-grid">
              <div className="stat-card-inner">
                <div className="stat-value"><CurrencyDisplay amount={salary} /></div>
                <p className="stat-label">Salario mensual</p>
              </div>
              <div className="stat-card-inner">
                <div className="stat-value error"><CurrencyDisplay amount={totalExpense} /></div>
                <p className="stat-label">Total gastado</p>
              </div>
              <div className="stat-card-inner">
                <div className={`stat-value ${remaining >= 0 ? 'success' : 'error'}`}>
                  <CurrencyDisplay amount={remaining} />
                </div>
                <p className="stat-label">Disponible</p>
              </div>
            </div>

            <div className="progress-bar large" style={{ marginTop: 20 }}>
              <div
                className={`progress-fill ${usedPct > 90 ? 'error' : ''}`}
                style={{ width: `${Math.min(usedPct, 100)}%` }}
              ></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginTop: 5 }}>
              <span>{usedPct.toFixed(1)}% utilizado</span>
              <span>{Math.max(0, 100 - usedPct).toFixed(1)}% disponible</span>
            </div>
          </Card>

          <Card title="Indicadores" className="mt-4">
            <div className="quick-stats">
              <div className="stat-item">
                <span>Tasa de Ahorro</span>
                <strong className={savingsRate >= 0 ? '' : 'text-error'}>
                  {savingsRate.toFixed(1)}%
                </strong>
              </div>
              <div className="stat-item">
                <span>Presupuesto Diario Restante</span>
                <strong>
                  {dailyBudget > 0 ? <CurrencyDisplay amount={dailyBudget} /> : '-'}
                </strong>
              </div>
              <div className="stat-item">
                <span>Dias Restantes del Mes</span>
                <strong>{daysLeft}</strong>
              </div>
              <div className="stat-item">
                <span>Otros Ingresos</span>
                <strong><CurrencyDisplay amount={totalIncome} /></strong>
              </div>
            </div>
          </Card>

          {/* Advice */}
          <Card title="Consejos" className="mt-4">
            <div className="advice-list">
              {usedPct < 50 && (
                <div className="advice-item success-box">
                  Excelente! Has gastado menos de la mitad de tu salario. Sigue asi para mantener un buen ahorro.
                </div>
              )}
              {usedPct >= 50 && usedPct < 80 && (
                <div className="advice-item" style={{ padding: '12px 15px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, color: '#92400e' }}>
                  Has utilizado mas de la mitad de tu salario. Revisa tus gastos para mantener el control.
                </div>
              )}
              {usedPct >= 80 && usedPct < 100 && (
                <div className="advice-item error-box">
                  Cuidado! Has gastado mas del 80% de tu salario. Considera reducir gastos no esenciales.
                </div>
              )}
              {usedPct >= 100 && (
                <div className="advice-item error-box">
                  Has excedido tu salario mensual. Revisa urgentemente tus gastos y busca oportunidades de ahorro.
                </div>
              )}
              <div style={{ marginTop: 10, fontSize: 13, color: '#666' }}>
                <p><strong>Regla 50/30/20:</strong></p>
                <ul style={{ marginLeft: 20, marginTop: 5, lineHeight: 1.8 }}>
                  <li>50% Necesidades: <CurrencyDisplay amount={Math.round(salary * 0.5)} /></li>
                  <li>30% Deseos: <CurrencyDisplay amount={Math.round(salary * 0.3)} /></li>
                  <li>20% Ahorro: <CurrencyDisplay amount={Math.round(salary * 0.2)} /></li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
