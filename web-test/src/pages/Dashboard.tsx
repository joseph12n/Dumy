import { useMonthlyStats } from '../hooks/useStats';
import { useTransactionCountForMonth, useMonthlyTotal } from '../hooks/useTransactions';
import { useBudgetCount } from '../hooks/useCategories';
import { useMonthlySalary } from '../hooks/useSettings';
import Card from '../components/Card';
import CurrencyDisplay from '../components/CurrencyDisplay';

export default function Dashboard() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const { periodStats, categoryBreakdown, trends, budgetStatus } = useMonthlyStats(year, month);
  const transactionCount = useTransactionCountForMonth(year, month);
  const totalIncome = useMonthlyTotal(year, month, 'income');
  const totalExpense = useMonthlyTotal(year, month, 'expense');
  const budgetCount = useBudgetCount();
  const salary = useMonthlySalary();

  const balance = totalIncome - totalExpense;
  const salaryRemaining = salary > 0 ? salary - totalExpense : 0;
  const salaryUsedPct = salary > 0 ? Math.min((totalExpense / salary) * 100, 100) : 0;

  return (
    <div className="page-dashboard">
      <h1>Dashboard - {today.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</h1>

      {/* Salary Banner */}
      {salary > 0 && (
        <Card title="Salario Mensual" className="salary-banner">
          <div className="salary-overview">
            <div className="salary-main">
              <div className="stat-value">
                <CurrencyDisplay amount={salary} />
              </div>
              <p className="stat-label">Salario registrado</p>
            </div>
            <div className="salary-remaining">
              <div className={`stat-value ${salaryRemaining >= 0 ? 'success' : 'error'}`}>
                <CurrencyDisplay amount={salaryRemaining} />
              </div>
              <p className="stat-label">Disponible del salario</p>
            </div>
          </div>
          <div className="progress-bar large" style={{ marginTop: 15 }}>
            <div
              className={`progress-fill ${salaryUsedPct > 90 ? 'error' : ''}`}
              style={{ width: `${salaryUsedPct}%` }}
            ></div>
          </div>
          <p style={{ textAlign: 'right', fontSize: 13, color: '#666', marginTop: 5 }}>
            {salaryUsedPct.toFixed(1)}% del salario gastado
          </p>
        </Card>
      )}

      {salary === 0 && (
        <Card className="salary-banner">
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>No has registrado tu salario mensual</p>
            <a href="#salary" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Ir a registrar salario &rarr;
            </a>
          </div>
        </Card>
      )}

      {/* Main Stats Grid */}
      <div className="stats-grid">
        <Card title="Ingresos">
          <div className="stat-value">
            <CurrencyDisplay amount={totalIncome} />
          </div>
          <p className="stat-label">Ingresos totales del mes</p>
        </Card>

        <Card title="Gastos">
          <div className="stat-value error">
            <CurrencyDisplay amount={totalExpense} />
          </div>
          <p className="stat-label">Gastos totales del mes</p>
        </Card>

        <Card title="Balance">
          <div className={`stat-value ${balance >= 0 ? 'success' : 'error'}`}>
            <CurrencyDisplay amount={balance} />
          </div>
          <p className="stat-label">Saldo neto del mes</p>
        </Card>

        <Card title="Actividad">
          <div className="stat-value">{transactionCount}</div>
          <p className="stat-label">Transacciones registradas</p>
        </Card>
      </div>

      {/* Period Stats */}
      {periodStats && periodStats.transactionCount > 0 && (
        <Card title="Resumen del Periodo" className="mt-4">
          <div className="summary-grid">
            <div>
              <strong>Transacciones:</strong> {periodStats.transactionCount}
            </div>
            <div>
              <strong>Periodo:</strong> {periodStats.period.from} a {periodStats.period.to}
            </div>
          </div>
        </Card>
      )}

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <Card title="Desglose por Categoria" className="mt-4">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Total Gastado</th>
                  <th>Porcentaje</th>
                  <th>Transacciones</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((cat) => (
                  <tr key={cat.categoryId}>
                    <td>
                      <span style={{ marginRight: 8 }}>{cat.categoryIcon}</span>
                      {cat.categoryName}
                    </td>
                    <td><CurrencyDisplay amount={cat.totalSpent} /></td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${cat.percentage}%` }}></div>
                      </div>
                      <span>{cat.percentage.toFixed(1)}%</span>
                    </td>
                    <td>{cat.transactionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Trends */}
      {trends && totalExpense > 0 && (
        <Card title="Tendencias" className="mt-4">
          <div className="grid-2">
            <div>
              <strong>Mes vs Mes Anterior:</strong>
              <p className={trends.monthOverMonth > 0 ? 'text-error' : 'text-success'}>
                {trends.monthOverMonth > 0 ? '+' : ''}{Math.abs(trends.monthOverMonth).toFixed(1)}%
              </p>
            </div>
            <div>
              <strong>Promedio Diario:</strong>
              <p><CurrencyDisplay amount={trends.dailyAverageThisMonth} /></p>
            </div>
            <div>
              <strong>Proyeccion Mensual:</strong>
              <p><CurrencyDisplay amount={trends.projectedMonthTotal} /></p>
            </div>
            <div>
              <strong>Tasa de Ahorro:</strong>
              <p className={balance >= 0 ? 'text-success' : 'text-error'}>
                {((balance) / Math.max(totalIncome, salary, 1) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Budget Status */}
      {budgetStatus.length > 0 && (
        <Card title="Estado de Presupuestos" className="mt-4">
          <div className="budget-list">
            {budgetStatus.map((budget) => (
              <div key={budget.budgetId} className={`budget-item ${budget.isOverBudget ? 'over-budget' : ''}`}>
                <div className="budget-header">
                  <span>{budget.categoryIcon} {budget.categoryName}</span>
                  <span className={budget.isOverBudget ? 'badge-error' : 'badge-success'}>
                    {budget.percentageUsed.toFixed(0)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${budget.isOverBudget ? 'error' : ''}`}
                    style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                  ></div>
                </div>
                <div className="budget-footer">
                  <small>
                    <CurrencyDisplay amount={budget.spent} /> / <CurrencyDisplay amount={budget.limitAmount} />
                  </small>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <Card title="Resumen Rapido" className="mt-4">
        <div className="quick-stats">
          <div className="stat-item">
            <span>Presupuestos Activos:</span>
            <strong>{budgetCount}</strong>
          </div>
          <div className="stat-item">
            <span>Tasa de Ahorro:</span>
            <strong>
              {((totalIncome - totalExpense) / Math.max(totalIncome, 1) * 100).toFixed(1)}%
            </strong>
          </div>
        </div>
      </Card>
    </div>
  );
}
