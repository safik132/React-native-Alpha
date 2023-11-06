// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Homepage from './components/Homepage';
import Dashboard from './components/Dashboard';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Homepage" options={{headerShown: false}} component={Homepage} />
        <Stack.Screen name="Dashboard" options={{headerShown: true}} component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
