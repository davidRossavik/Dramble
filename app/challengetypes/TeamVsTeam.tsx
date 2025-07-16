import { Challenge, Team } from '@/utils/types';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
  teams: Team[];
};

export default function TeamVsTeam({ challenge, gameId, teams }: Props) {
  if (teams.length < 2) {
    return <Text style={styles.warning}>Venter på lagtrekning...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.teamText}>{teams[0].teamName}</Text>
      <Text style={styles.vs}>VS</Text>
      <Text style={styles.teamText}>{teams[1].teamName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  teamText: { fontSize: 20, marginVertical: 8 },
  vs: { fontSize: 18, marginVertical: 4 },
  warning: { textAlign: 'center', marginTop: 40, color: 'orange' },
});
