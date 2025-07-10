import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { addPlayerToTeam, getGameByCode, removePlayerFromTeam, removeTeam } from '@/utils/games';
import { subscribeToGameUpdates } from '@/utils/realtime';
import { setInitialChallenge, updateGameStatus } from '@/utils/status';
import { Team } from '@/utils/types';
import { supabase } from '../supabase';

export default function GameLobby() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();


  // Bilder // 
  const x_button = require('@/assets/images/X-button.png');
  const remove_button = require('@/assets/images/removeButton.png');
  const add_button = require('@/assets/images/addButton.png');
  // Bilder // 


  // State og referanser //
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameId, setGameId] = useState<string>('');
  const [newPlayers, setNewPlayers] = useState<Record<string, string>>({});
  const [localTeamName, setLocalTeamName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const statusChannelRef = useRef<any>(null);
  // State og Referanser //


  // Last inn lagret info fra AsyncStorage ved første lasting //
  useEffect(() => {
    const loadTeamInfo = async () => {
      const storedCode = await AsyncStorage.getItem('gameCode');
      const storedTeam = await AsyncStorage.getItem('teamName');
      const storedPlayer = await AsyncStorage.getItem('playerName');

      if (!storedCode || !storedTeam || !storedPlayer) {
        router.replace('/');
        return;
      }

      setLocalTeamName(storedTeam);
      setPlayerName(storedPlayer);
    };

    loadTeamInfo();
  }, []);
  // Last inn lagret info fra AsyncStorage ved første lasting //


  // Setter opp sanntids-abonnement //
  const subscribeToGameStatus = (id: string) => {
    const channel = supabase
      .channel(`game-status-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          if (newStatus === 'playing' && playerName !== 'Host') {
            router.replace('/questionPage');
          }
        }
      )
      .subscribe();

    return channel;
  };
  // Setter opp sanntids-abonnement //


  // Henter lagene fra Supabase + gameId + setter opp status-lytter
  
  // OPPDATERER AKTIVE LAG//
  const fetchTeams = async () => {
    const { data, error } = await getGameByCode(code);
    if (data) {
      setTeams(data.teams);
      setGameId(data.id);
      const channel = subscribeToGameStatus(data.id);
      statusChannelRef.current = channel;
    }
  };

  useEffect(() => { // Henter lag og gameId fra database når spillkoden blir tilgjengelig
    if (code) fetchTeams();
  }, [code]);

  useEffect(() => { // Sjekker at ditt lag fortsatt finnes i spillet
    if (localTeamName && teams.length > 0) {
      const found = teams.find(t => t.teamName === localTeamName);
      if (!found) {
        alert('Laget ditt ble fjernet av hosten 😢');
        router.replace('/');
      }
    }
  }, [teams, localTeamName]);

  useEffect(() => { // Setter opp sanntids-abonnement for oppdateringer i laglisten
    if (!code) return;

    const channel = subscribeToGameUpdates(code as string, (updatedTeams) => {
      setTeams(updatedTeams);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);

  useEffect(() => { // Fjerner sanntids-abonnement på spillstatus når komponenten avmonteres
    return () => {
      if (statusChannelRef.current) {
        supabase.removeChannel(statusChannelRef.current);
      }
    };
  }, []);
  // OPPDATERER AKTIVE LAG //


  // LEGG TIL SPILLER //
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
      id: generateId(), // eller crypto.randomUUID()
      name,
    });

    setNewPlayers(prev => ({ ...prev, [teamName]: '' }));
  };
  // LEGG TIL SPILLER //


  // FJERN SPILLER //
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
  // FJERN SPILLER //

  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Spillkode */}
        <Text style={styles.codeText}>SPILLKODE: {code}</Text>

        {/* Lagnavn Og Øverste Kolonne */}
        {teams.map(team => (
          <View key={team.teamName} style={styles.teamBox}>
            <View style={styles.teamHeader}>
              <View style={styles.centeredTextWrapper}>
                <Text style={styles.teamName}>
                  {team.teamName} (Leder: {team.leader})
                </Text>
              </View>
              {playerName === 'Host' && (<Button imageSource={x_button} imageStyle={styles.x_button} onPress={() => handleRemoveTeam(team.teamName)}/>)}
            </View>
            
            {/* Lagmedlemmer */}
            <View style={styles.teamContent}>
              {team.players.map(player => (
                <View key={player.id} style={{ flexDirection: 'row', paddingVertical: 5}} >
                  <View style={styles.centeredTextWrapper}>
                    <Text style={styles.playerName}> {player.name}</Text>
                  </View>
                  <Button imageSource={remove_button} imageStyle={styles.remove_button} onPress={() => handleRemovePlayer(team.teamName, player.id)} />
                </View>
              ))}

              {/* Legg Til Spiller */}
              <View style={{flexDirection: 'row'}}>
                <View style={styles.centeredTextWrapper}>
                  <TextInput
                    placeholder="Legg til spiller..."
                    placeholderTextColor="rgba(240, 227, 192, 0.6)"
                    value={newPlayers[team.teamName] || ''}
                    onChangeText={text =>
                      setNewPlayers(prev => ({ ...prev, [team.teamName]: text }))
                    }
                    style={[styles.input, {color: 'rgba(240, 227, 192, 0.6)'}]}
                  />
                </View>
                <Button imageSource={add_button} imageStyle={styles.remove_button} onPress={() => handleAddPlayer(team.teamName)} />
              </View>

            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Start Spill */}
      {playerName === 'Host' && (
        <View style={styles.startGameContainer}>
          <Button label="Start spill" style={styles.startGame_button}
            onPress={async () => {
              await updateGameStatus(gameId, 'playing');
              await setInitialChallenge(gameId);
              router.push('/questionPage');
            }}
          /> 
        </View>
      )}
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({

  // Containers //
  container: {
    padding: 20,
    paddingBottom: 80,
    marginTop: 70,
  },
  teamBox: {
    // padding: 15,
    marginBottom: 20,
    backgroundColor: '#073510',
    borderRadius: 35,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 3,
    borderColor: '#D49712',
    overflow: 'hidden',
  },
  teamHeader: {
    backgroundColor: '#094314',
    alignItems: 'center',
    width: '100%',
    padding: 18,
    flexDirection: 'row',
  },
  teamContent: {
    padding: 15,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    marginBottom: 5,
    width: 260
  },
  centeredTextWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startGameContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'transparent'
  },
  // Containers //


  // Text //
  teamName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F0E3C0',
    marginLeft: 20,
  },
  playerName: {
    fontSize: 20,
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#F0E3C0',
  },
  codeText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#D49712',
  },
  // Text //


  // Buttons //
  x_button: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  remove_button: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  startGame_button: {
    width: 250,
    height: 50,
    backgroundColor: '#66A05E',
    borderRadius: 5,
    marginBottom: 20,
  },
  // Buttons //
});
