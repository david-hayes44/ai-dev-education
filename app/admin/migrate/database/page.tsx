'use client';

import { useState, useEffect } from 'react';
import { useAuth, AuthSystem, setAuthSystem } from '@/lib/auth';
import { migrateUserData } from '@/utils/migrate-database';

type MigrationState = {
  running: boolean;
  progress: {
    total: {
      conversations: number;
      messages: number;
      attachments: number;
    };
    migrated: {
      conversations: number;
      messages: number;
      attachments: number;
    };
    failed: {
      conversations: number;
      messages: number;
      attachments: number;
    };
  };
  currentOperation: string;
  error: string | null;
  log: string[];
};

export default function MigrateDatabasePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [state, setState] = useState<MigrationState>({
    running: false,
    progress: {
      total: { conversations: 0, messages: 0, attachments: 0 },
      migrated: { conversations: 0, messages: 0, attachments: 0 },
      failed: { conversations: 0, messages: 0, attachments: 0 },
    },
    currentOperation: '',
    error: null,
    log: [],
  });

  const [authSystem, setLocalAuthSystem] = useState<AuthSystem>(AuthSystem.FIREBASE);
  
  useEffect(() => {
    // Get the current authentication system
    import('@/lib/auth').then(({ getAuthSystem }) => {
      setLocalAuthSystem(getAuthSystem());
    });
  }, []);

  const addLog = (message: string) => {
    setState((prev) => ({
      ...prev,
      log: [...prev.log, `[${new Date().toLocaleTimeString()}] ${message}`],
    }));
  };

  const handleMigrate = async () => {
    if (!user) {
      addLog('No user authenticated. Please sign in first.');
      return;
    }

    setState((prev) => ({
      ...prev,
      running: true,
      error: null,
      currentOperation: 'Starting migration...',
    }));

    try {
      addLog(`Starting migration for user ${user.id}`);
      
      const result = await migrateUserData(user, (progress) => {
        setState((prev) => ({
          ...prev,
          progress: {
            total: progress.total,
            migrated: progress.migrated,
            failed: progress.failed,
          },
          currentOperation: progress.currentItem,
        }));
        addLog(progress.currentItem);
      });

      setState((prev) => ({
        ...prev,
        running: false,
        progress: {
          total: result.total,
          migrated: result.migrated,
          failed: result.failed,
        },
        currentOperation: 'Migration completed',
      }));
      
      addLog('Migration completed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        running: false,
        error: errorMessage,
        currentOperation: 'Error during migration',
      }));
      
      addLog(`Migration failed: ${errorMessage}`);
    }
  };

  const switchAuthSystem = (system: AuthSystem) => {
    setAuthSystem(system);
    setLocalAuthSystem(system);
    addLog(`Switched to ${system} authentication`);
  };

  const renderProgressBar = (current: number, total: number) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Database Migration Tool</h1>
        <p>Loading authentication state...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Database Migration Tool</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">
            You need to be authenticated to use this tool. Please sign in first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Database Migration Tool</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Authentication System</h2>
        
        <p className="mb-4 text-gray-600">
          Control which authentication system is used. During migration,
          you can use both systems simultaneously.
        </p>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => switchAuthSystem(AuthSystem.FIREBASE)}
            className={`px-4 py-2 rounded-md ${
              authSystem === AuthSystem.FIREBASE
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Firebase Only
          </button>
          
          <button
            onClick={() => switchAuthSystem(AuthSystem.DUAL)}
            className={`px-4 py-2 rounded-md ${
              authSystem === AuthSystem.DUAL
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Dual (Firebase + Supabase)
          </button>
          
          <button
            onClick={() => switchAuthSystem(AuthSystem.SUPABASE)}
            className={`px-4 py-2 rounded-md ${
              authSystem === AuthSystem.SUPABASE
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Supabase Only
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Firebase to Supabase Data Migration</h2>
        
        <p className="mb-4 text-gray-600">
          This tool will migrate all your chat data from Firebase to Supabase.
          This includes conversations, messages, and file attachments.
        </p>
        
        {state.error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{state.error}</p>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Progress</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>Conversations</span>
                <span>
                  {state.progress.migrated.conversations} / {state.progress.total.conversations}
                </span>
              </div>
              {renderProgressBar(
                state.progress.migrated.conversations,
                state.progress.total.conversations
              )}
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span>Messages</span>
                <span>
                  {state.progress.migrated.messages} / {state.progress.total.messages}
                </span>
              </div>
              {renderProgressBar(
                state.progress.migrated.messages,
                state.progress.total.messages
              )}
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span>Attachments</span>
                <span>
                  {state.progress.migrated.attachments} / {state.progress.total.attachments}
                </span>
              </div>
              {renderProgressBar(
                state.progress.migrated.attachments,
                state.progress.total.attachments
              )}
            </div>
          </div>
        </div>
        
        {state.currentOperation && (
          <div className="mb-4 text-sm text-gray-600">
            <p>Current operation: {state.currentOperation}</p>
          </div>
        )}
        
        <button
          onClick={handleMigrate}
          disabled={state.running}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {state.running ? 'Migration Running...' : 'Start Migration'}
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Migration Log</h2>
        
        <div className="bg-gray-900 text-gray-100 font-mono p-4 rounded-lg h-64 overflow-y-auto text-sm">
          {state.log.length === 0 ? (
            <p className="text-gray-500">No logs yet. Start a migration to see logs.</p>
          ) : (
            state.log.map((entry, index) => <div key={index}>{entry}</div>)
          )}
        </div>
      </div>
    </div>
  );
} 