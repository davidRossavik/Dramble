import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import { addPlayerToTeam, getGameByCode, removePlayerFromTeam, removeTeam } from '@/utils/games';
import { subscribeToGameUpdates } from '@/utils/realtime';
import { Team } from '@/utils/types';
import { supabase } from "../supabase";



export default function GameLobby() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [gameId, setGameId] = useState<string>('');
  const [newPlayers, setNewPlayers] = useState<Record<string, string>>({});
  const [localTeamName, setLocalTeamName] = useState('');
  const [playerName, setPlayerName] = useState('');



  useEffect(() => {
    const loadTeamInfo = async () => {
      const storedCode = await AsyncStorage.getItem('gameCode');
      const storedTeam = await AsyncStorage.getItem('teamName');
      const storedPlayer = await AsyncStorage.getItem('playerName');

      if (!storedCode || !storedTeam || !storedPlayer) {
        // Noe mangler – send tilbake til forsiden eller vis feilmelding
        router.replace('/');
        return;
      }

      setLocalTeamName(storedTeam);
      setPlayerName(storedPlayer);
    };

    loadTeamInfo();
  }, []);


  useEffect(() => {
  if (localTeamName && teams.length > 0) {
    const found = teams.find(t => t.teamName === localTeamName);
    if (!found) {
      alert('Laget ditt ble fjernet av hosten 😢');
      router.replace('/');
      }
    }
  }, [teams, localTeamName]);



  useEffect(() => {
    if (!code) return;

    const channel = subscribeToGameUpdates(code as string, (updatedTeams) => {
      setTeams(updatedTeams);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);



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

    const team = teams.find(t => t.teamName === teamName);
    if (!team) return;

    const nameTaken = team.players.some(p => p.name.toLowerCase() === name.toLowerCase());
    if (nameTaken) {
      alert('Det finnes allerede en spiller med det navnet på laget');
    return;
    }

    await addPlayerToTeam(gameId, teamName, {
      id: crypto.randomUUID(),
      name,
    });

    setNewPlayers(prev => ({ ...prev, [teamName]: '' }));
  };



  const handleRemovePlayer = async (teamName: string, playerId: string) => {
    if (!gameId) return;
      const { error } = await removePlayerFromTeam(gameId, teamName, playerId);
    if (error) console.log("Feil ved fjerning:", error);
  };

  const handleRemoveTeam = async (teamName: string) => {
    if (!gameId) return;
      const { error } = await removeTeam(gameId, teamName);
    if (error) console.log("Feil ved fjerning av lag:", error);
  };



  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.codeText}>Spillkoden er: {code}</Text>

        {teams.map(team => (
          <View key={team.teamName} style={styles.teamBox}>
            <Text style={styles.teamName}>{team.teamName} (Leder: {team.leader})</Text>
            
            {team.players.map(player => (
              <View key={player.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>• {player.name}</Text>
                <Button title="Fjern" onPress={() => handleRemovePlayer(team.teamName, player.id)} />
              </View>
            ))}

            {playerName === "Host" && (
              <Button title="Fjern lag" onPress={() => handleRemoveTeam(team.teamName)} color="red" />
            )}

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
