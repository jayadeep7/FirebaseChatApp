// screens/ListScreen.tsx

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Colors} from '../utils/colors';
import Loader from '../components/Loader';
import {clearAsyncItems, getAsyncItems} from '../utils/Constants';

interface ListScreenProps {
  navigation: any;
}

const ListScreen: React.FC<ListScreenProps> = ({navigation}) => {
  const [users, setUsers] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    //fetch the users present in the DB
    getUsers();
  }, []);

  const getUsers = async () => {
    setIsLoading(true);
    let name = await getAsyncItems('USER_NAME');
    let tempData: any = [];
    firestore()
      .collection('users')
      .where('name', '!=', name)
      .get()
      .then((res: any) => {
        if (res._docs.length > 0) {
          res._docs.map((item: any) => {
            tempData.push(item._data);
          });
          setUsers(tempData);
          setIsLoading(false);
        }
      })
      .catch((res: any) => {
        setIsLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>List Screen</Text>
      </View>
      <FlatList
        style={{flex: 1}}
        data={users}
        onRefresh={getUsers} //reloading users list on refreshing
        refreshing={false}
        renderItem={({item, index}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Chat', {
                receiver: item,
              })
            }>
            <View style={styles.userItem}>
              <Image
                style={styles.userIcon}
                source={require('../images/user.png')}
                resizeMode="contain"
              />
              <Text style={styles.name}>
                {item?.name ?? ''}
                {item.isExpert ? '  (Expert)' : ''}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          //clear async storage and navigate to login screen
          navigation.replace('Login');
          clearAsyncItems();
        }}>
        <Text style={{}}>{'Sign Out'}</Text>
      </TouchableOpacity>

      {isLoading && <Loader />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    width: '100%',
    height: 60,
    backgroundColor: Colors.white,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    color: Colors.primaryColor,
    fontSize: 20,
    fontWeight: '600',
  },
  userItem: {
    width: '85%',
    alignSelf: 'center',
    marginTop: 10,
    flexDirection: 'row',
    height: 60,
    borderWidth: 0.5,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 15,
  },
  userIcon: {
    width: 40,
    height: 40,
  },
  name: {
    color: Colors.black,
    marginLeft: 20,
    fontSize: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: Colors.primaryColor,
    marginBottom: 20,
    marginTop: 15,
    width: '90%',
    alignSelf: 'center',
  },
});
export default ListScreen;
