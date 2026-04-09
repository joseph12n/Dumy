import { useEffect, useState } from 'react';

import Layout from './components/Layout';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Salary from './pages/Salary';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';

export type PageType = 'dashboard' | 'transactions' | 'salary' | 'categories' | 'budgets' | 'chat' | 'settings';

const VALID_PAGES: PageType[] = ['dashboard', 'transactions', 'salary', 'categories', 'budgets', 'chat', 'settings'];

function getPageFromHash(hash: string): PageType {
  const candidate = hash.replace(/^#/, '') as PageType;
  return VALID_PAGES.includes(candidate) ? candidate : 'dashboard';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>(getPageFromHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setCurrentPage(getPageFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const nextHash = `#${currentPage}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'transactions': return <Transactions />;
      case 'salary': return <Salary />;
      case 'categories': return <Categories />;
      case 'budgets': return <Budgets />;
      case 'chat': return <Chat />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
