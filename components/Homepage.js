import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Homepage({navigation}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    
    try {
      const response = await fetch('https://alpha-backend-7vs7.onrender.com/api/login', {
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
  
      const data = await response.json();
      if (data.token) {
        // Save this token and user's ID securely
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userId', data.userId);  // Storing the user's ID
        await AsyncStorage.setItem('lastPunchState', 'out');
        // Capture the login time
        const loggedInAt = new Date().toISOString();
        await AsyncStorage.setItem('loggedInAt', loggedInAt);
  
        // Navigate to Dashboard
        navigation.navigate('Dashboard');
      } else {
        // Show an error message
        alert("Check email and password");
      }
    } catch (error) {
      console.log("An error occurred:", error);
      alert("An error occurred. Please try again.");
    }
    
  };
  
    return (
        <View style={styles.container}>
          <Image source={require('../assets/Group6.png')} style={styles.image} />
    
          <View style={styles.loginDiv}>
            <Text style={styles.headerText}>Login</Text>
            <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} value={email} />
            <TextInput placeholder="Password" secureTextEntry={true} style={styles.input} onChangeText={setPassword} value={password} />

            <Pressable style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </Pressable>

          </View>
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
        }
      });
      