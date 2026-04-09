import { useState } from 'react';
import { useSettings, useTheme, useCurrencyLocale, useSetTheme, useSetCurrencyLocale } from '../hooks/useSettings';
import { useCategoryCount, useBudgetCount } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';
import Card from '../components/Card';

export default function Settings() {
  const { settings } = useSettings();
  const theme = useTheme();
  const currencyLocale = useCurrencyLocale();
  const setTheme = useSetTheme();
  const setCurrencyLocale = useSetCurrencyLocale();

  const categoryCount = useCategoryCount();
  const { transactions } = useTransactions();
  const budgetCount = useBudgetCount();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setLoading(true);
    try {
      await setTheme(newTheme);
      setMessage('Tema actualizado');
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage('Error al actualizar tema');
    } finally {
      setLoading(false);
    }
  };

  const handleLocaleChange = async (locale: string) => {
    setLoading(true);
    try {
      await setCurrencyLocale(locale);
      setMessage('Locale actualizado');
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage('Error al actualizar locale');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Estas seguro? Esto eliminara TODOS tus datos (transacciones, categorias personalizadas, presupuestos, salario).')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="page-settings">
      <h1>Configuracion</h1>

      {message && <div className="success-box">{message}</div>}

      <Card title="Apariencia">
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">
              <strong>Tema</strong>
              <p>Elige el tema de la aplicacion</p>
            </div>
            <div className="setting-options">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  className={`option-btn ${theme === t ? 'active' : ''}`}
                  onClick={() => handleThemeChange(t)}
                  disabled={loading}
                >
                  {t === 'light' && 'Claro'}
                  {t === 'dark' && 'Oscuro'}
                  {t === 'system' && 'Sistema'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Localizacion" className="mt-4">
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">
              <strong>Locale / Region</strong>
              <p>Selecciona tu region para formato de moneda y fechas</p>
            </div>
            <select
              value={currencyLocale}
              onChange={(e) => handleLocaleChange(e.target.value)}
              disabled={loading}
              className="locale-select"
            >
              <option value="es-CO">Colombiano (es-CO)</option>
              <option value="es-ES">Espanol (es-ES)</option>
              <option value="en-US">English (en-US)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Estadisticas de la App" className="mt-4">
        <div className="stats-section">
          <div className="stat-box">
            <div className="stat-number">{categoryCount}</div>
            <div className="stat-label">Categorias</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{transactions.length}</div>
            <div className="stat-label">Transacciones</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{budgetCount}</div>
            <div className="stat-label">Presupuestos</div>
          </div>
        </div>
      </Card>

      <Card title="Almacenamiento" className="mt-4">
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">
              <strong>Base de Datos Local</strong>
              <p>Los datos se guardan en localStorage del navegador (offline-first)</p>
            </div>
            <div className="storage-info">
              <p>Todas las transacciones se guardan localmente</p>
              <p>Sin sincronizacion con servidores</p>
              <p>Los datos persisten entre sesiones</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Privacidad" className="mt-4">
        <div className="settings-group">
          <div className="setting-item">
            <p><strong>Privacidad de Datos</strong></p>
            <ul style={{ marginLeft: 20, lineHeight: 1.8 }}>
              <li>Todos tus datos se almacenan localmente en tu navegador</li>
              <li>Ningun dato se comparte con servidores externos</li>
              <li>Eres el unico propietario de tus datos financieros</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="Acerca de Dumy" className="mt-4">
        <div className="settings-group">
          <div className="setting-item">
            <p><strong>Dumy v1.0 - Test Web</strong></p>
            <p style={{ color: '#666', marginTop: 10, marginBottom: 10 }}>
              Asistente financiero personal para estudiantes y jovenes colombianos
            </p>
            <div style={{ fontSize: 12, color: '#999' }}>
              <p>Mision: Ayudar a jovenes a manejar sus finanzas de forma inteligente y segura</p>
              <p>Stack: React, TypeScript, Zustand, Vite</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Avanzado" className="mt-4">
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">
              <strong>Configuracion de Desarrollador</strong>
              <p>Para testing y debugging</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => { console.log('All Settings:', settings); alert('Revisa la consola para todos los settings'); }}>
                Ver Settings en Consola
              </button>
              <button className="btn btn-secondary" onClick={handleClearData} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                Borrar Todos los Datos
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
