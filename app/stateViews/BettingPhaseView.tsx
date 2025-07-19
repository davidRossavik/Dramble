import OneVsOne from '@/app/challengetypes/OneVsOne';
import TeamVsItself from '@/app/challengetypes/TeamVsItself';
import TeamVsTeam from '@/app/challengetypes/TeamVsTeam';
import { supabase } from '@/supabase';
import { getSelectedTeamsForChallenge, setSelectedTeamsForChallenge } from '@/utils/games';
import { Challenge, Team } from '@/utils/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
  challengeIndex: number;
  isHost: boolean;
  onNextPhaseRequested: () => void;
  isTransitioning?: boolean; // Ny prop for å vite om parent er i transition
};

export default function BettingPhaseView({ challenge, gameId, challengeIndex, isHost, onNextPhaseRequested, isTransitioning }: Props) {
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allTeams, setAllTeams] = useState<Team[]>([]);

  // Hent alle teams og valgte teams
  useEffect(() => {
    const fetchTeamsAndSelected = async () => {
      setIsLoading(true);
      
      // Hent alle teams
      const { data, error } = await supabase
        .from('games')
        .select('teams')
        .eq('id', gameId)
        .single();

      if (error || !data?.teams) {
        console.error('Klarte ikke hente teams:', error);
        setIsLoading(false);
        return;
      }

      setAllTeams(data.teams);

      // Hent valgte teams for denne challenge
      const existingSelectedTeams = await getSelectedTeamsForChallenge(gameId, challengeIndex);
      
      if (existingSelectedTeams.length > 0) {
        // Bruk eksisterende valgte teams
        setSelectedTeams(existingSelectedTeams);
      } else if (isHost) {
        // Host velger nye teams
        const shuffled = [...data.teams].sort(() => Math.random() - 0.5);
        let teamsToSelect: Team[] = [];

        switch (challenge.type) {
          case '1v1':
            // Velg 2 lag for 1v1 utfordringer (f.eks. Sokkekamp)
            // To spillere fra forskjellige lag konkurrerer mot hverandre
            teamsToSelect = shuffled.slice(0, 2);
            break;
          case 'Team-vs-Team':
            // Velg 2 lag for lag-mot-lag utfordringer
            teamsToSelect = shuffled.slice(0, 2);
            break;
          case 'Team-vs-itself':
            // Velg 1 lag for lag-interne utfordringer
            teamsToSelect = shuffled.slice(0, 1);
            break;
          default:
            teamsToSelect = [];
        }

        setSelectedTeams(teamsToSelect);
        
        // Lagre valgte teams i databasen
        await setSelectedTeamsForChallenge(gameId, challengeIndex, teamsToSelect);
      }

      setIsLoading(false);
    };

    fetchTeamsAndSelected();
  }, [challenge, gameId, challengeIndex, isHost]);

  // Realtime subscription for å lytte på endringer i selected_teams
  useEffect(() => {
    const channel = supabase
      .channel(`selected-teams-${gameId}-${challengeIndex}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        async (payload) => {
          if (payload.new.selected_teams) {
            const newSelectedTeams = payload.new.selected_teams[challengeIndex] || [];
            setSelectedTeams(newSelectedTeams);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, challengeIndex]);

  const renderBettingComponent = () => {
    // Ikke vis noen loading states hvis parent er i transition
    if (isTransitioning) {
      return null; // Returner ingenting, la parent håndtere loading
    }

    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.errorText}>Laster lag...</Text>
        </View>
      );
    }

    if (selectedTeams.length === 0) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.errorText}>Venter på at host velger lag...</Text>
        </View>
      );
    }

    switch (challenge.type) {
      case '1v1':
        return <OneVsOne challenge={challenge} gameId={gameId} challengeIndex={challengeIndex} teams={selectedTeams} allTeams={allTeams} />;
      case 'Team-vs-Team':
        return <TeamVsTeam challenge={challenge} gameId={gameId} challengeIndex={challengeIndex} teams={selectedTeams} allTeams={allTeams} />;
      case 'Team-vs-itself':
        return <TeamVsItself challenge={challenge} gameId={gameId} challengeIndex={challengeIndex} teams={selectedTeams} allTeams={allTeams} />;
      default:
        return <Text style={styles.errorText}>Ukjent challenge-type</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {renderBettingComponent()}

      {isHost && selectedTeams.length > 0 && (
        <Text onPress={onNextPhaseRequested} style={styles.startButton}>
          Start Challenge
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
  },
  startButton: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#2f7a4c',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
});
