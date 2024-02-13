import AsyncStorage from '@react-native-async-storage/async-storage';

const setAsyncItems = (key: string, value: any) => {
  AsyncStorage.setItem(key, value);
};

const getAsyncItems = async (key: string) => {
  let value = await AsyncStorage.getItem(key);
  console.log('in get async ', key, value);
  return value;
};

const clearAsyncItems = () => {
  AsyncStorage.clear();
};

const removeAsyncItem = (key: string) => {
  AsyncStorage.removeItem(key);
};

export {getAsyncItems, setAsyncItems, clearAsyncItems, removeAsyncItem};
