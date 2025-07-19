import { Challenge } from '@/utils/types';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
  onNextPhaseRequested: () => void;
};

export default function PlayingView({ challenge, gameId, onNextPhaseRequested }: Props) {
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Challenge pågår!</Text>

      <View style={styles.buttons}>
        <Button title="Lag A vant" onPress={() => setSelectedWinner('Lag A')} />
        <Button title="Lag B vant" onPress={() => setSelectedWinner('Lag B')} />
      </View>

      <Text>{selectedWinner && `Valgt: ${selectedWinner}`}</Text>

      <Button
        title="Neste"
        onPress={onNextPhaseRequested}
        disabled={!selectedWinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
});
