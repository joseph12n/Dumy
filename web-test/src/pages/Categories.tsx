import { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import Card from '../components/Card';

const ICON_OPTIONS = [
  '🍔', '🚌', '❤️', '📚', '🎮', '🏠', '🛍️', '📊',
  '🎬', '✈️', '🎓', '💊', '📱', '⛽', '🎵', '🍕', '📦', '🔹',
];

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();

  const [formData, setFormData] = useState({ name: '', icon: '🔹', color: '#6B7280' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) throw new Error('El nombre de la categoria es requerido');

      if (editingId) {
        const cat = categories.find((c) => c.id === editingId);
        if (cat?.isDefault === 1) throw new Error('No puedes editar categorias por defecto');
        updateCategory(editingId, { name: formData.name, icon: formData.icon, color: formData.color });
        setEditingId(null);
      } else {
        addCategory({ name: formData.name, icon: formData.icon, color: formData.color, budgetLimit: null });
      }

      setFormData({ name: '', icon: '🔹', color: '#6B7280' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat && cat.isDefault === 0) {
      setFormData({ name: cat.name, icon: cat.icon, color: cat.color });
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat?.isDefault === 1) { alert('No puedes eliminar categorias por defecto'); return; }
    if (window.confirm('Estas seguro de que deseas eliminar esta categoria?')) {
      try { deleteCategory(id); } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    }
  };

  const defaultCats = categories.filter((c) => c.isDefault === 1);
  const customCats = categories.filter((c) => c.isDefault === 0);

  return (
    <div className="page-categories">
      <h1>Gestionar Categorias</h1>

      <Card title={editingId ? 'Editar Categoria' : 'Nueva Categoria'}>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleAddOrUpdate} className="form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Suscripciones" required />
            </div>
            <div className="form-group">
              <label>Icono</label>
              <select value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })}>
                {ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Color</label>
            <div className="color-picker-group">
              <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
              <span className="color-preview" style={{ backgroundColor: formData.color }}></span>
              <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="#6B7280" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setFormData({ name: '', icon: '🔹', color: '#6B7280' }); }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card title={`Categorias por Defecto (${defaultCats.length})`} className="mt-4">
        <div className="categories-grid">
          {defaultCats.map((cat) => (
            <div key={cat.id} className="category-card">
              <div className="category-icon" style={{ backgroundColor: cat.color }}>{cat.icon}</div>
              <div className="category-info"><h4>{cat.name}</h4><p>Por defecto</p></div>
            </div>
          ))}
        </div>
      </Card>

      <Card title={`Mis Categorias (${customCats.length})`} className="mt-4">
        {customCats.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>No hay categorias personalizadas</p>
        ) : (
          <div className="categories-grid">
            {customCats.map((cat) => (
              <div key={cat.id} className="category-card editable">
                <div className="category-icon" style={{ backgroundColor: cat.color }}>{cat.icon}</div>
                <div className="category-info"><h4>{cat.name}</h4><p>{cat.color}</p></div>
                <div className="category-actions">
                  <button className="btn-small btn-edit" onClick={() => handleEdit(cat.id)}>Editar</button>
                  <button className="btn-small btn-delete" onClick={() => handleDelete(cat.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
