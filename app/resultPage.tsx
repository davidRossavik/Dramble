import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';

export default function resultPage() {

    const { guess, amount, winner } = useLocalSearchParams();
    return (
        <BackgroundWrapper>
            <View style={styles.container}>
                <Text>Du tippet på: {guess} </Text>
                <Text>Du veddet: {amount} slurker</Text>
                <Text>Vinneren ble: {winner}</Text>
            </View>
        </BackgroundWrapper>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});