import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../utils/colors';
import {getAsyncItems} from '../utils/Constants';

interface SplashScreenProps {
  navigation: any; // Adjust the type as needed
}

const SplashScreen: React.FC<SplashScreenProps> = ({navigation}) => {
  useEffect(() => {
    //check if user is in logged in state or not and navigate
    navigate();
  }, []);

  const navigate = async () => {
    let name = await getAsyncItems('USER_NAME');
    setTimeout(() => {
      navigation.replace(name != null ? 'List' : 'Login');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.txtStyle}>Firebase Chat App</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtStyle: {
    fontSize: 30,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
});

export default SplashScreen;
