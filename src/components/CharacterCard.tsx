import React from 'react';
import { Character } from '../types';
import { Sparkles, Trophy, ShieldAlert, Award } from 'lucide-react';

interface CharacterCardProps {
  key?: any;
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
  relationshipLevel: number;
  onRelationshipChange: (level: number) => void;
}

export default function CharacterCard({
  character,
  isSelected,
  onSelect,
  relationshipLevel,
  onRelationshipChange,
}: CharacterCardProps) {
  // Mock custom stats per character to make it extremely charming and lore-compliant
  const getStats = (id: string) => {
    switch (id) {
      case 'luffy':
        return [
          { label: 'Hambre de Carne', val: '100%' },
          { label: 'Voluntad / Haki', val: '100%' },
          { label: 'Astucia Académica', val: '5%' },
        ];
      case 'zoro':
        return [
          { label: 'Sentido de Orientación', val: '0%' },
          { label: 'Voluntad de Acero', val: '100%' },
          { label: 'Ganas de Dormir y Sake', val: '95%' },
        ];
      case 'robin':
        return [
          { label: 'Lógica Arqueológica', val: '100%' },
          { label: 'Humor Negro y Macabro', val: '95%' },
          { label: 'Misterio / Serenidad', val: '90%' },
        ];
      case 'hancock':
        return [
          { label: 'Belleza Absoluta', val: '1000%' },
          { label: 'Arrogancia / Pose', val: '98%' },
          { label: 'Nervios ante Luffy', val: '100%' },
        ];
      default:
        return [];
    }
  };

  const stats = getStats(character.id);

  return (
    <div
      id={`char-card-${character.id}`}
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 bg-slate-900 p-6 transition-all duration-300 cursor-pointer ${
        isSelected
          ? `border-transparent shadow-xl ring-4 ring-offset-2 ring-offset-slate-950 scale-[1.01]`
          : 'border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
      }`}
      style={{
        boxShadow: isSelected ? '0 10px 30px -10px rgba(0,0,0,0.7)' : undefined,
      }}
      onClick={onSelect}
    >
      {/* Decorative gradient background based on character */}
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-br ${character.accentColor} opacity-[0.08]`}
      />

      {/* Selected indicator badge */}
      {isSelected && (
        <span className="absolute top-3 right-3 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      )}

      {/* Header section with emoji or head representation */}
      <div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-850 text-3xl shadow-inner border border-slate-700">
            {character.avatar}
          </div>
          <div>
            <h3 className="font-sans font-bold text-xl text-white tracking-tight leading-tight">
              {character.name}
            </h3>
            <span className={`text-xs font-mono font-medium tracking-wide ${character.textColor} uppercase`}>
              {character.id === 'luffy' && 'Capitán'}
              {character.id === 'zoro' && 'Espadachín'}
              {character.id === 'robin' && 'Arqueóloga'}
              {character.id === 'hancock' && 'Emperatriz'}
            </span>
          </div>
        </div>

        {/* Tagline & short description */}
        <p className="mt-4 text-xs font-medium italic text-slate-400 leading-relaxed">
          "{character.tagline}"
        </p>

        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          {character.description}
        </p>

        {/* Custom Lore stats bars */}
        <div className="mt-4 space-y-2 border-t border-slate-800/60 pt-3">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Atributos de Tripulación
          </span>
          <div className="space-y-1">
            {stats.map((st, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-sans">{st.label}</span>
                <span className={`font-mono font-bold text-white`}>{st.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Relationship Selector */}
      <div className="mt-5 border-t border-slate-800/80 pt-4" onClick={(e) => e.stopPropagation()}>
        <label className="text-xs font-mono font-bold tracking-wider text-slate-400 block mb-2 uppercase flex items-center gap-1.5">
          <Award className={`h-3.5 w-3.5 ${character.textColor}`} /> {character.traitTitle}
        </label>
        
        {/* Step Buttons */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {character.traits.map((trait, index) => {
            const isLevelSelected = relationshipLevel === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onRelationshipChange(index)}
                className={`text-[10px] font-sans font-medium py-1.5 px-1 rounded-md text-center transition-all ${
                  isLevelSelected
                    ? `bg-slate-800 text-white shadow-sm font-bold border border-slate-700`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {trait.split(' / ')[0].split('¡¿').pop()?.split('?!')[0] || trait}
              </button>
            );
          })}
        </div>
        
        <p className="mt-2 text-[11px] text-slate-400 italic text-center font-sans tracking-tight">
          Trato de hoy: <span className={`font-bold not-italic font-mono ${character.textColor}`}>{character.traits[relationshipLevel]}</span>
        </p>
      </div>
    </div>
  );
}
