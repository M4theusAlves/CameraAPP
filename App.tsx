import React, { useRef, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, Animated } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons'; // Importando ícones

const Tab = createBottomTabNavigator();


function CameraScreen({ photos, setPhotos }) {
  const cameraRef = useRef<CameraView>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View>
        <Text>Você precisa dar permissão para exibir a câmera</Text>
        <Button onPress={requestPermission} title="Pedir permissão" />
      </View>
    );
  }
  

  const handleChangeCamera = () => {
    setFacing(facing === 'front' ? 'back' : 'front');
  };

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const handleTakePicture = async () => {
    if (cameraReady && cameraRef.current) {
      const option = {
        quality: 0.7,
        base64: true,
      };
      const photo = await cameraRef.current.takePictureAsync(option);
      if (photo) {
        setPhotos([...photos, photo.uri]);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onCameraReady={handleCameraReady}
        ref={cameraRef}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleChangeCamera}>
          <MaterialIcons name="flip-camera-android" size={40} color="#6200ee" />
        </TouchableOpacity>

        
        <TouchableOpacity style={styles.iconButton} onPress={handleTakePicture}>
          <MaterialIcons name="camera" size={40} color="#6200ee" />
        </TouchableOpacity>
      </View>
    </View>
  );
}


function GalleryScreen({ photos, setPhotos }) {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Animação de opacidade

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleSelectPhoto = (uri: string) => {
    if (selectedPhotos.includes(uri)) {
      setSelectedPhotos(selectedPhotos.filter(photo => photo !== uri));
    } else {
      setSelectedPhotos([...selectedPhotos, uri]);
    }
  };

  const handleDeletePhotos = () => {
    Animated.timing(fadeAnim, {
      toValue: 0, 
      duration: 500, 
      useNativeDriver: true, 
    }).start(() => {
      
      setPhotos(photos.filter(photo => !selectedPhotos.includes(photo)));
      setSelectedPhotos([]);
      fadeAnim.setValue(1); 
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectPhoto(item)}>
            <Animated.View
              style={{
                opacity: selectedPhotos.includes(item) ? fadeAnim : 1, 
              }}
            >
              <Image
                source={{ uri: item }}
                style={[
                  styles.thumbnail,
                  selectedPhotos.includes(item) && { opacity: 0.5 },
                ]}
              />
            </Animated.View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.galleryButtonContainer}>
       
        <TouchableOpacity style={styles.iconButton} onPress={handlePickImage}>
          <MaterialIcons name="add-photo-alternate" size={40} color="#6200ee" />
        </TouchableOpacity>

        
        {selectedPhotos.length > 0 && (
          <TouchableOpacity style={styles.iconButton} onPress={handleDeletePhotos}>
            <MaterialIcons name="delete" size={40} color="#6200ee" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}


export default function App() {
  const [photos, setPhotos] = useState<string[]>([]);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#6200ee', 
          tabBarInactiveTintColor: '#ccc', 
        }}
      >
        <Tab.Screen
          name="Câmera"
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="camera" size={size} color={color} />
            ),
          }}
        >
          {() => <CameraScreen photos={photos} setPhotos={setPhotos} />}
        </Tab.Screen>
        <Tab.Screen
          name="Galeria"
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="photo-album" size={size} color={color} />
            ),
          }}
        >
          {() => <GalleryScreen photos={photos} setPhotos={setPhotos} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    width: '100%',
    height: '70%', 
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20, 
    width: '100%',
  },
  galleryButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20, 
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20, 
  },
  thumbnail: {
    width: 100,
    height: 100,
    margin: 5,
  },
});