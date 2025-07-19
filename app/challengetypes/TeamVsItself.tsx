import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { submitBet } from '@/utils/bets';
import { Challenge, Team } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const drinkCount = require('@/assets/images/drinkCount.png');

type Props = {
  challenge: Challenge;
  gameId: string;
  challengeIndex: number;
  teams: Team[];
  allTeams: Team[];
};

export default function TeamVsItselfBettingScreen({
  challenge,
  gameId,
  challengeIndex,
  teams,
  allTeams,
}: Props) {
  const [value, setValue] = useState(0);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);

  const maxDrinkCount = 20;
  const drinkCountLabel = maxDrinkCount - value;

  // Sikker null-checking for teams
  if (!teams || teams.length === 0) {
    return (
      <BackgroundWrapper>
        <View style={styles.centered}>
          <Text style={[styles.baseText, styles.challengeText]}>
            Venter på lag...
          </Text>
        </View>
      </BackgroundWrapper>
    );
  }

  const performingTeam = teams[0]; // Den som skal utføre utfordringen

  useEffect(() => {
    AsyncStorage.getItem('teamName').then((name) => {
      if (name) setTeamName(name);
    });
  }, []);

  // Alle lag kan vedde UNNTATT det som utfører utfordringen
  const canBet = teamName && teamName !== performingTeam?.teamName;

  const handleConfirmedBet = async () => {
    if (!selectedButton || !teamName) return;
    await submitBet(gameId, teamName, challengeIndex, value, selectedButton);
    alert('Du har låst inn ditt bet!');
  };

  if (!canBet) {
    return (
      <BackgroundWrapper>
        <View style={styles.centered}>
          <Text style={[styles.baseText, styles.challengeText]}>
            {performingTeam?.teamName || 'Laget'} skal utføre utfordringen:
          </Text>
          <Text style={[styles.baseText, styles.buttonText, { marginVertical: 20 }]}>
            {challenge.description}
          </Text>
          <Text style={[styles.baseText, styles.buttonText]}>
            Dere får ikke vedde på egen utfordring.
          </Text>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <View style={styles.drinkCountContainer}>
        <Text style={[styles.baseText, styles.drinkCountText]}>{drinkCountLabel}</Text>
        <Image source={drinkCount} style={styles.drinkCountPic} />
      </View>

      <View style={styles.challengeContainer}>
        <Text style={[styles.baseText, styles.challengeText]}>
          Tror du {performingTeam?.teamName || 'laget'} klarer dette?
        </Text>
        <Text style={[styles.baseText, styles.buttonText]}>{challenge.description}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          textStyle={[styles.baseText, styles.buttonText]}
          style={[styles.buttonBase, styles.button1]}
          label="Klarer"
          onPress={() => setSelectedButton('Klarer')}
          stayPressed={selectedButton === 'Klarer'}
        />
        <Button
          textStyle={[styles.baseText, styles.buttonText]}
          style={[styles.buttonBase, styles.button2]}
          label="Klarer ikke"
          onPress={() => setSelectedButton('Klarer ikke')}
          stayPressed={selectedButton === 'Klarer ikke'}
        />
      </View>

      <View style={{ width: '100%', height: 70 }}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={maxDrinkCount}
          step={1}
          value={value}
          onValueChange={(val) => setValue(val)}
          minimumTrackTintColor="#81AF24"
          maximumTrackTintColor="#00471E"
          thumbTintColor="#FF4500"
        />
        <Text style={[styles.baseText, styles.sliderText]}>{value.toFixed(0)}</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button
          style={[styles.buttonBase, styles.exitButton]}
          label="Lås inn"
          textStyle={[styles.baseText, styles.buttonText]}
          disabled={selectedButton === null}
          onPress={handleConfirmedBet}
        />
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  baseText: {
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
  },
  drinkCountText: {
    fontSize: 25,
  },
  challengeText: {
    fontSize: 30,
  },
  buttonText: {
    fontSize: 20,
  },
  sliderText: {
    fontSize: 25,
    marginBottom: 20,
  },
  buttonBase: {
    width: 170,
    height: 100,
    borderRadius: 5,
  },
  button1: {
    backgroundColor: '#1ABC9C',
  },
  button2: {
    backgroundColor: '#C0392B',
  },
  exitButton: {
    width: 280,
    height: 80,
    backgroundColor: '#EEB90E',
  },
  drinkCountContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drinkCountPic: {
    width: 80,
    height: 80,
  },
  challengeContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: 40,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 50,
  },
  slider: {
    width: '80%',
    height: 40,
    alignSelf: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 30,
  },
});
