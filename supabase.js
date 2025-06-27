import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jsjliepluwxvrrtceghu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzamxpZXBsdXd4dnJydGNlZ2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjQ0MzYsImV4cCI6MjA2NDU0MDQzNn0.B9qpCNjDQJpOO1DcTO6EHA6cHmxEFA2LIqnXUSrgLaU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



//henter alle rader med spill i "games" tabellen
export async function getAllGames() {
    const{data, error} = await supabase.from("games").select("*");
    if (error) {
        console.log("feil ved innhenting av games data: ", error.message)
        return [];
    }

    return data;
}




export async function addPlayerToGame(code, player) {
  // Henter spillet først
    const { data: game, error } = await supabase
        .from('games')
        .select('id, players')
        .eq('code', code)
        .single();

    //returnerer error slik at dersom det er feil så kan man skrive ut enkelt
    if (error || !game) {
        return { data: null, error: 'Fant ikke spill med denne koden' };
    }

    // Sjekk om navnet er ledig
    const currentPlayers = game.players ?? [];
    const nameTaken = currentPlayers.some(p => p.name === player.name);
    if (nameTaken) {
        return { data: null, error: 'Navnet er allerede i bruk' };
    }

    // Oppdater arrayen lokalt og push til supabase
    const updatedPlayers = [...currentPlayers, player];

    const { data, error: updateError } = await supabase
        .from('games')
        .update({ players: updatedPlayers })
        .eq('id', game.id)
        .select('players')
        .single();

    if (updateError) {
        return { data: null, error: 'Feil ved oppdatering av spill' };
    }

    return { data, error: null };
}