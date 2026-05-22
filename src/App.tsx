import React, { useState, useEffect } from 'react';
import { CHARACTERS } from './data';
import { Character, CharacterId, MoodType, LogEntry } from './types';
import CharacterCard from './components/CharacterCard';
import DialogueBox from './components/DialogueBox';
import OfferingDrawer from './components/OfferingDrawer';
import LogBook from './components/LogBook';
import { Compass, Flame, Skull, ShieldAlert, Sparkles, BookOpen, Clock, RefreshCw } from 'lucide-react';

export default function App() {
  const [selectedCharId, setSelectedCharId] = useState<CharacterId>('luffy');
  const [situation, setSituation] = useState('');
  const [relationshipLevels, setRelationshipLevels] = useState<Record<CharacterId, number>>({
    luffy: 1, // Start as "Compañero de comida"
    zoro: 1,  // Start as "Compañero de entrenamiento"
    robin: 0, // Start as "Pasajera reservada"
    hancock: 0, // Start as "Plebeyo insolente"
  });
  const [selectedGiftId, setSelectedGiftId] = useState<string | undefined>(undefined);
  
  // Output response states
  const [lastResponse, setLastResponse] = useState<string>('');
  const [lastExpression, setLastExpression] = useState<string>('happy');
  const [lastResponseMood, setLastResponseMood] = useState<MoodType>('motivation');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bitacora history saved to localStorage
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const stored = localStorage.getItem('op_ai_companion_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save logs to local storage when updated
  useEffect(() => {
    localStorage.setItem('op_ai_companion_logs', JSON.stringify(logs));
  }, [logs]);

  const activeCharacter = CHARACTERS.find((c) => c.id === selectedCharId) || CHARACTERS[0];
  const activeLevel = relationshipLevels[selectedCharId];

  // If active character changes, reset chosen gift
  useEffect(() => {
    setSelectedGiftId(undefined);
  }, [selectedCharId]);

  const handleGenerate = async (mood: MoodType) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: selectedCharId,
          moodType: mood,
          situation: situation.trim(),
          relationshipLevel: activeLevel,
          giftId: selectedGiftId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error conectando con la Grand Line.');
      }

      setLastResponse(data.text);
      setLastExpression(data.expression || (mood === 'motivation' ? 'happy' : 'dry'));
      setLastResponseMood(mood);

      // Successfully generated, let's log it
      const chosenGift = selectedGiftId ? activeCharacter.gifts.find((g) => g.id === selectedGiftId) : undefined;
      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        characterId: selectedCharId,
        moodType: mood,
        situation: situation.trim(),
        response: data.text,
        expression: data.expression || (mood === 'motivation' ? 'happy' : 'dry'),
        relationshipLevelName: activeCharacter.traits[activeLevel],
        giftName: chosenGift?.name,
      };

      setLogs((prev) => [newLog, ...prev]);

      // Consume the gift (optional, let's reset it to avoid spamming unless they choose again)
      setSelectedGiftId(undefined);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error grave al dialogar con la tripulación.');
      setLastResponse('¡Maldición! Un mal clima o un monstruo marino ha cortado nuestra conexión con el Den Den Mushi de la IA. ¡Revisa que tu Clave de API de Gemini esté cargada en Secrets!');
      setLastExpression('angry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('¿Seguro de que deseas limpiar todo tu diario de navegación? Tararearás el Sake de Binks solo...')) {
      setLogs([]);
      localStorage.removeItem('op_ai_companion_logs');
    }
  };

  const handleRestoreLog = (log: LogEntry) => {
    setSelectedCharId(log.characterId);
    setSituation(log.situation);
    setLastResponse(log.response);
    setLastExpression(log.expression);
    setLastResponseMood(log.moodType);
    
    // Find index of trait level
    const char = CHARACTERS.find((c) => c.id === log.characterId);
    if (char) {
      const traitIdx = char.traits.indexOf(log.relationshipLevelName);
      if (traitIdx !== -1) {
        setRelationshipLevels((prev) => ({
          ...prev,
          [log.characterId]: traitIdx,
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Decorative top ambient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-indigo-600" />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        
        {/* Header section (Aesthetic - No AI-Slop clean human labels) */}
        <header className="flex flex-col items-center text-center gap-4 border-b border-slate-900 pb-8 relative">
          <div className="absolute top-0 left-0 text-slate-800 pointer-events-none select-none text-9xl font-black font-mono">
            <Compass className="h-32 w-32 animate-[spin_60s_linear_infinite] opacity-5" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-905 border border-slate-800 rounded-full text-xs font-mono text-amber-500 shadow-sm">
            <Compass className="h-3 w-3 animate-spin-slow" />
            Sintonizador del Destino • Grand Line
          </div>

          <h1 className="font-sans font-black text-3xl md:text-5xl text-white tracking-tight leading-none bg-gradient-to-r from-white via-slate-150 to-slate-400 bg-clip-text text-transparent">
            Motivador & Desmotivador <span className="text-amber-500">One Piece AI</span>
          </h1>

          <p className="max-w-2xl text-sm md:text-base text-slate-400 font-sans leading-relaxed">
            Consúltale tus dilemas humanos a la tripulación más libre de los mares. Elige tu anfitrión, define qué tanto te respeta, sobórnalo con su objeto favorito y prepárate para un consejo de vida asombroso o un baño de agua fría realista.
          </p>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 bg-slate-950/60 p-2 rounded-lg border border-slate-900 mt-2">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Hora UTC: 2026-05-22 07:25</span>
            </div>
            <span className="text-slate-800">|</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Motor Inteligente: Gemini 3.5</span>
            </div>
          </div>
        </header>

        {/* Core Layout: Grid of selections, generator workspace, dialogue, and diary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Character Host Selection (8-grid width on tablet/desktop) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Steps & Hosts Title Banner */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-sans font-bold tracking-tight text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-850 border border-slate-700 text-xs font-mono text-amber-500 font-bold">1</span>
                Elige tu Anfitrión de la Grand Line
              </h2>
            </div>

            {/* Grid of 4 Characters Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CHARACTERS.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  isSelected={selectedCharId === char.id}
                  onSelect={() => setSelectedCharId(char.id)}
                  relationshipLevel={relationshipLevels[char.id]}
                  onRelationshipChange={(level) => {
                    setRelationshipLevels((prev) => ({
                      ...prev,
                      [char.id]: level,
                    }));
                  }}
                />
              ))}
            </div>

            {/* Step 2 Inputs */}
            <div className="space-y-6 bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-slate-800/20 blur-2xl" />
              
              <h2 className="text-base font-sans font-bold tracking-tight text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-850 border border-slate-700 text-xs font-mono text-amber-500 font-bold">2</span>
                ¿Qué dilema o situación te aflige hoy?
              </h2>

              <p className="text-xs text-slate-400">
                Pregunta si debes confesar un secreto, si vale la pena madrugar, si debes dejar de postergar tu entrenamiento, o simplemente pide que se sinceren contigo.
              </p>

              <div className="relative">
                <textarea
                  id="situation-textarea"
                  rows={4}
                  placeholder={`Ej: "Tengo que estudiar 5 horas para un examen de álgebra, pero mis amigos me invitaron a comer tacos..." o "No sé de dónde sacar fuerzas para entrenar hoy."`}
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition-all resize-none"
                />
                
                {/* Visual character limits or tips */}
                <div className="absolute right-3 bottom-3 text-[11px] font-mono text-slate-600">
                  {situation.length}/500 caracteres
                </div>
              </div>

              {/* Action Buttons: Choose Motivation or Demotivation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                <button
                  type="button"
                  id="motivate-btn"
                  onClick={() => handleGenerate('motivation')}
                  disabled={isLoading}
                  className="relative group overflow-hidden bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-slate-950 font-sans font-extrabold py-4 px-6 rounded-xl shadow-lg hover:shadow-red-900/10 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Sintonizando caracoles...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="h-5 w-5 animate-pulse" />
                      <span>¡DAME MOTIVACIÓN!</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="demotivate-btn"
                  onClick={() => handleGenerate('demotivation')}
                  disabled={isLoading}
                  className="relative group overflow-hidden bg-slate-950 border border-slate-800 hover:border-slate-700 text-rose-500 hover:text-rose-400 font-sans font-extrabold py-4 px-6 rounded-xl shadow-md active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
                      <span>Sintonizando caracoles...</span>
                    </>
                  ) : (
                    <>
                      <Skull className="h-5 w-5 opacity-90" />
                      <span>SINCERIDAD FRÍA / DESMOTIVACIÓN</span>
                    </>
                  )}
                </button>

              </div>

              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl flex items-start gap-2 animate-pulse mt-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Error del Den Den Mushi:</span> {errorMessage}
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Interactive Dialogue Response Panel */}
            <DialogueBox
              characterId={activeCharacter.id}
              characterName={activeCharacter.name}
              avatarEmoji={activeCharacter.avatar}
              accentClass={activeCharacter.accentColor}
              textColorClass={activeCharacter.textColor}
              text={lastResponse}
              expression={lastExpression}
              isLoading={isLoading}
              moodType={lastResponseMood}
              relationshipLevelName={activeCharacter.traits[activeLevel]}
            />

          </div>

          {/* Column 2: Offering (Sobornos) & History LogBook (4-grid width) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Step 3: Offerings Drawer */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-850 border border-slate-700 text-[10px] font-mono text-amber-500 font-bold">3</span>
                <span className="text-xs font-mono uppercase font-bold tracking-wider text-slate-500">Influencia Especial</span>
              </div>
              <OfferingDrawer
                currentGifts={activeCharacter.gifts}
                selectedGiftId={selectedGiftId}
                onSelectGift={setSelectedGiftId}
                accentTextColor={activeCharacter.textColor}
              />
            </div>

            {/* Step 4: Bitacora LogBook */}
            <LogBook
              logs={logs}
              onClearLogs={handleClearLogs}
              onRestoreLog={handleRestoreLog}
            />

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 mt-12 py-8 bg-slate-950/80 text-center text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1.5">
            <span>⚔️ Hecho con pasión por Nakamas de One Piece</span>
          </p>
          <p className="font-mono text-[11px]">
            La libertad rige los océanos de la Inteligencia Artificial.
          </p>
        </div>
      </footer>

    </div>
  );
}
