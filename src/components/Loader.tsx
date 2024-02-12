import React from 'react';
import {ActivityIndicator} from 'react-native';
import {Colors} from '../utils/colors';

const Loader: React.FC = () => {
  return (
    <ActivityIndicator
      size={'large'}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: Colors.transparent,
      }}
    />
  );
};

export default Loader;
