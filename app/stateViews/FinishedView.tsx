import Button from '@/components/Button';
import { Challenge } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
  onNextPhaseRequested: () => void;
};

export default function FinishedView({ challenge, gameId, onNextPhaseRequested }: Props) {
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const checkIfHost = async () => {
      const name = await AsyncStorage.getItem('playerName');
      setIsHost(name === 'Host');
    };
    checkIfHost();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Drikk!</Text>
      {isHost && (
        <Button
          label="Neste runde"
          onPress={onNextPhaseRequested}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B0303',
    padding: 20,
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F0E3C0',
    marginBottom: 20,
  },
  button: {
    marginTop: 30,
    minWidth: 150,
  },
});
