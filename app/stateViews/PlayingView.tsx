import { supabase } from '@/supabase';
import { Challenge } from '@/utils/types';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';

export default function PlayingView({challenge, gameId,}: {
  challenge: Challenge;
  gameId: string;
}) {
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);

  const handleSetWinner = (team: string) => {
    setSelectedWinner(team);
  };

  const handleNext = async () => {
    // Her kan du evt. lagre vinneren til Supabase (ikke vist her)
    const { error } = await supabase
      .from('games')
      .update({ challenge_state: 'finished' })
      .eq('id', gameId);

    if (error) {
      console.error('Feil ved oppdatering av challenge_state:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>🔔 Challenge pågår!</Text>

      <Button title="Lag A vant" onPress={() => handleSetWinner('Lag A')} />
      <Button title="Lag B vant" onPress={() => handleSetWinner('Lag B')} />

      {selectedWinner && (
        <Text style={{ marginVertical: 10 }}>
          Valgt vinner: {selectedWinner}
        </Text>
      )}

      <Button title="Neste" onPress={handleNext} />
    </View>
  );
}
