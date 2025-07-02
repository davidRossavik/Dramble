import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import { addPlayerToTeam, getGameByCode } from '@/utils/games';
import { Team } from '@/utils/types';

export default function GameLobby() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [gameId, setGameId] = useState<string>('');
  const [newPlayers, setNewPlayers] = useState<Record<string, string>>({});

  // Henter lagene fra Supabase
  const fetchTeams = async () => {
    const { data, error } = await getGameByCode(code);
    if (data) {
      setTeams(data.teams);
      setGameId(data.id);
    }
  };

  useEffect(() => {
    if (code) fetchTeams();
  }, [code]);

  const handleAddPlayer = async (teamName: string) => {
    const name = newPlayers[teamName]?.trim();
    if (!name) return;

    await addPlayerToTeam(gameId, teamName, {
      id: crypto.randomUUID(),
      name,
    });

    setNewPlayers(prev => ({ ...prev, [teamName]: '' }));
    fetchTeams(); // Oppdater visningen
  };

  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.codeText}>Spillkoden er: {code}</Text>

        {teams.map(team => (
          <View key={team.teamName} style={styles.teamBox}>
            <Text style={styles.teamName}>{team.teamName} (Leder: {team.leader})</Text>
            
            {team.players.map(player => (
              <Text key={player.id} style={styles.playerName}>• {player.name}</Text>
            ))}

            <TextInput
              placeholder="Ny spiller"
              value={newPlayers[team.teamName] || ''}
              onChangeText={text =>
                setNewPlayers(prev => ({ ...prev, [team.teamName]: text }))
              }
              style={styles.input}
            />
            <Button title="Legg til spiller" onPress={() => handleAddPlayer(team.teamName)} />
          </View>
        ))}
      </ScrollView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  teamBox: {
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    marginLeft: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    marginBottom: 5,
  },
});
