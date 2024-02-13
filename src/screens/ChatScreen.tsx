import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Colors} from '../utils/colors';
import {
  getAsyncItems,
  removeAsyncItem,
  setAsyncItems,
} from '../utils/Constants';

const ChatScreen: React.FC<{navigation: any; route: any}> = ({
  navigation,
  route,
}) => {
  const {receiver} = route.params;
  const [messages, setMessages] = useState<any>([]);
  const [inputText, setInputText] = useState('');
  const [canSendMessage, setCanSendMessage] = useState(true);
  const flatListRef = useRef();
  const currentUserRef = useRef({name: null, isExpert: null});

  const characterLimit = 200; //default char limit

  const setInitialRateLimit = async () => {
    // Load canSendMessage state with timestamp from AsyncStorage
    const storedCanSendMessageString = await getAsyncItems(
      `${currentUserRef.current.name + '-' + receiver.name}_canSendMessage`,
    );
    if (storedCanSendMessageString) {
      const storedCanSendMessage = JSON.parse(storedCanSendMessageString);
      const currentTime = new Date().getTime();
      const timeLeft = currentTime - storedCanSendMessage.timestamp;

      // Check if the rate limit duration has passed
      if (timeLeft > 10000) {
        setCanSendMessage(true);
      } else {
        setCanSendMessage(storedCanSendMessage.enabled);
        setTimeout(() => {
          setCanSendMessage(true); // Enable sending after the rate limit duration

          // Save canSendMessage state with updated timestamp to AsyncStorage
          removeAsyncItem(
            `${
              currentUserRef.current.name + '-' + receiver.name
            }_canSendMessage`,
          );
        }, timeLeft);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await setCurrentUser(); // fetching and setting the older conversation
        await setInitialRateLimit(); // checking for rate limit when screen loading initially
        const subscriber = firestore() //subscribing to firestore listner to fetch the latest messages in real-time
          .collection('chats')
          .doc(currentUserRef.current.name + '-' + receiver.name)
          .collection('messages')
          .orderBy('createdAt', 'asc')
          .onSnapshot(querySnapShot => {
            console.log('in listener');
            if (querySnapShot.docs.length > 0) {
              setMessages(
                querySnapShot.docs.map(item => {
                  return {...item.data()};
                }),
              );
            }
          });
        return () => subscriber(); //un-subscribing to firestore listner while removing the screen
      } catch (error) {}
    };

    fetchData();
  }, []);

  const setCurrentUser = async () => {
    currentUserRef.current.name = await getAsyncItems('USER_NAME');
    let a = await getAsyncItems('ISEXPERT');
    currentUserRef.current.isExpert = JSON.parse(a);

    let tempData: any = [];
    firestore()
      .collection('chats')
      .doc(currentUserRef.current.name + '-' + receiver.name)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get()
      .then((res: any) => {
        if (res._docs.length > 0) {
          res._docs.map((item: any) => {
            tempData.push(item._data);
          });
          setMessages(tempData);
        }
      })
      .catch((res: any) => {});
  };

  // adding latest message to DB
  const addMessagesToDB = (message: any) => {
    firestore()
      .collection('chats')
      .doc(currentUserRef.current.name + '-' + receiver.name)
      .collection('messages')
      .add(message);

    firestore()
      .collection('chats')
      .doc(receiver.name + '-' + currentUserRef.current.name)
      .collection('messages')
      .add(message);
  };

  const onSend = () => {
    if (!canSendMessage) {
      // User can't send messages yet
      return;
    }

    if (inputText.trim() === '') {
      // Validation: Do not send empty messages
      return;
    }

    //message object which will be pushed to DB
    const newMessage = {
      text: inputText,
      createdAt: new Date().getTime(),
      sendBy: currentUserRef.current.name,
      sendTo: receiver.name,
    };

    addMessagesToDB(newMessage);
    setInputText('');
    checkAndApplyRateLimit();
  };

  // if user was not expert then apply for rate limit
  const checkAndApplyRateLimit = () => {
    if (!currentUserRef.current.isExpert) {
      setCanSendMessage(false); // Disable sending for the rate limit duration
      // Save canSendMessage state with timestamp to AsyncStorage
      setAsyncItems(
        `${currentUserRef.current.name + '-' + receiver.name}_canSendMessage`,
        JSON.stringify({enabled: false, timestamp: new Date().getTime()}),
      );
      setTimeout(() => {
        setCanSendMessage(true); // Enable sending after the rate limit duration

        // Save canSendMessage state with updated timestamp to AsyncStorage
        removeAsyncItem(
          `${currentUserRef.current.name + '-' + receiver.name}_canSendMessage`,
        );
      }, 10000);
    }
  };

  const renderItem = ({item}) => {
    let date = new Date(item.createdAt);
    return (
      <View
        style={[
          styles.messageContainer,
          item.sendBy == currentUserRef.current.name
            ? styles.myMessageContainer
            : styles.oppositeMessageContainer,
        ]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.dateText}>
          {(date.getHours() <= 9 ? '0' + date.getHours() : date.getHours()) +
            ': ' +
            (date.getMinutes() <= 9
              ? '0' + date.getMinutes()
              : date.getMinutes())}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index + ''}
        // inverted // Display the latest messages at the bottom
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({animated: true})
        }
        extraData={messages}
      />
      <View style={styles.inputContainer}>
        {canSendMessage && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              onChangeText={text => setInputText(text)}
              value={inputText}
              maxLength={characterLimit}
              placeholderTextColor={'black'}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={onSend}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </>
        )}
        {!canSendMessage && (
          <View style={styles.rateLimitIndicator}>
            <Text>Rate limit: You can send a message in next 10 seconds</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    color: Colors.black,
  },
  sendButton: {
    padding: 10,
    backgroundColor: Colors.primaryColor, // Green color for the send button
    borderRadius: 4,
  },
  sendButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  messageContainer: {
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    maxWidth: '70%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.green,
  },
  oppositeMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.blue, // Blue color for opposite person's messages
  },
  messageText: {
    color: 'white',
  },
  dateText: {
    color: Colors.grey,
    fontSize: 10,
    marginTop: 5,
  },
  rateLimitIndicator: {
    backgroundColor: 'red', // Yellow background for rate limit indicator
    paddingHorizontal: 5,
    paddingVertical: 10,
    textAlign: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default ChatScreen;
