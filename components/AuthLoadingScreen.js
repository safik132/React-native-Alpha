import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AuthLoadingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginState = async () => {
      try {
        console.log("Checking login state...");
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        console.log(`Is Logged In: ${isLoggedIn}`);
        navigation.navigate(isLoggedIn ? 'Dashboard' : 'Homepage');
      } catch (e) {
        console.log(e);
        navigation.navigate('Homepage');
      }
    };
  
    checkLoginState();
  }, [navigation]);
  

  // Render any loading content that you like here
  return (
    <View style={styles.container}>
    <ActivityIndicator size="large" color="#0000ff" />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthLoadingScreen;
