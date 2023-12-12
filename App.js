// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar,Image } from 'react-native';
import Homepage from './components/Homepage';
import Dashboard from './components/Dashboard';
import AuthLoadingScreen from './components/AuthLoadingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
    <StatusBar barStyle="dark-content" backgroundColor="#526891" />
    <NavigationContainer>
    <Stack.Navigator initialRouteName="AuthLoading">
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Homepage" options={{ headerShown: false }} component={Homepage} />
        <Stack.Screen
            name="Dashboard"
            options={{
              headerShown: true,
              headerStyle: {
                backgroundColor: '#526891', // Your desired color
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerLeft: () => null,
              headerTitle: () => (
                <Image
                  source={require('./assets/aces-logo2.png')}
                  style={{ width: 130, height: 60 ,marginLeft: -15}} // Adjust the size as needed
                />
              ),
            }}
            component={Dashboard}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};
