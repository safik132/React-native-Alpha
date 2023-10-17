import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Dashboard() {
  const [isPunchInEnabled, setPunchInEnabled] = useState(true);
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [employeeId, setEmployeeId] = useState(null);
  const [loggedInAt, setLoggedInAt] = useState(null);

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
  

  const onSettingsPress = () => {
    // Navigate to settings or perform other actions
  };

  const onLogoutPress = () => {
    // Perform logout actions
  };
  const punchIn = async () => {
    // Make sure employeeId is available
    if (!employeeId) return;
    
    const now = new Date();
    try {
      const response = await axios.post('http://localhost:5000/api/employee/punch', {
        type: 'in',
        employeeId: employeeId,
        loggedInAt: loggedInAt.toISOString() // send this to backend
      });
      setRecords([...records, { punchIn: now, punchOut: null }]);
      await AsyncStorage.setItem('lastPunchState', 'in');
      setPunchInEnabled(false);
      console.log("Sending employeeId:", employeeId);
      

    } catch (error) {
      console.log(error);
    }
  };

  const punchOut = async (index) => {
    // Make sure employeeId is available
    if (!employeeId) return;
    
    const now = new Date();
    try {
      const response = await axios.post('http://localhost:5000/api/employee/punch', {
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
  
  

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setCurrentDate(currentDate);
  };
  useEffect(() => {
    const fetchLastPunchState = async () => {
      if (!employeeId) return;
  
      try {
        const response = await axios.get(`http://localhost:5000/api/employee/lastPunch?employeeId=${employeeId}`);
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
        
        <Text style={styles.header}>Schedule</Text>
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

      <Text style={styles.centerText} >{formatDateToDDMMYYYY(currentDate)}</Text>
      <Text style={styles.loggedInText}>
  Logged in at: {loggedInAt ? loggedInAt.toLocaleTimeString() : 'Fetching...'}
</Text>

      
        

        <ScrollView style={styles.tableScroll}>
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
        <TouchableOpacity style={styles.footerButton} onPress={onSettingsPress}>
          <Icon name="cog" size={20} color="#fff" />
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
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
    backgroundColor: "grey",
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:50,
    border: "2px solid black"
  },
  clock: {
    color: '#fff',
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
    fontSize: 54,
    marginBottom: 20,
    color: '#fff',
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
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: '#E0E0E0',  
  },
  tableCell: {
    fontSize: 14,
    backgroundColor: '#F5F5F5',  
    padding: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#526891',
    width: '100%',
    padding: 10,
    height:"10%"
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: 5,
    color: '#fff',
    fontSize: 16,
  },
  loggedInText: {
    color: '#000',
    fontSize: 16,
    margin: 10,
  },
});