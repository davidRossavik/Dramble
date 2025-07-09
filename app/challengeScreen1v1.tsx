import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { submitBet } from '@/utils/bets'; // Husk å ha denne
import { getGameByCode } from '@/utils/games';
import AsyncStorage from '@react-native-async-storage/async-storage';

const drinkCount = require('@/assets/images/drinkCount.png');

export default function ChallengeScreen1v1() {
  const router = useRouter();

  const [value, setValue] = useState(0);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [person1, setPerson1] = useState('');
  const [person2, setPerson2] = useState('');
  const [gameId, setGameId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [challengeIndex, setChallengeIndex] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const gameCode = await AsyncStorage.getItem('gameCode');
      const team = await AsyncStorage.getItem('teamName');
      if (!gameCode || !team) return;

      const { data } = await getGameByCode(gameCode);
      if (!data) return;

      setGameId(data.id);
      setTeamId(team);
      const idx = data.current_challenge_index || 0;
      const chal = data.challenges?.[idx];
      setChallengeIndex(idx);
      setChallenge(chal);
      // Du må bytte disse med ekte navn hentet fra utfordringen
      setPerson1(chal.player1 || 'Spiller 1');
      setPerson2(chal.player2 || 'Spiller 2');
    };
    fetch();
  }, []);

  const handleConfirmedBet = async () => {
    if (!selectedButton || !gameId || !teamId) return;
    await submitBet(gameId, teamId, challengeIndex, value, selectedButton);
    router.push('./waitingRoom'); // Tilpass rute
  };

  if (!challenge) return <Text>Henter challenge...</Text>;

  return (
    <BackgroundWrapper>
      <View style={styles.drinkCountContainer}>
        <Text style={[styles.baseText, styles.drinkCountText]}>{20 - value}</Text>
        <Image source={drinkCount} style={styles.drinkCountPic} />
      </View>

      <View style={styles.challengeContainer}>
        <Text style={[styles.baseText, styles.challengeText]}>{challenge.title}: {person1} vs {person2}</Text>
        <Text style={[styles.baseText, styles.buttonText]}>{challenge.description}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button label={person1} onPress={() => setSelectedButton(person1)} stayPressed={selectedButton === person1} />
        <Button label={person2} onPress={() => setSelectedButton(person2)} stayPressed={selectedButton === person2} />
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={20}
        step={1}
        value={value}
        onValueChange={setValue}
        minimumTrackTintColor="#81AF24"
        maximumTrackTintColor="#00471E"
        thumbTintColor='#FF4500'
      />
      <Text style={[styles.baseText, styles.sliderText]}>{value}</Text>

      <Button label="Lås inn" onPress={handleConfirmedBet} disabled={!selectedButton} />
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  baseText: { fontWeight: 'bold', color: '#FAF0DE', textAlign: 'center' },
  drinkCountText: { fontSize: 25 },
  challengeText: { fontSize: 30 },
  buttonText: { fontSize: 20 },
  sliderText: { fontSize: 25, marginBottom: 20 },
  drinkCountContainer: {
    position: 'absolute', top: 60, right: 20, flexDirection: 'row', alignItems: 'center',
  },
  drinkCountPic: { width: 80, height: 80 },
  challengeContainer: { flex: 2, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 40 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 50 },
  slider: { width: '80%', height: 40, alignSelf: 'center' },
});