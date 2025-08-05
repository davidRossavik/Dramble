import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { getGameById } from '@/utils/games';
import { Runde } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { supabase } from '../../supabase';

import AppText from '@/components/AppText';

const winnerBox = require('@/assets/images/winnerBox.png');

type Props = {
  runde: Runde;
  gameId: string;
  onNextPhaseRequested: () => void;
  isTransitioning?: boolean;
};

export default function FinishedView({ runde, gameId, onNextPhaseRequested, isTransitioning }: Props) {
  const [isHost, setIsHost] = useState(false);
  const [balances, setBalances] = useState<Record<string, number>>({});

  // Sjekk om bruker er host og hent balances
  useEffect(() => {
    AsyncStorage.getItem('isHost').then((hostValue) => {
      setIsHost(hostValue === 'true');
    });

    // Hent oppdaterte balances
    async function fetchBalances() {
      const { data } = await getGameById(gameId);
      if (data && data.balances) {
        setBalances(data.balances);
      }
    }
    fetchBalances();

    // Sett opp real-time listener for balance oppdateringer
    const channel = supabase
      .channel(`balances-finished-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload: any) => {
          if (payload.new.balances) {
            setBalances(payload.new.balances);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  // Ikke vis noen loading states hvis parent er i transition
  if (isTransitioning) {
    return null; // Returner ingenting, la parent håndtere loading
  }

  const getWinnerDisplay = () => {
    if (!runde.winner) return 'Ingen vinner valgt';
    
    switch (runde.challenge.type) {
      case '1v1':
        return `${runde.winner}`;
      
      case 'Team-vs-Team':
        return `${runde.winner}`;
      
      case 'Team-vs-itself':
        // For Team-vs-itself viser vi om laget klarte utfordringen
        const teamName = runde.selectedTeams[0]?.teamName || 'Laget';
        return runde.winner === 'Klarer' 
          ? `${teamName} klarte det!`
          : `${teamName} klarte det ikke!`;
      
      default:
        return `${runde.winner}`;
    }
  };

  return (
    <BackgroundWrapper>
      <View style={styles.contentContainer}>
        <AppText style={styles.title}>Challenge fullført!</AppText>

        {/* <View style={styles.winnerContainer}>
          <AppText style={styles.winnerLabel}>Vinner:</AppText>
          <AppText style={styles.winnerText}>{getWinnerDisplay()}</AppText>
        </View> */}
        <ImageBackground
          source={winnerBox}
          style={styles.winnerContainer2}
          resizeMode="stretch" // eller "cover" hvis du vil fylle hele containeren
        >
          {/* <AppText style={styles.winnerLabel}>Vinner:</AppText> */}
          <AppText style={styles.winnerText}>{getWinnerDisplay()}</AppText>
        </ImageBackground>

        {/* Vis gøy melding om hvem som må drikke */}
        <View style={styles.drinkingContainer}>
          <AppText style={styles.drinkingTitle}>🍺 Drikke-resultater 🍺</AppText>
          
          {runde.betResults && runde.betResults.length > 0 ? (
            runde.betResults.map((result, index) => (
              <View key={index} style={styles.drinkingResult}>
                <AppText style={styles.teamName}>{result.teamName}</AppText>
                <AppText style={[
                  styles.drinkingMessage,
                  result.isCorrect ? styles.correctDrinking : styles.incorrectDrinking
                ]}>
                  {result.isCorrect 
                    ? `🎉 Dere kan dele ut ${result.amount} slurker`
                    : `😅 OOPS! Dere må drikke ${result.amount} slurker selv! 😅`
                  }
                </AppText>
              </View>
            ))
          ) : (
            <AppText style={styles.noBets}>🍺 Ingen veddemål ble plassert denne runden - alle slipper unna! </AppText>
          )}
        </View>

        {/* Vis oppdaterte balances */}
        <View style={styles.balancesContainer}>
          <AppText style={styles.balancesTitle}>💰 Nye balances etter runde:</AppText>
          <ScrollView>
          {Object.entries(balances).map(([teamName, balance]) => (
            <View key={teamName} style={styles.balanceItem}>
              <AppText style={styles.teamName}>{teamName}</AppText>
              <AppText style={styles.balanceText}>{balance} slurker</AppText>
            </View>
          ))}
          </ScrollView>
        </View>

        {isHost && (
          <Button
            label="Neste runde"
            onPress={onNextPhaseRequested}
            style={styles.nextButton}
            textStyle={styles.nextButtonText}
          />
        )}
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  // TEXT //
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  winnerLabel: {
    fontSize: 30,
    // fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20
  },
  winnerText: {
    fontSize: 35,
    // fontWeight: 'bold',
    textAlign: 'center',
    color: '#4B2E11'
  },
  drinkingTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FAF0DE',
    marginBottom: 20,
  },
  drinkingMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  correctDrinking: {
    color: '#4CAF50',
  },
  incorrectDrinking: {
    color: '#F44336',
  },
  noBets: {
    fontSize: 20,
    textAlign: 'center',
    color: '#FAF0DE',
    fontStyle: 'italic',
  },
  balancesTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FAF0DE',
    marginBottom: 20,
  },
  balanceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FAF0DE',
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FAF0DE',
    marginBottom: 5,
  },
  nextButtonText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  // TEXT //


  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 55
  },
  winnerContainer: {
    marginBottom: 30,
    padding: 10,
    backgroundColor: 'rgba(21, 156, 235, 0.3)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#159cebff',
  },
  winnerContainer2: {
    width: 390, // tilpass bredden
    // aspectRatio: 2, // tilpass etter formen på bildet
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: 150,
  },
  
  balancesContainer: {
    marginBottom: 30,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  drinkingContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    borderColor: '#D49712',
    borderWidth: 2,
  },
  drinkingResult: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButton: {
    backgroundColor: '#EEB90E',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
});
