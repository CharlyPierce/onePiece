import React from 'react';
import { Gift } from '../types';
import { Sparkles, Check, GiftIcon } from 'lucide-react';

interface OfferingDrawerProps {
  currentGifts: Gift[];
  selectedGiftId: string | undefined;
  onSelectGift: (giftId: string | undefined) => void;
  accentTextColor: string;
}

export default function OfferingDrawer({
  currentGifts,
  selectedGiftId,
  onSelectGift,
  accentTextColor,
}: OfferingDrawerProps) {
  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
        <GiftIcon className="h-16 w-16" />
      </div>

      <h4 className="font-sans font-bold text-white text-base flex items-center gap-2 mb-3">
        <GiftIcon className={`h-4.5 w-4.5 ${accentTextColor}`} />
        Ofrendas y Sobornos
      </h4>
      
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Ofrece un objeto especial a tu anfitrión para ganarte su favor inmediato e influenciar drásticamente su próximo comentario.
      </p>

      <div className="space-y-3">
        {currentGifts.map((gift) => {
          const isSelected = selectedGiftId === gift.id;
          return (
            <button
              type="button"
              id={`gift-${gift.id}`}
              key={gift.id}
              onClick={() => onSelectGift(isSelected ? undefined : gift.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-850 hover:border-slate-750 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform">
                  {gift.emoji}
                </span>
                <div>
                  <h5 className="font-sans font-bold text-sm text-slate-100 flex items-center gap-1.5 leading-none">
                    {gift.name}
                    {isSelected && <Sparkles className="h-3 w-3 text-amber-500 animate-spin" />}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-1 mr-2 leading-tight">
                    {gift.description}
                  </p>
                </div>
              </div>

              <div className={`h-6 w-6 rounded-full flex items-center justify-center border transition-all ${
                isSelected 
                  ? 'bg-amber-500 border-transparent text-slate-950' 
                  : 'border-slate-800 bg-slate-900 text-transparent hover:border-slate-600'
              }`}>
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
            </button>
          );
        })}
      </div>

      {selectedGiftId && (
        <div className="mt-3 text-[11px] text-amber-500 font-medium text-center bg-amber-500/5 py-1.5 rounded-lg border border-amber-500/20 animate-pulse">
          ⚡ Soborno activo: ¡Efecto desbloqueado para la siguiente consulta!
        </div>
      )}
    </div>
  );
}
