import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';

export default function chooseWinner() {

    const { guess, amount, p1, p2 } = useLocalSearchParams(); // parametre fra questionPage
    const [selectedButton, setSelectedButton] = useState<string | null>(null); //markSelectedButton

    const router = useRouter();
    const handleConfirmedWinner = () => {
        if (!selectedButton) return;

        router.push({
            pathname: '/resultPage',
            params: {
                winner: selectedButton,
                guess: guess,
                amount: amount,
            }
        });
    }

    const player1 = typeof p1 === 'string' ? p1 : '';
    const player2 = typeof p2 === 'string' ? p2 : '';

    return (
        <BackgroundWrapper>
            <View style={styles.challengeContainer}>
                <Text style={[styles.baseText, styles.challengeText]}>Start Challenge!</Text>
            </View>

            <View style={styles.statsContainer}>
                <Text style={[styles.baseText, styles.statsText]}>Du gjettet: {guess}</Text>
                <Text style={[styles.baseText, styles.statsText]}>Antall slurker: {amount}</Text>
            </View>

            <View style={styles.chooseWinnerContainer}>
                <Text style={[styles.baseText, styles.challengeText]}> Velg Vinner</Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button style={[styles.buttonBase, styles.button1]} label={player1}
                        onPress= {() => setSelectedButton(player1)} stayPressed={selectedButton === player1} />
                <Button style={[styles.buttonBase, styles.button2]} label={player2} 
                        onPress= {() => setSelectedButton(player2)} stayPressed={selectedButton === player2} />
            </View>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' , marginBottom: 80}}>
                <Button style={[styles.buttonBase, styles.exitButton]} label="Lås inn"
                        disabled={selectedButton === null} onPress={handleConfirmedWinner}  />
            </View>

        </BackgroundWrapper>
    )
}

const styles = StyleSheet.create({
    challengeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    statsContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 20,

        backgroundColor: '#073510',
        // backgroundColor: '#2E8B57',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        marginRight: 20,
        marginLeft: 20,

        borderWidth: 5,
        borderColor: '#FFD700',
    },
    chooseWinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    buttonBase: {
        width: 170,
        height: 100,
        borderRadius: 5,
    },
    button1: {
        backgroundColor: '#EEB90E',
    },
    button2: {
        backgroundColor: '#D41E1D',
    },
    exitButton: {
        width: 280,
        height: 80,
        backgroundColor: '#EEB90E',
    },

    baseText: {
        fontWeight: 'bold',
        color: '#FAF0DE',
        textAlign: 'center',
    },
    statsText: {
        fontSize: 20,
    },
    challengeText: {
        fontSize: 30,
    },
});