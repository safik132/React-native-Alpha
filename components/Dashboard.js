import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,Alert, Platform  } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BackHandler} from 'react-native';
import * as Location from 'expo-location';

export default function Dashboard() {
  const [isPunchInEnabled, setPunchInEnabled] = useState(true);
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [employeeId, setEmployeeId] = useState(null);
  const [loggedInAt, setLoggedInAt] = useState(null);
  const [username, setUsername] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchEmployeeId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setEmployeeId(id);
    };
    fetchEmployeeId();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };

    fetchUsername();
  }, []);
  


  useEffect(() => {
    const fetchLoggedInTime = async () => {
      const loggedInTime = await AsyncStorage.getItem('loggedInAt');
      if (loggedInTime) {
        setLoggedInAt(new Date(loggedInTime));
      }
    };

    fetchLoggedInTime();
  }, []);
  useEffect(() => {
    const fetchPunchState = async () => {
      const lastPunchState = await AsyncStorage.getItem('lastPunchState');
      if (lastPunchState === 'in') {
        setPunchInEnabled(false);
      } else {
        setPunchInEnabled(true);
      }
    };

    fetchPunchState();
  }, []);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => value * Math.PI / 180;
    const R = 6371e3; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };
  
  
  const onSettingsPress = () => {
    // Navigate to settings or perform other actions
  };

  const onLogoutPress = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('lastPunchState');
      await AsyncStorage.removeItem('loggedInAt');
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('lat');
      await AsyncStorage.removeItem('lon');

      // Navigate to Login or any initial screen
      navigation.navigate('Homepage'); // Replace 'Login' with the name of your Login screen
    } catch (e) {
      console.log("Error in logout:", e);
    }
  };
  useEffect(() => {
    const backAction = () => {
      Alert.alert('Exit App', 'Are you sure you want to exit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => BackHandler.exitApp() },
      ]);
      return true; // Prevent default behavior of going back
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);
  
  const punchIn = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied');
      return;
    }
  
    try {
      const storedLat = await AsyncStorage.getItem('lat');
      const storedLon = await AsyncStorage.getItem('lon');
      console.log('Retrieved lat:', storedLat, 'lon:', storedLon);
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      console.log('Current Latitude:', latitude, 'Longitude:', longitude);
  
      if (storedLat && storedLon) {
        const distance = getDistance(latitude, longitude, parseFloat(storedLat), parseFloat(storedLon));
        console.log('Distance from stored location:', distance);
        if (distance > 1000) {
          Alert.alert('Punch Action not Allowed', 'You are not within the allowed range to punch in');
          return;
        }
      } else {
        Alert.alert('Error', 'Work location not set');
        return;
      }
  
      // API call for punching in
      const response = await axios.post('https://alpha-backend-2.onrender.com/api/employee/punch', {
        type: 'in',
        employeeId,
        loggedInAt,  
        lat: latitude,
        lon: longitude
      });
  
      setPunchInEnabled(false);
      setRecords(prev => ([...prev, { punchIn: new Date() }]));
    } catch (error) {
      console.log('Punch in error:', error);
      Alert.alert('Error', 'Failed to punch in');
    }
  };
  

  const punchOut = async (index) => {
    // Make sure employeeId is available
    if (!employeeId) return;

    const now = new Date();
    try {
      const response = await axios.post('https://alpha-backend-2.onrender.com/api/employee/punch', {
        type: 'out',
        employeeId: employeeId
      });
      const newRecords = [...records];
      newRecords[index].punchOut = now;
      setRecords(newRecords);
      await AsyncStorage.setItem('lastPunchState', 'out');
      setPunchInEnabled(true);
      console.log("Sending employeeId:", employeeId);

    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (date) => {
    if (date instanceof Date) {
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    } else {
      const dateObject = new Date(date);
      if (dateObject instanceof Date && !isNaN(dateObject)) {
        let hours = dateObject.getHours();
        const minutes = String(dateObject.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
      } else {
        console.error("Invalid date: ", date);
        return "Invalid date";
      }
    }
  };

  const formatDateToDDMMYYYY = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };



  useEffect(() => {
    const fetchLastPunchState = async () => {
      if (!employeeId) return;

      try {

        const response = await axios.get(`https://alpha-backend-2.onrender.com/api/employee/lastPunch?employeeId=${employeeId}`);
        const lastPunchRecord = response.data;

        if (lastPunchRecord) {
          const isPunchOutMissing = !lastPunchRecord.punchOut;
          setPunchInEnabled(!isPunchOutMissing);  // Enable "Punch Out" if only "Punch In" exists

          setRecords([{
            punchIn: new Date(lastPunchRecord.punchIn),
            punchOut: lastPunchRecord.punchOut ? new Date(lastPunchRecord.punchOut) : null
          }]);
        }
      } catch (error) {
        console.log('Error fetching last punch state:', error);
      }
    };

    fetchLastPunchState();
  }, [employeeId]);

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>

      <Text style={styles.header}>Welcome {username || '...'}</Text>

        <Text style={styles.clock}>{time.toLocaleTimeString()} {time.toDateString()}</Text>
      </View>
      <View style={styles.mainContent}>
        <View style={styles.contentWrapper}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, !isPunchInEnabled && styles.buttonDisabled]}
              onPress={punchIn}
              disabled={!isPunchInEnabled}
            >
              <Text style={styles.buttonText}>Punch In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, isPunchInEnabled && styles.buttonDisabled]} onPress={() => punchOut(records.length - 1)} disabled={isPunchInEnabled}>
              <Text style={styles.buttonText}>Punch Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.boldText}> Date</Text>
            <Text style={styles.normalText}>{formatDateToDDMMYYYY(currentDate)}</Text>
            <Text style={styles.normalText}>
              Logged in at: {loggedInAt ? loggedInAt.toLocaleTimeString() : 'Fetching...'}
            </Text>
          </View>

          <ScrollView style={styles.tablemain}>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Punch In</Text>
                <Text style={styles.tableHeader}>Punch Out</Text>
              </View>
              {records.map((record, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{formatDate(record.punchIn)}</Text>
                  <Text style={styles.tableCell}>{record.punchOut ? formatDate(record.punchOut) : '---'}</Text>
                </View>
              ))}
            </View>

          </ScrollView>
        </View>
      </View>
      <View style={styles.footer}>
       {/* <TouchableOpacity style={styles.footerButton} onPress={onSettingsPress}>
          <Icon name="cog" size={20} color="#fff" />
          <Text style={styles.footerText}>Settings</Text>
              </TouchableOpacity>*/}
        <TouchableOpacity style={styles.footerButton} onPress={onLogoutPress}>
          <Icon name="sign-out" size={20} color="#fff" />
          <Text style={styles.footerText}>Logout</Text>
        </TouchableOpacity>

      </View>
    </View>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#213966',
  },
  headerWrapper: {
    alignItems: 'center',
    width: '88%',
    height: '20%',
    backgroundColor: "white",
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    border: "2px solid black"
  },
  clock: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    height: 400,
    width: 350,
    border: "2px solid black"
  },
  header: {
    fontSize: 34,
    marginBottom: 20,
    color: 'black',
    fontWeight: 'bold', // Make the text bold
    fontFamily: 'sans-serif', // Use the specific font you have imported
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  centerText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 18,
  },
 
  tablemain: {
    fontSize: 14,
    backgroundColor: '#fff',
    padding: 1,
    borderRadius: 15,
    borderColor: "black",
    shadowColor: '#000', // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 4,
    elevation: 3,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f2f2', // Light grey background for even rows
    borderBottomWidth: 1,
    borderColor: '#ddd', // Border color for separation
  },
  tableHeader: {
    flex: 1,
    padding: 10,
    backgroundColor: '#e6e6e6', // Slightly darker grey for headers
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
  },
  oddRow: {
    backgroundColor: '#fff', // White background for odd rows
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#526891',
    width: '100%',
    padding: 10,
    height: "10%"
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'right',
    
  },
  footerText: {
    marginLeft: 5,
    color: '#fff',
    fontSize: 16,
    
  },
  textContainer: {
    backgroundColor: '#fff', // White background for the text container
    borderRadius: 10, // Rounded corners for the text container
    borderWidth: 2, // Slightly thicker border for a bolder look
    borderColor: '#ddd', // Light gray border color
    paddingHorizontal: 20, // Horizontal padding
    paddingVertical: 10, // Vertical padding
    marginBottom: 20, // Margin at the bottom to separate from other items
    shadowColor: '#000', // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 4,
    elevation: 3, // Elevation for Android shadow
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333', // Darker text color for contrast
    textAlign: 'center', // Center the text
    fontFamily: 'Helvetica Neue', // Or any other modern font
  },
  normalText: {
    fontSize: 16,
    color: '#333', // Consistent text color for readability
    textAlign: 'center', // Center the text
    fontFamily: 'Helvetica Neue', // Consistent font family
  },
});