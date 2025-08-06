import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from "../supabase-functions/supabase.js";


export function subscribeToGameUpdates(gameCode: string, onUpdate: (updatedTeams: any[]) => void): RealtimeChannel {
  const channel = supabase
    .channel(`game-updates-${gameCode}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `code=eq.${gameCode}`,
      },
      (payload) => {
        const updated = payload.new;
        if (updated?.teams) {
          onUpdate(updated.teams);
        }
      }
    )
    .subscribe();

  return channel;
}

