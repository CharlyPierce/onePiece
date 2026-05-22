import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, RefreshCw, Trophy, Skull, Swords, Flame, Heart, Sparkles } from 'lucide-react';
import { CharacterId, MoodType } from '../types';

interface DialogueBoxProps {
  characterId: CharacterId;
  characterName: string;
  avatarEmoji: string;
  accentClass: string;
  textColorClass: string;
  text: string;
  expression: string;
  isLoading: boolean;
  moodType: MoodType;
  relationshipLevelName: string;
}

export default function DialogueBox({
  characterId,
  characterName,
  avatarEmoji,
  accentClass,
  textColorClass,
  text,
  expression,
  isLoading,
  moodType,
  relationshipLevelName,
}: DialogueBoxProps) {
  const [typedText, setTypedText] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set up typewriter scrolling effect
  useEffect(() => {
    if (isLoading) {
      setTypedText('Sintonizando el Den Den Mushi...');
      return;
    }

    if (!text) {
      setTypedText('Selecciona un personaje, pon tu dilema y presiona un botón para que hablen contigo...');
      return;
    }

    // Clear previous timers
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }

    setTypedText('');
    let currentIndex = 0;
    
    // Typewriter speed relative to character temperament!
    const speed = characterId === 'luffy' ? 18 : characterId === 'zoro' ? 25 : 30;

    typingTimerRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setTypedText((prev) => prev + text.charAt(currentIndex));
        currentIndex++;
      } else {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      }
    }, speed);

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, [text, isLoading, characterId]);

  // Speak voice synthesizer in Spanish (es-ES)
  const speakText = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel playing voices

      if (!text || isLoading || isMuted) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';

      // Custom voice properties matching personalities
      if (characterId === 'luffy') {
        utterance.pitch = 1.35;
        utterance.rate = 1.2;
      } else if (characterId === 'zoro') {
        utterance.pitch = 0.8;
        utterance.rate = 0.9;
      } else if (characterId === 'robin') {
        utterance.pitch = 1.05;
        utterance.rate = 0.95;
      } else if (characterId === 'hancock') {
        utterance.pitch = 1.15;
        utterance.rate = 1.1;
      }

      // Try searching for a Spanish voice
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.startsWith('es-'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // Re-trigger voice when text typing completes or when voice state changes
  useEffect(() => {
    if (!isMuted && text && !isLoading) {
      // Delay slightly to give layout time to render
      const timer = setTimeout(() => {
        speakText();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [text, isMuted, isLoading]);

  // Get dynamic expressional background and badge representation based on character and mood
  const getExpressionGraphics = () => {
    const expr = expression.toLowerCase();
    switch (expr) {
      case 'happy':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500 animate-pulse',
          label: '😊 Muy Alegre / Entusiasmado',
          effect: '✨'
        };
      case 'angry':
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500 animate-bounce',
          label: '🔥 Furioso / Serio',
          effect: '💢'
        };
      case 'thinking':
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500',
          label: '🤔 Analítico / Pensativo',
          effect: '💭'
        };
      case 'blushing':
        return {
          bg: 'bg-pink-500/20 text-pink-300 border-pink-400',
          label: '💖 ¡Súper Sonrojada!',
          effect: '🌸'
        };
      case 'dry':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-600',
          label: '😑 Seco / Indiferente',
          effect: '💧'
        };
      case 'dark':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500',
          label: '💀 Macabro / Tenebroso',
          effect: '🟣'
        };
      default:
        return {
          bg: 'bg-slate-700/20 text-slate-300 border-slate-600',
          label: '⚡ Normal',
          effect: '⭐'
        };
    }
  };

  const exprGfx = getExpressionGraphics();

  return (
    <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden p-6 relative">
      {/* Dynamic top bar with host metadata */}
      <div className="flex border-b border-slate-800 pb-4 mb-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl border bg-slate-950 shadow-inner [text-shadow:_0_2px_4px_rgba(0,0,0,0.5)]`}>
              {avatarEmoji}
            </div>
            {/* Expression Floating Badge bubble */}
            {!isLoading && text && (
              <span className="absolute -bottom-1 -right-1 text-sm select-none">
                {exprGfx.effect}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-sans font-bold text-white text-base leading-none">
              {characterName}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[10px] font-mono leading-none px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                moodType === 'motivation' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {moodType === 'motivation' ? 'Motivación' : 'Desmotivación'}
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-[10px] font-sans text-slate-400 capitalize">
                Relación: <span className="font-semibold text-slate-300">{relationshipLevelName.split(' / ')[0]}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Audio control & Refresh indicators */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="tts-toggle-btn"
            onClick={() => {
              const prev = isMuted;
              setIsMuted(!prev);
              if (prev) {
                // If turning sound on, speak immediately
                setTimeout(() => speakText(), 100);
              } else {
                window.speechSynthesis.cancel();
              }
            }}
            title={isMuted ? 'Activar lectura de voz' : 'Silenciar'}
            className={`p-2 rounded-lg border transition-all ${
              !isMuted 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 animate-bounce" />}
          </button>
        </div>
      </div>

      {/* Main dialogue container styled as pirate balloon speech */}
      <div className="relative min-h-[140px] bg-slate-950/70 border border-slate-850 rounded-xl p-5 flex flex-col justify-between">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 animate-pulse">
            <RefreshCw className="h-8 w-8 text-amber-500 animate-spin mb-3" />
            <p className="font-mono text-xs">{typedText}</p>
            <p className="text-[10px] mt-1 text-slate-600">Consultando con la Grand Line...</p>
          </div>
        ) : (
          <>
            <div className="prose prose-invert max-w-none">
              {/* Animated quotes block */}
              <p className="font-sans text-base md:text-lg text-slate-100 leading-relaxed font-normal italic pr-2">
                "{typedText}"
              </p>
            </div>

            {/* Expression Indicator Footer */}
            {text && (
              <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className={`px-2 py-0.5 rounded border ${exprGfx.bg}`}>
                  {exprGfx.label}
                </span>

                {!isMuted && (
                  <span className="text-amber-500 flex items-center gap-1">
                    <Volume2 className="h-3 w-3" /> Voz en español sintetizada
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Decorative anchors or background items */}
      <div className="absolute right-3 bottom-3 opacity-5 pointer-events-none text-7xl font-bold font-mono">
        {characterId === 'luffy' && '🍖'}
        {characterId === 'zoro' && '⚔️'}
        {characterId === 'robin' && '📖'}
        {characterId === 'hancock' && '💖'}
      </div>
    </div>
  );
}
