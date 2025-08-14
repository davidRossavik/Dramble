import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';

export default function resultPage() {

    const { guess, amount, winner } = useLocalSearchParams();
    const router = useRouter();
    const goToFlaks = () =>{
        router.push('/spinTheWheel');
    };

    return (
        <BackgroundWrapper>
            <View style={styles.container}>
                <Text>Du tippet på: {guess} </Text>
                <Text>Du veddet: {amount} slurker</Text>
                <Text>Vinneren ble: {winner}</Text>

                {/* Gul knapp */}
                <View style={styles.button}>
                    <Text style={styles.buttonText} onPress={goToFlaks}>Neste</Text>
                </View>
            </View>
            
        </BackgroundWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

      button: {
    marginTop: 40,
    backgroundColor: '#EEB90E', 
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});