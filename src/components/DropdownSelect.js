import React, { useMemo } from 'react';
import {
  Actionsheet,
  Box,
  ChevronDownIcon,
  HStack,
  Pressable,
  ScrollView,
  Text,
  useDisclose,
} from 'native-base';

/**
 * Lightweight dropdown built without VirtualizedList to avoid nested list warnings.
 * Options are rendered inside an Actionsheet which is portal-based, so it does not
 * inherit any parent ScrollView context.
 */
const DropdownSelect = ({
  value,
  onValueChange,
  placeholder = 'Select an option',
  options = [],
  isDisabled = false,
  label,
  maxHeight = 260,
}) => {
  const { isOpen, onOpen, onClose } = useDisclose();

  const selectedOption = useMemo(
    () => options.find(option => option.value === value),
    [options, value],
  );

  const handleSelect = optionValue => {
    if (onValueChange) {
      onValueChange(optionValue);
    }
    onClose();
  };

  return (
    <>
      <Pressable
        onPress={() => (!isDisabled && options.length > 0 ? onOpen() : undefined)}
        disabled={isDisabled || options.length === 0}
        opacity={isDisabled || options.length === 0 ? 0.5 : 1}
      >
        <Box
          borderWidth={1}
          borderColor="gray.300"
          borderRadius="md"
          p={3}
          bg={isDisabled ? 'gray.100' : 'white'}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <Text color={selectedOption ? 'black' : 'gray.500'}>
              {selectedOption ? selectedOption.label : placeholder}
            </Text>
            <ChevronDownIcon size="4" color="gray.400" />
          </HStack>
        </Box>
      </Pressable>

      <Actionsheet isOpen={isOpen} onClose={onClose} disableOverlay={false}>
        <Actionsheet.Content>
          {label ? (
            <Box width="100%" px={4} py={2} borderBottomWidth={1} borderBottomColor="gray.200">
              <Text fontWeight="600">{label}</Text>
            </Box>
          ) : null}

          <ScrollView width="100%" maxHeight={maxHeight}>
            {options.length === 0 ? (
              <Box px={4} py={3}>
                <Text color="gray.500">No options available</Text>
              </Box>
            ) : (
              options.map(option => (
                <Actionsheet.Item
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                >
                  {option.label}
                </Actionsheet.Item>
              ))
            )}
          </ScrollView>
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
};

export default DropdownSelect;
