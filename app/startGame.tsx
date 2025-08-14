import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import AppText from '@/components/AppText';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { addPlayerToTeam, deleteGame, getGameByCode, randomizePlayers, removePlayerFromTeam, removeTeam } from '@/utils/games';
import { initializeGame, updateGameStatus } from '@/utils/status';
import { Team } from '@/utils/types';
import { supabase } from '../supabase-functions/supabase.js';

export default function GameLobby() {
  const { code } = useLocalSearchParams<{ code: string }>();

  const router = useRouter();
  const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  // Bilder
  const x_button = require('@/assets/images/X-button.png');
  const remove_button = require('@/assets/images/removeButton.png');
  const add_button = require('@/assets/images/addButton.png');
  const crown_icon = require('@/assets/images/hostCrown.png');

  // State
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameId, setGameId] = useState<string>('');
  const [newPlayers, setNewPlayers] = useState<Record<string, string>>({});
  const [localTeamName, setLocalTeamName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [hostName, setHostName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs for cleanup
  const statusChannelRef = useRef<any>(null);
  const teamsChannelRef = useRef<any>(null);

  // HoveduseEffect som håndterer alt
  useEffect(() => {
    if (!code) return;

    const setupGame = async () => {
      setIsLoading(true);
      
      try {
        // 1. Last brukerinfo fra AsyncStorage
        const storedCode = await AsyncStorage.getItem('gameCode');
        const storedTeam = await AsyncStorage.getItem('teamName');
        const storedPlayer = await AsyncStorage.getItem('playerName');
        const hostBoolean = await AsyncStorage.getItem('isHost');

        if (!storedCode || !storedTeam || !storedPlayer) {
          router.replace('/');
          return;
        }

        setLocalTeamName(storedTeam);
        setPlayerName(storedPlayer);
        setIsHost(hostBoolean === 'true');

        // 2. Hent spilldata fra Supabase
        const { data, error } = await getGameByCode(code);
        if (error || !data) {
          console.error('Fant ikke spill:', error);
          router.replace('/');
          return;
        }

        // 3. Sett state
        setTeams(data.teams || []);
        setGameId(data.id);
        setHostName(data.hostName);

        // 4. Sett opp realtime listeners
        await setupRealtimeListeners(data.id);

      } catch (error) {
        console.error('Feil ved oppsett av spill:', error);
        router.replace('/');
      } finally {
        setIsLoading(false);
      }
    };

    setupGame();

    // Cleanup
    return () => {
      if (statusChannelRef.current) {
        supabase.removeChannel(statusChannelRef.current);
      }
    };
  }, [code]);

  // Sørg for at realtime listeners alltid er aktive når gameId endres
  useEffect(() => {
    if (gameId) {
      console.log('GameId endret, setter opp realtime listeners på nytt:', gameId);
      setupRealtimeListeners(gameId);
    }
  }, [gameId]);

  // Håndter når spiller forlater appen (lukker appen helt)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'inactive') {
        console.log('Spiller forlot appen');
        
        if (isHost && gameId) {
          // Host forlot - slett spillet fra Supabase
          console.log('Host forlot - sletter spillet');
          deleteGame(gameId).catch(console.error);
        } else if (gameId && localTeamName && playerName) {
          // Sjekk om spilleren er lagleder (første spiller i laget)
          const team = teams.find(t => t.teamName === localTeamName);
          const isTeamLeader = team && team.players.length > 0 && team.players[0].name === playerName;
          
          if (isTeamLeader) {
            // Lagleder forlot - fjern hele laget
            console.log('Lagleder forlot - fjerner hele laget');
            removeTeam(gameId, localTeamName).catch(console.error);
          } else {
            // Vanlig spiller forlot - fjern fra lag
            console.log('Lagleder forlot - fjerner hele laget');
            removeTeam(gameId, localTeamName).catch(console.error);
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [isHost, gameId, localTeamName, playerName]);

  // Sett opp realtime listeners
  const setupRealtimeListeners = async (gameId: string) => {
    
    // Cleanup eksisterende listener først
    if (statusChannelRef.current) {
      console.log('Fjerner eksisterende listener');
      supabase.removeChannel(statusChannelRef.current);
    }

    // Kombinert listener for både status og teams endringer
    const gameChannel = supabase
      .channel(`game-updates-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {

          // Håndter status endringer
          if (payload.new.status === 'playing' && !isHost) {
            router.replace({
              pathname: '/challengeScreen',
              params: { gameId: gameId.toString() },
            });
          }

          // Håndter teams endringer
          if (payload.new.teams) {
            console.log('Teams oppdatert via realtime:', payload.new.teams);
            const updatedTeams = payload.new.teams.map((team: any) => ({
              ...team,
              players: team.players || [],
            }));
            console.log('Setter teams til:', updatedTeams);
            setTeams(updatedTeams);
          }
        }
      )
      .subscribe();

    console.log('Realtime listener satt opp for gameId:', gameId);
    statusChannelRef.current = gameChannel;
  };

  // Sjekk at ditt lag fortsatt finnes
  useEffect(() => {
    if (localTeamName && teams.length > 0) {
      const found = teams.find(t => t.teamName === localTeamName);
      if (!found) {
        alert('Laget ditt ble fjernet av hosten 😢');
        router.replace('/');
      }
    }
  }, [teams, localTeamName]);

  // Handlers
  const handleAddPlayer = async (teamName: string) => {
    const name = newPlayers[teamName]?.trim();
    if (!name) return;

    if (name.length > 20) {
      alert('Spillernavnet kan ikke være lengre enn 20 tegn');
      return;
    }

    const team = teams.find(t => t.teamName === teamName);
    if (!team) return;

    // Sjekk om navnet allerede finnes i hele spillet (alle lag)
    const nameTaken = teams.some(t => 
      t.players.some(p => p.name.toLowerCase() === name.toLowerCase())
    );
    if (nameTaken) {
      alert('Det finnes allerede en spiller med det navnet i spillet');
      return;
    }

    try {
      // Oppdater lokal state umiddelbart for bedre UX
      const newPlayer = { id: generateId(), name };
      const updatedTeams = teams.map(t => 
        t.teamName === teamName 
          ? { ...t, players: [...t.players, newPlayer] }
          : t
      );
      setTeams(updatedTeams);
      
      // Tøm input-feltet umiddelbart
      setNewPlayers(prev => ({ ...prev, [teamName]: '' }));

      // Oppdater databasen
      const result = await addPlayerToTeam(gameId, teamName, newPlayer);
      
      if (result?.error) {
        // Hvis database oppdatering feiler, revert lokal state
        setTeams(teams);
        setNewPlayers(prev => ({ ...prev, [teamName]: name }));
        console.error('Feil ved legging til av spiller:', result.error);
      }
    } catch (error) {
      console.error('Feil ved legging til av spiller:', error);
    }
  };

  const handleRemovePlayer = async (teamName: string, playerId: string) => {
    if (!gameId) return;
    
    try {
      // Optimistisk oppdatering
      const updatedTeams = teams.map(t => 
        t.teamName === teamName 
          ? { ...t, players: t.players.filter(p => p.id !== playerId) }
          : t
      );
      setTeams(updatedTeams);

      const { error } = await removePlayerFromTeam(gameId, teamName, playerId);
      if (error) {
        setTeams(teams); // Revert ved feil
        console.log("Feil ved fjerning:", error);
      }
    } catch (error) {
      setTeams(teams); // Revert ved feil
      console.error('Feil ved fjerning av spiller:', error);
    }
  };

  const handleRemoveTeam = async (teamName: string) => {
    if (!gameId) return;
    
    try {
      // Optimistisk oppdatering
      const updatedTeams = teams.filter(t => t.teamName !== teamName);
      setTeams(updatedTeams);

      const { error } = await removeTeam(gameId, teamName);
      if (error) {
        setTeams(teams); // Revert ved feil
        console.log("Feil ved fjerning av lag:", error);
      }
    } catch (error) {
      setTeams(teams); // Revert ved feil
      console.error('Feil ved fjerning av lag:', error);
    }
  };

  const handleStartGame = async () => {
    try {
      await initializeGame(gameId);
      await updateGameStatus(gameId, 'playing');
      router.push({
        pathname: '/challengeScreen',
        params: { gameId: gameId.toString() },
      });
    } catch (error) {
      console.error('Feil ved start av spill:', error);
    }
  };

  const handleRandomizePlayers = async () => {
    if (!gameId) return;

    try {
      const result = await randomizePlayers(gameId, []);
      
      if (result.error) {
        console.log(result.error);
        return;
      } else if (result.data) {
        setTeams(result.data);
      }
    } catch (error) {
      console.error('Feil ved randomisering av spillere:', error);
      alert('Feil ved randomisering av spillere');
    }
  };

  // Render
  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <AppText style={styles.codeText}>SPILLKODE: {code}</AppText>

        {isLoading ? (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <AppText style={{ color: '#F0E3C0', fontSize: 16 }}>Laster lag...</AppText>
          </View>
        ) : (
          teams.map(team => (
            <View key={team.teamName} style={styles.teamBox}>
              <View style={styles.teamHeader}>
                <View style={styles.centeredTextWrapper}>
                  <AppText style={styles.teamName}>{team.teamName}</AppText>
                </View>
                {isHost && !team.players.some(p => p.name === hostName) && (
                  <Button 
                    imageSource={x_button} 
                    imageStyle={styles.x_button} 
                    onPress={() => handleRemoveTeam(team.teamName)}
                  />
                )}
              </View>
              
              <View style={styles.teamContent}>
                {team.players.map((player, index) => {
                  const isHostPlayer = player.name === hostName;
                  const isTeamLeader = index === 0; // Første spiller er lagleder
                  return (
                    <View key={player.id} style={{ flexDirection: 'row', paddingVertical: 5, position: 'relative' }}>
                      {isHostPlayer && (
                        <Image source={crown_icon} style={styles.crown_icon} />
                      )}
                      <View style={styles.centeredTextWrapper}>
                        <Text style={[styles.playerName, isHostPlayer && styles.hostName]}>
                          {player.name}
                        </Text>
                      </View>
                      {isHost && !isHostPlayer && !isTeamLeader ? (
                        <Button 
                          imageSource={remove_button} 
                          imageStyle={styles.remove_button} 
                          onPress={() => handleRemovePlayer(team.teamName, player.id)}
                        />
                      ) : isHost && (isHostPlayer || isTeamLeader) ? (
                        <View style={{ width: 40, height: 40 }} />
                      ) : null}
                    </View>
                  );
                })}

                {/* Legg til spiller - kun for host */}
                {isHost && (
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
                    <Button 
                      imageSource={add_button} 
                      imageStyle={styles.remove_button} 
                      onPress={() => handleAddPlayer(team.teamName)} 
                    />
                  </View>
                )}
              </View>
            </View>
          ))
        )}
        
        {isHost && (
          <View style={styles.shuffleContainer}>
            <Button 
              label="Shuffle lag" 
              style={styles.shuffle_button}
              onPress={handleRandomizePlayers}
            />
          </View>
        )}
      </ScrollView>
      
      {isHost && (
        <View style={styles.startGameContainer}>
          <Button 
            label="Start spill" 
            style={styles.startGame_button}
            onPress={handleStartGame}
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
    padding: 15,
    flexDirection: 'row',
    minHeight: 60,
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
    width: 260,
  },
  centeredTextWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  startGameContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  shuffleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  shuffle_button: {
    width: 250,
    height: 50,
    backgroundColor: '#853c21ff',
    borderRadius: 25,
    marginBottom: 20,
  },
  // Containers //


  // Text //
  teamName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F0E3C0',
    textAlign: 'center',
    flexShrink: 1,
  },
  playerName: {
    fontSize: 22,
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#F0E3C0',
  },
  hostName: {
    color: '#D49712',
  },
  codeText: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#D49712',
  },
  startGameText: {
    fontSize: 22
  },
  // Text //

  // BILDE //
  crown_icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    position: 'absolute',
    top: 0,
    left: 0,
  },

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
    borderRadius: 25,
    marginBottom: 20,
  },
  // Buttons //
});
