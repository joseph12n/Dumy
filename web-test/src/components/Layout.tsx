import React from 'react';
import type { PageType } from '../App';

interface LayoutProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  children: React.ReactNode;
}

const pages: Array<{ id: PageType; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transactions', label: 'Transacciones' },
  { id: 'salary', label: 'Salario' },
  { id: 'categories', label: 'Categorias' },
  { id: 'budgets', label: 'Presupuestos' },
  { id: 'chat', label: 'Chat IA' },
  { id: 'settings', label: 'Config' },
];

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">Dumy</div>
          <div className="navbar-menu">
            {pages.map((page) => (
              <a
                key={page.id}
                className={`nav-button ${currentPage === page.id ? 'active' : ''}`}
                href={`#${page.id}`}
                onClick={(e) => { e.preventDefault(); onNavigate(page.id); }}
              >
                {page.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
      <main className="main-content">
        <div className="page-wrapper">{children}</div>
      </main>
      <footer className="app-footer">
        <p>Dumy v1.0 - Test Web</p>
      </footer>
    </div>
  );
}
