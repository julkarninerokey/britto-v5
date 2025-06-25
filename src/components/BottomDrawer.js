import React from 'react';
import { Modal, TouchableWithoutFeedback } from 'react-native';
import { Box, VStack } from 'native-base';

const BottomDrawer = ({ visible, onClose, children }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Box flex={1} bg="rgba(0,0,0,0.3)" />
      </TouchableWithoutFeedback>
      <Box
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        bg="white"
        borderTopLeftRadius={16}
        borderTopRightRadius={16}
        p={5}
        zIndex={100}
      >
        <VStack space={4}>{children}</VStack>
      </Box>
    </Modal>
  );
};

export default BottomDrawer;
