import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';


export default function Homepage({navigation}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingState, setLoadingState] = useState({ isLoading: false, message: '' });



  const handleLogin = async () => {
    setLoadingState({ isLoading: true, message: 'Logging In...' });
  
    try {
      const response = await fetch('https://alpha-backend-2.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: 'employee',
        }),
      });
  
      if (!response.ok) {
        setLoadingState({ isLoading: false, message: '' }); // Stop loading
        const errorData = await response.json();
        const errorMessage = response.status === 401 ? "Wrong credentials, please check" : errorData.message || "An error occurred.";
        Alert.alert("Login Failed", errorMessage);
        return; // Keep the user on the login page
      }
    
      const data = await response.json();
      console.log("Login response data:", data);  // Add this line
      // ... rest of the code ...

      if (data.token) {
        // Save this token and user's ID securely
        // Storing values in AsyncStorage
        await AsyncStorage.setItem('userToken', data.token);
        console.log('Stored userToken:', data.token);

        await AsyncStorage.setItem('userId', data.userId);
        console.log('Stored userId:', data.userId);  // Storing the user's ID
        await AsyncStorage.setItem('lastPunchState', 'out');
        // Capture the login time
        const loggedInAt = new Date().toISOString();
        await AsyncStorage.setItem('loggedInAt', loggedInAt);
        
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('username', data.username); 
        console.log('stored username',data.username);

        if ('lat' in data && 'lon' in data) {
          await AsyncStorage.setItem('lat', `${data.lat}`); 
          console.log('Stored lat:', data.lat);
        
          await AsyncStorage.setItem('lon', `${data.lon}`);
          console.log('Stored lon:', data.lon);
          
          
        }
        
        setLoadingState({ isLoading: false, message: '' });
        // Navigate to Dashboard
        navigation.navigate('Dashboard');
        
    } else {
      setLoadingState({ isLoading: false, message: '' }); // Stop loading
      Alert.alert("Login Failed", "Check email and password");
    }
  } catch (error) {
    console.log("An error occurred:", error);
    setLoadingState({ isLoading: false, message: '' }); // Stop loading
    Alert.alert("Login Error", "An error occurred. Please try again.");
  }
};
  useFocusEffect(
    React.useCallback(() => {
      // Reset email and password state
      setEmail('');
      setPassword('');
    }, [])
  );
  
  
    return (
      <View style={styles.container}>
      {loadingState.isLoading ? (
        <View style={styles.loadingOverlay}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>{loadingState.message}</Text>
        </View>
      </View>
      ) : (
        <>
          <Image source={require('../assets/Group6.png')} style={styles.image} />
          <View style={styles.loginDiv}>
            <Text style={styles.headerText}>Login</Text>
            <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} value={email} />
            <TextInput placeholder="Password" secureTextEntry={true} style={styles.input} onChangeText={setPassword} value={password} />
            <Pressable style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
      );
    };

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#213966',
          alignItems: 'center',
          justifyContent: 'center',
        },
        image: {
          width: 350,
          height: 200,
          marginBottom: 20,
        },
        loginDiv: {
          backgroundColor: 'white',
          padding: 30,
          borderRadius: 5,
          width: '80%',
          alignItems: 'center',
        },
        headerText: {
          fontSize: 30,
          marginBottom: 15,
          color: 'black',
        },
        input: {
          width: '100%',
          height: 40,
          borderWidth: 1,
          borderColor: 'black',
          borderRadius: 5,
          padding: 10,
          marginTop: 10,
        },
        button: {
          marginTop: 20,
          backgroundColor:'#213976',
          width: '100%',
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'black',
          borderRadius: 5,
        },
        buttonText: {
          fontSize: 16,
          color: 'white',
        },
        forgotpassword:{
          fontSize:15,
          width:"100%",
          color:"lightblue",
          textAlign:"right",
          padding:10
        },
        loadingOverlay: {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        },
        loadingBox: {
          padding: 20,
          backgroundColor: '#FFF', // White background for the box
          borderRadius: 10,
          alignItems: 'center',
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        loadingText: {
          marginTop: 20,
          color: '#000', // Text color
        },
      });
      