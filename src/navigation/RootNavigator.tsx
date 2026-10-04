import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConversationScreen } from '../features/conversation/ConversationScreen';
import { theme } from '../theme';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: theme.bg },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: theme.bg },
            }}
          >
            <Stack.Screen
              name="Conversation"
              component={ConversationScreen}
              options={{ title: 'AI Astrologer' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
