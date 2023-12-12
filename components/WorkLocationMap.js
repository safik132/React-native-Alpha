// WorkLocationMap.js
import React from 'react';
import MapView, { Marker, Circle } from 'react-native-maps';

const WorkLocationMap = ({ workLat, workLon, userLat, userLon }) => {
  const workLocation = { latitude: workLat, longitude: workLon };
  const userLocation = { latitude: userLat, longitude: userLon };

  return (
    <MapView
      style={{ height: 300, width: '100%' }}
      initialRegion={{
        ...workLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <Marker coordinate={workLocation} />
      <Marker coordinate={userLocation} />
      <Circle
        center={workLocation}
        radius={100}
        strokeWidth={2}
        strokeColor="rgba(0,0,255,0.5)"
        fillColor="rgba(0,0,255,0.2)"
      />
    </MapView>
  );
};

export default WorkLocationMap;
