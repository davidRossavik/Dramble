import OneVsOne from '@/app/challengetypes/OneVsOne';
import TeamVsItself from '@/app/challengetypes/TeamVsItself';
import TeamVsTeam from '@/app/challengetypes/TeamVsTeam';
import { setSelectedTeamsForChallenge } from '@/utils/games';
import { Runde } from '@/utils/types';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  runde: Runde;
  gameId: string;
  isHost: boolean;
  onNextPhaseRequested: () => void;
  isTransitioning?: boolean;
};

export default function BettingPhaseView({ runde, gameId, isHost, onNextPhaseRequested, isTransitioning }: Props) {
  const [isSelectingTeams, setIsSelectingTeams] = useState(false);

  // Ikke vis noen loading states hvis parent er i transition
  if (isTransitioning) {
    return null; // Returner ingenting, la parent håndtere loading
  }

  // Hvis ingen lag er valgt og bruker er host, la dem velge lag
  if (runde.selectedTeams.length === 0 && isHost) {
    const handleSelectTeams = async () => {
      setIsSelectingTeams(true);
      try {
        const shuffled = [...runde.teams].sort(() => Math.random() - 0.5);
        let teamsToSelect: typeof runde.teams = [];

        switch (runde.challenge.type) {
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

        // Lagre valgte teams i databasen
        await setSelectedTeamsForChallenge(gameId, runde.challengeIndex, teamsToSelect);
      } catch (error) {
        console.error('Feil ved valg av lag:', error);
      } finally {
        setIsSelectingTeams(false);
      }
    };

    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.errorText}>Velg lag for denne utfordringen</Text>
          <Text onPress={handleSelectTeams} style={styles.selectButton}>
            {isSelectingTeams ? 'Velger lag...' : 'Velg lag'}
          </Text>
        </View>
      </View>
    );
  }

  // Hvis ingen lag er valgt og bruker ikke er host, vent på host
  if (runde.selectedTeams.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.errorText}>Venter på at host velger lag...</Text>
        </View>
      </View>
    );
  }

  // Render betting komponent basert på challenge type
  const renderBettingComponent = () => {
    switch (runde.challenge.type) {
      case '1v1':
        return <OneVsOne runde={runde} gameId={gameId} challengeIndex={runde.challengeIndex} teams={runde.selectedTeams} allTeams={runde.teams} />;
      case 'Team-vs-Team':
        return <TeamVsTeam runde={runde} gameId={gameId} challengeIndex={runde.challengeIndex} teams={runde.selectedTeams} allTeams={runde.teams} />;
      case 'Team-vs-itself':
        return <TeamVsItself runde={runde} gameId={gameId} challengeIndex={runde.challengeIndex} teams={runde.selectedTeams} allTeams={runde.teams} />;
      default:
        return <Text style={styles.errorText}>Ukjent challenge-type</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {renderBettingComponent()}

      {isHost && runde.selectedTeams.length > 0 && (
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
  selectButton: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#EEB90E',
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
