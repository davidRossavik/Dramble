import OneVsOne from '@/app/challengetypes/OneVsOne';
import TeamVsItself from '@/app/challengetypes/TeamVsItself';
import TeamVsTeam from '@/app/challengetypes/TeamVsTeam';
import { Challenge } from '@/utils/types';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
  isHost: boolean;
  onNextPhaseRequested: () => void;
};

export default function BettingPhaseView({ challenge, gameId, isHost, onNextPhaseRequested }: Props) {
  const renderBettingComponent = () => {
    switch (challenge.type) {
      case '1v1':
        return <OneVsOne challenge={challenge} gameId={gameId} />;
      case 'Team-vs-Team':
        return <TeamVsTeam challenge={challenge} gameId={gameId} />;
      case 'Team-vs-itself':
        return <TeamVsItself challenge={challenge} gameId={gameId} />;
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
