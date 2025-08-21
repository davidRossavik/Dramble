import { supabase } from "../supabase-functions/supabase.js";
import { getRandomChallengesWithPlayers } from './challenges';
import { selectTeamsForChallenge } from './rounds';


export async function updateGameStatus(gameId: string, status: 'waiting' | 'playing' | 'finished') {
  const { error } = await supabase
    .from('games')
    .update({ status })
    .eq('id', gameId);

  if (error) {
    console.error('Feil ved oppdatering av game status:', error.message);
    return { error: 'Kunne ikke oppdatere status' };
  }

  return { error: null };
}







//kjøres når hosten trykker på start spill første gang
export async function initializeGame(gameId: string) {
  const challenges = await getRandomChallengesWithPlayers(gameId, 10);

  // Hent alle lag for å velge automatisk
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('teams')
    .eq('id', gameId)
    .single();

  if (gameError || !game) {
    console.error('Feil ved henting av lag:', gameError);
    return { error: gameError };
  }

  const teams = game.teams || [];
  
  // Velg lag basert på første challenge type
  const firstChallenge = challenges[0];
  const teamsToSelect = selectTeamsForChallenge(teams, firstChallenge.type);

  // Oppdater spill med challenges og valgte lag i én operasjon
  const { error } = await supabase
    .from('games')
    .update({
      challenges,
      current_challenge_index: 0,
      challenge_state: 'betting',
      selected_teams: JSON.stringify(teamsToSelect)
    })
    .eq('id', gameId);
    

  if (error) {
    console.error('Feil ved start:', error.message);
  }

  return { error };
}