// screens/LoginScreen.tsx

import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Colors} from '../utils/colors';
import Loader from '../components/Loader';
import {setAsyncItems} from '../utils/Constants';

interface LoginScreenProps {
  navigation: any; // Adjust the type as needed
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const [name, setName] = useState('');
  //   const [password, setPassword] = useState('');
  const [isExpert, setIsExpert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //method to check validation
  const isValid = () => {
    if (name == '') {
      Alert.alert('Firebase Chat App', 'Please enter valid name');
      return false;
    }
    return true;
  };

  const registerUser = () => {
    firestore()
      .collection('users')
      .doc(name)
      .set({
        name: name,
        isExpert: isExpert,
      })
      .then((res: any) => {
        //login after regestration
        setAsyncItems('USER_NAME', name);
        setAsyncItems('ISEXPERT', JSON.stringify(isExpert));
        navigation.replace('List');
        setIsLoading(false);
      })
      .catch((error: any) => {
        setIsLoading(false);
      });
  };

  const onHandleLogin = () => {
    if (!isValid()) {
      return;
    }
    // check if user was already created or not in firestore DB
    setIsLoading(true);
    firestore()
      .collection('users')
      .where('name', '==', name)
      .get()
      .then((res: any) => {
        if (res._docs.length > 0) {
          // user was already created. login to List screen
          setAsyncItems('USER_NAME', res._docs[0]._data.name);
          setAsyncItems(
            'ISEXPERT',
            JSON.stringify(res._docs[0]._data.isExpert),
          );
          navigation.replace('List');
          setIsLoading(false);
        } else {
          // user was not present in DB. create the user and then navigate to list screen
          registerUser();
        }
      })
      .catch((error: any) => {
        setIsLoading(false);
        // if user not present regester user and then login
      });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <TextInput
        placeholder="Enter Name"
        placeholderTextColor={'black'}
        style={[styles.input, {marginTop: 20}]}
        value={name}
        onChangeText={txt => setName(txt)}
      />
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => setIsExpert(!isExpert)}
        activeOpacity={0.7}>
        <Image
          style={styles.checkBoxImg}
          source={
            isExpert
              ? require('../images/approved.png')
              : require('../images/unchecked.png')
          }
          resizeMode="contain"
        />
        <Text
          style={
            styles.imgText
          }>{`Expert (select only at the time of registration)`}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          onHandleLogin();
        }}>
        <Text style={styles.btnText}>{'Login or Register'}</Text>
      </TouchableOpacity>
      {isLoading && <Loader />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    color: 'black',
    alignSelf: 'center',
    marginTop: 100,
    fontWeight: '600',
  },
  input: {
    width: '90%',
    height: 50,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 50,
    paddingLeft: 20,
    color: 'black',
  },
  btn: {
    width: '90%',
    height: 50,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    backgroundColor: Colors.primaryColor,
  },
  btnText: {
    color: 'white',
    fontSize: 20,
  },
  orSignup: {
    alignSelf: 'center',
    marginTop: 50,
    fontSize: 20,
    fontWeight: '600',
    textDecorationLine: 'underline',
    color: 'black',
  },
  imageContainer: {
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
  },
  checkBoxImg: {width: 30, height: 30},
  imgText: {
    color: 'black',
    fontSize: 14,
    marginLeft: 5,
    alignSelf: 'center',
    fontWeight: '600',
  },
});

export default LoginScreen;
