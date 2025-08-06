import { supabase } from '../supabase-functions/supabase.js';
import { updateBalances } from './games';

export async function submitBet(gameId: string, teamName: string, challengeIndex: number, amount: number, betOn: string) {
  // Sjekk om laget allerede har plassert et bet
  const hasPlacedBet = await hasTeamPlacedBet(gameId, teamName, challengeIndex);
  if (hasPlacedBet) {
    return { error: 'Du har allerede plassert et veddemål for denne runden' };
  }

  // Først, hent nåværende balances
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('balances')
    .eq('id', gameId)
    .single();

  if (gameError || !game) {
    console.error('Feil ved henting av balances:', gameError);
    return { error: 'Kunne ikke hente balances' };
  }

  const currentBalances = game.balances || {};
  const teamBalance = currentBalances[teamName] || 0;

  // Sjekk om laget har nok balance
  if (teamBalance < amount) {
    return { error: 'Ikke nok balance for dette veddemålet' };
  }

  // Oppdater balance ved å trekke fra innsatsen
  const updatedBalances = {
    ...currentBalances,
    [teamName]: teamBalance - amount
  };

  // Oppdater balances i databasen
  const { error: balanceError } = await updateBalances(gameId, updatedBalances);
  if (balanceError) {
    console.error('Feil ved oppdatering av balances:', balanceError);
    return { error: 'Kunne ikke oppdatere balances' };
  }

  // Deretter, send inn bettet
  const { error } = await supabase.from('bets').insert({
    game_id: gameId,
    team_name: teamName,
    challenge_index: challengeIndex,
    amount,
    bet_on: betOn,
  });

  if (error) {
    console.error('Feil ved innsending av bet:', error.message);
    // Hvis bet feilet, tilbakestill balance
    const { error: rollbackError } = await updateBalances(gameId, currentBalances);
    if (rollbackError) {
      console.error('Feil ved tilbakestilling av balance:', rollbackError);
    }
    return { error };
  }

  return { error: null };
}

// Ny funksjon for å hente betting-resultater
export async function getBettingResults(gameId: string, challengeIndex: number, winner: string) {
  const { data: bets, error } = await supabase
    .from('bets')
    .select('*')
    .eq('game_id', gameId)
    .eq('challenge_index', challengeIndex);

  if (error) {
    console.error('Feil ved henting av bets: ', error);
    return [];
  }

  return bets.map(bet => ({
    teamName: bet.team_name,
    betOn: bet.bet_on,
    amount: bet.amount,
    isCorrect: bet.bet_on === winner,
    delta: bet.bet_on === winner ? bet.amount : -bet.amount
  }));
}

// Ny funksjon for å oppdatere balances etter runde
export async function updateBalancesAfterRound(gameId: string, challengeIndex: number) {
  try {
    // Hent alle bets for denne runden
    const { data: bets, error } = await supabase
      .from('bets')
      .select('*')
      .eq('game_id', gameId)
      .eq('challenge_index', challengeIndex);

    if (error) {
      console.error('Feil ved henting av bets:', error);
      return { error };
    }

    if (!bets || bets.length === 0) {
      console.log('Ingen bets funnet for denne runden');
      return { error: null };
    }

    // Balances er allerede oppdatert når bets ble sendt inn
    // Vi trenger ikke gjøre noe mer her siden balances oppdateres umiddelbart
    console.log('Balances allerede oppdatert når bets ble sendt inn');
    return { error: null };
  } catch (error) {
    console.error('Uventet feil ved oppdatering av balances:', error);
    return { error };
  }
}

// Ny funksjon for å sjekke om et lag allerede har plassert et bet
export async function hasTeamPlacedBet(gameId: string, teamName: string, challengeIndex: number) {
  const { data: bets, error } = await supabase
    .from('bets')
    .select('*')
    .eq('game_id', gameId)
    .eq('team_name', teamName)
    .eq('challenge_index', challengeIndex);

  if (error) {
    console.error('Feil ved sjekking av eksisterende bet:', error);
    return false;
  }

  return bets && bets.length > 0;
}
