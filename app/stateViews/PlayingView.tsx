import { Challenge } from '@/utils/types';
import { StyleSheet, Text, View } from 'react-native';

export default function PlayingView({ challenge, gameId }: { challenge: Challenge, gameId: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Nå konkurrerer lagene!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#032B0A',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F0E3C0',
  },
});