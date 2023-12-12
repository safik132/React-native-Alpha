

import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const MyCircularProgress = ({ size, width, fill, tintColor, backgroundColor }) => {
  // This will convert the current time to an angle for the progress bar
  const calculateFill = (date) => {
    let seconds = date.getSeconds() + (60 * date.getMinutes()) + (3600 * date.getHours());
    return (seconds / (12 * 3600)) * 100; // 12 hours because of AM/PM
  };

  // Set the initial fill
  const [currentFill, setCurrentFill] = useState(calculateFill(new Date()));

  useEffect(() => {
    // Update the fill state every second
    const intervalId = setInterval(() => {
      setCurrentFill(calculateFill(new Date()));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <AnimatedCircularProgress
      size={size}
      width={width}
      fill={currentFill}
      tintColor={tintColor}
      backgroundColor={backgroundColor}
      padding={10}
    >
      {(fill) => (
        <Text style={{ textAlign: 'center' }}>
          {new Date().toLocaleTimeString()}
        </Text>
      )}
    </AnimatedCircularProgress>
  );
};

export default MyCircularProgress;