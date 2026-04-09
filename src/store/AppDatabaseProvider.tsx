/**
 * AppDatabaseProvider - Root component for database initialization
 * Wraps the entire app and ensures database is ready before rendering
 * Initializes all Zustand stores with data from SQLite
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { getDatabase } from './database';
import { useTransactionStore } from './transactionStore';
import { useCategoryStore } from './categoryStore';
import { useSettingsStore } from './settingsStore';
import { useChatStore } from './chatStore';

interface AppDatabaseProviderProps {
  children: React.ReactNode;
  onReady?: () => void;
}

/**
 * Initialize the database and load all store data
 * This must complete before the app UI renders
 */
async function initializeApp(): Promise<void> {
  try {
    // 1. Open database (runs migrations on first open)
    console.log('[AppDatabaseProvider] Initializing database...');
    const db = await getDatabase();
    console.log('[AppDatabaseProvider] Database ready');

    // 2. Load all store data in parallel
    console.log('[AppDatabaseProvider] Loading store data...');
    await Promise.all([
      useCategoryStore.getState().loadCategories(),
      useCategoryStore.getState().loadBudgets(),
      useTransactionStore.getState().loadTransactions(),
      useSettingsStore.getState().loadSettings(),
    ]);
    console.log('[AppDatabaseProvider] Stores loaded');

    // 3. Initialize chat session
    useChatStore.getState().initSession();
    console.log('[AppDatabaseProvider] Chat session initialized');
  } catch (error) {
    console.error('[AppDatabaseProvider] Initialization failed:', error);
    throw error;
  }
}

/**
 * Provider component - shows splash screen until DB is ready
 */
export function AppDatabaseProvider({
  children,
  onReady,
}: AppDatabaseProviderProps): React.ReactElement {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    initializeApp()
      .then(() => {
        if (isMounted) {
          setIsReady(true);
          onReady?.();
          console.log('[AppDatabaseProvider] App is ready');
        }
      })
      .catch((err) => {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
          console.error('[AppDatabaseProvider] App initialization error:', err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onReady]);

  // Show loading screen while initializing
  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        {error ? (
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 10,
                color: '#EF4444',
              }}
            >
              Error al inicializar
            </Text>
            <Text style={{ fontSize: 14, color: '#666666', textAlign: 'center' }}>
              {error}
            </Text>
          </View>
        ) : (
          <>
            <ActivityIndicator
              size="large"
              color="#2f95dc"
              style={{ marginBottom: 20 }}
            />
            <Text
              style={{
                fontSize: 16,
                color: '#666666',
              }}
            >
              Inicializando Dumy...
            </Text>
          </>
        )}
      </View>
    );
  }

  // Render children when ready
  return <>{children}</>;
}
