import { supabase } from '@/supabase';
import { getBettingResults } from '@/utils/bets';
import { getSelectedTeamsForChallenge, getWinnerForChallenge } from '@/utils/games';
import { Runde, RundeState } from '@/utils/types';

/**
 * Henter alt nødvendig data for en runde i parallell
 */
export async function fetchRunde(gameId: string, challengeIndex: number): Promise<Runde> {
  try {
    // Hent spilldata og challenge
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      throw new Error(`Kunne ikke hente spill: ${gameError?.message}`);
    }

    const challenge = game.challenges?.[challengeIndex];
    if (!challenge) {
      throw new Error(`Ingen challenge funnet for index: ${challengeIndex}`);
    }

    // Hent alle nødvendige data i parallell
    const [selectedTeams, winner, betResults] = await Promise.all([
      getSelectedTeamsForChallenge(gameId, challengeIndex),
      getWinnerForChallenge(gameId, challengeIndex),
      getBettingResults(gameId, challengeIndex, game.challenge_state === 'finished' ? 'dummy' : ''),
    ]);

    // Opprett rundeobjekt
    const runde: Runde = {
      challenge,
      challengeIndex,
      teams: game.teams || [],
      selectedTeams: selectedTeams || [],
      winner,
      betResults: betResults || [],
      state: game.challenge_state as RundeState,
    };

    return runde;
  } catch (error) {
    console.error('Feil ved henting av runde:', error);
    throw error;
  }
}

/**
 * Oppdaterer runde state i databasen
 */
export async function updateRundeState(gameId: string, newState: RundeState): Promise<void> {
  try {
    const { error } = await supabase
      .from('games')
      .update({ challenge_state: newState })
      .eq('id', gameId);

    if (error) {
      throw new Error(`Feil ved oppdatering av runde state: ${error.message}`);
    }
  } catch (error) {
    console.error('Feil ved updateRundeState:', error);
    throw error;
  }
}

/**
 * Går til neste runde (øker challenge index og setter state til betting)
 */
export async function advanceToNextRound(gameId: string): Promise<void> {
  try {
    // Øk challenge index
    const { data: newIndex, error: rpcError } = await supabase.rpc('increment_index', { gid: gameId });
    
    if (rpcError || typeof newIndex !== 'number') {
      throw new Error(`Feil ved øking av challenge index: ${rpcError?.message}`);
    }

    // Oppdater til betting state med ny index
    const { error: updateError } = await supabase
      .from('games')
      .update({
        challenge_state: 'betting',
        current_challenge_index: newIndex,
      })
      .eq('id', gameId);

    if (updateError) {
      throw new Error(`Feil ved oppdatering til neste runde: ${updateError.message}`);
    }
  } catch (error) {
    console.error('Feil ved advanceToNextRound:', error);
    throw error;
  }
}

/**
 * Hjelpefunksjon for å sjekke om en runde er klar til å vises
 */
export function isRundeReady(runde: Runde | null, isTransitioning: boolean): boolean {
  if (!runde || isTransitioning) {
    return false;
  }

  // Sjekk at alle nødvendige data er tilgjengelige
  if (!runde.challenge || !runde.teams) {
    return false;
  }

  // For betting-fase: sjekk at selectedTeams er valgt
  if (runde.state === 'betting' && runde.selectedTeams.length === 0) {
    return false;
  }

  // For playing-fase: sjekk at selectedTeams er valgt
  if (runde.state === 'playing' && runde.selectedTeams.length === 0) {
    return false;
  }

  // For finished-fase: sjekk at winner er valgt
  if (runde.state === 'finished' && !runde.winner) {
    return false;
  }

  return true;
} 