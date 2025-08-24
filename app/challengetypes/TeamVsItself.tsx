import AppText from '@/components/AppText';
import Button from '@/components/Button';
import { Runde } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { useEffect, useRef, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

const drinkCountImg = require('@/assets/images/drinkCount.png');
const lockImage = require('@/assets/images/lock.png');

type Props = {
  runde: Runde;
  balances: Record<string, number>;
  onPlaceBet: (bet: { teamName: string; betOn: string; amount: number }) => void;
};

export default function TeamVsItself({ runde, balances, onPlaceBet }: Props) {
  const [teamName, setTeamName] = useState<string>('');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [teamBalance, setTeamBalance] = useState<number | null>(null);
  const [betError, setBetError] = useState<string | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const isPlacingBetRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem('teamName').then((name) => {
      if (name) setTeamName(name);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('teamName').then((team) => {
      if (team && balances && balances[team]) setTeamBalance(balances[team]);
    });
  }, [balances]);

  const handlePlaceBet = async () => {
    if (!selectedOutcome || !teamName) {
      alert('Vennligst velg utfall og skriv inn betting-beløp');
      return;
    }

    const amount = betAmount;
    if (isNaN(amount) || amount <= 0) {
      setBetError('Vennligst velg et gyldig beløp');
      return;
    }

    if (teamBalance !== null && amount > teamBalance) {
      setBetError('Du kan ikke vedde mer enn du har igjen!');
      return;
    }

    setBetError(null);
    setIsPlacingBet(true);

    try {
      await onPlaceBet({ teamName, betOn: selectedOutcome, amount });
      setBetAmount(0);
      setSelectedOutcome('');
    } finally {
      setIsPlacingBet(false);
      isPlacingBetRef.current = false;
    }
  };

  const getOutcomeOptions = () => ['Klarer', 'Klarer ikke'];

  const getChallengeDescription = () => {
    const team = runde.selectedTeams[0]?.teamName || 'Laget';
    return `${runde.challenge.description}`;
  };

  const outcomeOptions = getOutcomeOptions();
  const allBets = [...(runde.betResults || [])];

  return (
      <SafeAreaView style={{ flex: 1 }}>
        {teamBalance !== null && (
          <View style={styles.drinkCountCorner}>
            <AppText style={styles.drinkCountText}>{teamBalance}</AppText>
            <Image source={drinkCountImg} style={styles.drinkCountImg} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <AppText style={styles.title}>{runde.challenge.title} </AppText>

            <View style={styles.matchupCard}>
              <AppText style={styles.teamTitle}>{runde.selectedTeams[0]?.teamName || 'Laget'}</AppText>
            </View>

            <View style={styles.descriptionBox}>
              <AppText style={styles.description}>{getChallengeDescription()}</AppText>
            </View>

            <View style={styles.outcomeSelection}>
              <AppText style={styles.label}>Velg utfall:</AppText>
              <View style={styles.buttons}>
                {outcomeOptions.map((outcome, idx) => (
                  <Button
                    key={idx}
                    label={outcome}
                    onPress={() => setSelectedOutcome(outcome)}
                    style={[
                      styles.outcomeButton,
                      selectedOutcome === outcome ? styles.selectedOutcomeButton : {},
                    ]}
                    textStyle={[
                      styles.outcomeButtonText,
                      selectedOutcome === outcome ? styles.selectedOutcomeButtonText : {},
                    ]}
                  />
                ))}
              </View>
            </View>

            <AppText style={styles.sliderValue}>{betAmount}</AppText>
            
            <View style={styles.sliderRow}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={betAmount}
                onValueChange={(val) => {
                  setBetAmount(val);
                  setBetError(null);
                }}
                minimumTrackTintColor="#81AF24"
                maximumTrackTintColor="#00471E"
                thumbTintColor="#FF4500"
              />
              {betError && <AppText style={styles.errorText}>{betError}</AppText>}

              <Button
                imageSource={lockImage}
                imageStyle={styles.lockStyle}
                onPress={handlePlaceBet}
                disabled={isPlacingBet || !selectedOutcome || betAmount <= 0 || !!betError}
                style={[
                  styles.betButton,
                  (isPlacingBet || !selectedOutcome || betAmount <= 0 || !!betError) ? styles.disabledButton : {},
                ]}
                textStyle={styles.betButtonText}
              />
            </View>

            <View style={styles.currentBetsContainer}>
              <AppText style={styles.currentBetsTitle}>Nåværende veddemål:</AppText>
              {allBets.length > 0 ? (
                allBets.map((bet, idx) => (
                  <View key={idx} style={styles.betItem}>
                    <AppText style={styles.betTeam}>{bet.teamName}</AppText>
                    <AppText style={styles.betInfo}>
                      Vedder {bet.amount} slurker på "{bet.betOn}"
                    </AppText>
                  </View>
                ))
              ) : (
                <AppText style={styles.noBets}>Ingen veddemål ennå</AppText>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  matchupCard: { // FORRIGE ER TITLEROW
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginBottom: 20,
    marginTop: 10,
    gap: 10,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockStyle: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
  },
  contentContainer: {
    padding: 24,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.75)', // Fargen på skyggen
    textShadowOffset: { width: 2, height: 2 }, // Offset for skyggen (bredde og høyde)
    textShadowRadius: 3, // Radius for å gjøre skyggen litt uskarp
  },
  descriptionBox: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    borderColor: '#D49712',
    borderWidth: 2,
    // @ts-ignore
    backdropFilter: 'blur(6px)',
  },
  description: {
    color: '#FAF0DE',
    fontSize: 18,
    textAlign: 'center',
  },
  outcomeSelection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FAF0DE',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  sliderValue: {
    fontSize: 28,
    left: 130,
    marginTop: 5,
    marginBottom: 0,
  },
  slider: {
    width: '100%',
    height: 40,
    alignSelf: 'center',
    flex: 1
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  betButton: {
    backgroundColor: '#EEB90E',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  betButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.9)',
    textAlign: 'center',
  },
  currentBetsContainer: {
    marginTop: 32,
  },
  currentBetsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
    marginBottom: 12,
  },
  betItem: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  betTeam: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FAF0DE',
    marginBottom: 5,
  },
  betInfo: {
    fontSize: 12,
    color: '#FAF0DE',
  },
  noBets: {
    fontSize: 14,
    textAlign: 'center',
    color: '#FAF0DE',
    fontStyle: 'italic',
  },
  outcomeButton: {
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2f7a4c',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedOutcomeButton: {
    backgroundColor: '#FF4500',
  },
  outcomeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
  },
  selectedOutcomeButtonText: {
    color: '#FFFFFF',
  },
  drinkCountCorner: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,34,34,0.7)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 4,
    zIndex: 10,
  },
  drinkCountImg: {
    width: 35,
    height: 35,
    marginLeft: 6,
  },
  drinkCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
