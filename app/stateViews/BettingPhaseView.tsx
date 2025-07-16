import OneVsOne from '@/app/challengetypes/OneVsOne';
import TeamVsItself from '@/app/challengetypes/TeamVsItself';
import TeamVsTeam from '@/app/challengetypes/TeamVsTeam';
import { supabase } from '@/supabase';
import { Challenge, Team } from '@/utils/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
  isHost: boolean;
  onNextPhaseRequested: () => void;
};

export default function BettingPhaseView({ challenge, gameId, isHost, onNextPhaseRequested }: Props) {
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  // Hent og trekk lag kun én gang
  useEffect(() => {
    const fetchAndSelectTeams = async () => {
      const { data, error } = await supabase
        .from('games')
        .select('teams')
        .eq('id', gameId)
        .single();

      if (error || !data?.teams) {
        console.error('Klarte ikke hente teams:', error);
        return;
      }

      const shuffled = [...data.teams].sort(() => Math.random() - 0.5);

      switch (challenge.type) {
        case '1v1':
        case 'Team-vs-Team':
          setSelectedTeams(shuffled.slice(0, 2));
          break;
        case 'Team-vs-itself':
          setSelectedTeams(shuffled.slice(0, 1));
          break;
        default:
          setSelectedTeams([]);
      }
    };

    if (isHost) {
      fetchAndSelectTeams();
    }
  }, [challenge, gameId, isHost]);

  const renderBettingComponent = () => {
    switch (challenge.type) {
      case '1v1':
        return <OneVsOne challenge={challenge} gameId={gameId} teams={selectedTeams} />;
      case 'Team-vs-Team':
        return <TeamVsTeam challenge={challenge} gameId={gameId} teams={selectedTeams} />;
      case 'Team-vs-itself':
        return <TeamVsItself challenge={challenge} gameId={gameId} teams={selectedTeams} />;
      default:
        return <Text style={styles.errorText}>Ukjent challenge-type</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {renderBettingComponent()}

      {isHost && (
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
    padding: 16,
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
