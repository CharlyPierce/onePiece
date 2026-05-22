import React, { useState } from 'react';
import { LogEntry, CharacterId } from '../types';
import { CHARACTERS } from '../data';
import { History, Trash2, Search, Sparkles, Volume2, Calendar } from 'lucide-react';

interface LogBookProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onRestoreLog: (log: LogEntry) => void;
}

export default function LogBook({ logs, onClearLogs, onRestoreLog }: LogBookProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Find character metadata helper
  const getCharacterMeta = (id: CharacterId) => {
    return CHARACTERS.find((c) => c.id === id) || { name: id, avatar: '👤', textColor: 'text-slate-400' };
  };

  const filteredLogs = logs.filter((log) => {
    const char = getCharacterMeta(log.characterId);
    const searchLower = searchQuery.toLowerCase();
    return (
      char.name.toLowerCase().includes(searchLower) ||
      log.situation.toLowerCase().includes(searchLower) ||
      log.response.toLowerCase().includes(searchLower) ||
      log.moodType.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 flex-wrap gap-3">
        <h4 className="font-sans font-bold text-white text-base flex items-center gap-2">
          <History className="h-5 w-5 text-amber-500" />
          Cuaderno de Bitácora / Historial de Consejos
        </h4>
        {logs.length > 0 && (
          <button
            type="button"
            id="clear-logs-btn"
            onClick={onClearLogs}
            className="text-xs text-rose-500 hover:text-rose-400 font-mono font-bold flex items-center gap-1 bg-rose-550/5 hover:bg-rose-550/10 px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" /> Limpiar Bitácora
          </button>
        )}
      </div>

      {/* Log Search */}
      {logs.length > 0 && (
        <div className="relative mb-4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </span>
          <input
            id="log-search-input"
            type="text"
            placeholder="Buscar por personaje, situación o consejo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
          />
        </div>
      )}

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <History className="h-8 w-8 mx-auto text-slate-700 mb-2" />
            <p className="text-xs font-mono">
              {logs.length === 0 ? 'Sin registros en el diario de navegación.' : 'No se encontraron resultados.'}
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const char = getCharacterMeta(log.characterId);
            const date = new Date(log.timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={log.id}
                id={`log-entry-${log.id}`}
                onClick={() => onRestoreLog(log)}
                className="bg-slate-950 border border-slate-850 hover:border-slate-750 p-4 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{char.avatar}</span>
                    <span className="font-sans font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                      {char.name}
                    </span>
                    <span className="text-[9px] font-mono leading-none px-1.5 py-0.5 rounded uppercase font-bold bg-slate-900 border border-slate-850 text-slate-400">
                      {log.relationshipLevelName.split(' / ')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Calendar className="h-3 w-3" />
                    <span>{date}</span>
                  </div>
                </div>

                {log.situation && (
                  <p className="text-slate-400 text-xs italic mb-2 line-clamp-1 border-l-2 border-slate-800 pl-2">
                    Situación: "{log.situation}"
                  </p>
                )}

                <p className="text-slate-300 text-xs font-sans line-clamp-2 leading-relaxed">
                  "{log.response}"
                </p>

                <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono">
                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                    log.moodType === 'motivation' ? 'bg-amber-400/5 text-amber-500 border border-amber-500/10' : 'bg-rose-500/5 text-rose-500 border border-rose-500/10'
                  }`}>
                    {log.moodType === 'motivation' ? 'Motivación' : 'Desmotivación'}
                  </span>
                  
                  {log.giftName && (
                    <span className="text-[10px] text-amber-500 font-medium flex items-center gap-1">
                      🎁 Sobornado con {log.giftName}
                    </span>
                  )}
                  
                  <span className="text-slate-500 group-hover:text-amber-500 transition-colors flex items-center gap-0.5">
                    <Volume2 className="h-3 w-3" /> Escuchar / Cargar
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
