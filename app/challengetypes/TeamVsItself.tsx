import { Challenge, Team } from '@/utils/types';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
  teams: Team[];
};

export default function TeamVsItself({ challenge, gameId, teams }: Props) {
  if (teams.length < 1) {
    return <Text style={styles.warning}>Venter på lagtrekning...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.description}>
        Dette laget skal konkurrere mot seg selv:
      </Text>
      <Text style={styles.teamText}>{teams[0].teamName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  description: { fontSize: 16, textAlign: 'center', marginBottom: 12 },
  teamText: { fontSize: 20, marginVertical: 8 },
  warning: { textAlign: 'center', marginTop: 40, color: 'orange' },
});
