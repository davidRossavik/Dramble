import { Challenge } from '@/utils/types';
import { StyleSheet, Text, View } from 'react-native';

export default function FinishedView({ challenge, gameId }: { challenge: Challenge, gameId: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Drikk!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B0303',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F0E3C0',
  },
});
