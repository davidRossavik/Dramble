import { StyleSheet, Text, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';

export default function joinGame() {
    return (
        <BackgroundWrapper>
            <View style={styles.container}>
                <Text>Du ble med i et spill</Text>
            </View>
        </BackgroundWrapper>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});