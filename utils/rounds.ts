import { supabase } from '@/supabase';
import { getBettingResults } from '@/utils/bets';
import { getSelectedTeamsForChallenge, getWinnerForChallenge } from '@/utils/games';
import { BetResult, Runde, RundeState, Team } from '@/utils/types';

/**
 * Velger lag automatisk basert på challenge type
 */
export function selectTeamsForChallenge(teams: Team[], challengeType: string): Team[] {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  
  switch (challengeType) {
    case '1v1':
      return shuffled.slice(0, 2);
    case 'Team-vs-Team':
      return shuffled.slice(0, 2);
    case 'Team-vs-itself':
      return shuffled.slice(0, 1);
    default:
      return [];
  }
}

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
    const [selectedTeams, winner] = await Promise.all([
      getSelectedTeamsForChallenge(gameId, challengeIndex),
      getWinnerForChallenge(gameId, challengeIndex),
    ]);

    // Hent betting-resultater for alle faser (ikke kun finished)
    // Under betting viser vi alle bets, under finished viser vi resultater med isCorrect
    let betResults: BetResult[] = [];
    if (game.challenge_state === 'betting') {
      // Under betting: hent alle bets uten å sjekke isCorrect
      const { data: bets, error } = await supabase
        .from('bets')
        .select('*')
        .eq('game_id', gameId)
        .eq('challenge_index', challengeIndex);
      
      if (!error && bets) {
        betResults = bets.map(bet => ({
          teamName: bet.team_name,
          betOn: bet.bet_on,
          amount: bet.amount,
          isCorrect: false, // Ikke relevant under betting
          delta: 0 // Ikke relevant under betting
        }));
      }
    } else if (game.challenge_state === 'finished' && winner) {
      // Under finished: hent resultater med isCorrect basert på vinner
      betResults = await getBettingResults(gameId, challengeIndex, winner);
    }

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

    // Hent spilldata for å velge lag automatisk
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('teams, challenges')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      throw new Error(`Feil ved henting av spilldata: ${gameError?.message}`);
    }

    const teams = game.teams || [];
    const challenges = game.challenges || [];
    const newChallenge = challenges[newIndex];

    if (!newChallenge) {
      // Ingen flere challenges igjen, sett status til 'finished'
      await supabase
        .from('games')
        .update({ status: 'finished' })
        .eq('id', gameId);
      console.log('Spillet er ferdig, status satt til finished');
      return;
    }

    // Velg lag basert på challenge type
    const teamsToSelect = selectTeamsForChallenge(teams, newChallenge.type);

    // Hent eksisterende selected_teams og oppdater for ny runde
    const { data: existingData } = await supabase
      .from('games')
      .select('selected_teams')
      .eq('id', gameId)
      .single();

    const existingSelectedTeams = existingData?.selected_teams || [];
    const updatedSelectedTeams = [...existingSelectedTeams];
    
    // Sørg for at array er lang nok
    while (updatedSelectedTeams.length <= newIndex) {
      updatedSelectedTeams.push([]);
    }
    
    // Sett valgte lag for den nye runden
    updatedSelectedTeams[newIndex] = teamsToSelect;

    // Oppdater til betting state med ny index og valgte lag
    const { error: updateError } = await supabase
      .from('games')
      .update({
        challenge_state: 'betting',
        current_challenge_index: newIndex,
        selected_teams: JSON.stringify(updatedSelectedTeams)
      })
      .eq('id', gameId);

    if (updateError) {
      throw new Error(`Feil ved oppdatering til neste runde: ${updateError.message}`);
    }

    console.log(`Gått til runde ${newIndex}, valgte lag:`, teamsToSelect);
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

  // For playing-fase: sjekk bare at selectedTeams er valgt
  // Vinner velges underveis i playing-fasen, så den er ikke påkrevd i starten
  if (runde.state === 'playing' && runde.selectedTeams.length === 0) {
    return false;
  }

  // For finished-fase: sjekk at winner er valgt
  if (runde.state === 'finished' && !runde.winner) {
    return false;
  }

  return true;
} 