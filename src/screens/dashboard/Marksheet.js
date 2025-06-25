import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {VStack, ScrollView, Box, Text, HStack, Divider} from 'native-base';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getMarksheet} from '../../service/api';
import 'react-native-pager-view';
import {IconListLoading} from '../../components/LoadingAnimation';
import AccordionComponent from '../../components/AccordionComponent';

const Marksheet = ({navigation}) => {
  const [data, setData] = useState([]);
  const [iconUrl, setIconUrl] = useState();
  useEffect(() => {
    const checkForData = async () => {
      const reg = await AsyncStorage.getItem('reg');
      const dashboard = await AsyncStorage.getItem('dashboard');
      const syllabusIcon = JSON.parse(dashboard).find(
        item => item.screen === 'Marksheet',
      ).icon;
      setIconUrl(syllabusIcon);
      const response = await getMarksheet(reg);
      const renderMarksheetDetails = (item) => (
        <Box p={2}>
          <HStack>
            <Text bold flex={2}>Examination Held In</Text>
            <Text flex={3}>{item.exam_held_in}</Text>
          </HStack>
          <HStack>
            <Text bold flex={2}>Result Publication Date</Text>
            <Text flex={3}>{item.result_pub_date}</Text>
          </HStack>
          <HStack>
            <Text bold flex={2}>Marksheet Status</Text>
            <Text flex={3}>{item.status}</Text>
          </HStack>
          <HStack>
            <Text bold flex={2}>Marksheet Sent/Printed Date</Text>
            <Text flex={3}>{item.send_date || '-'}</Text>
          </HStack>
          <HStack>
            <Text bold flex={2}>Total Pages</Text>
            <Text flex={3}>{item.total_pages || '-'}</Text>
          </HStack>
          <Divider my={2} />
          <Text fontSize="sm" textAlign={'center'} color="gray.500">
            You have to collect your marksheet from the department office.
          </Text>
        </Box>
      );

      const accordionData = response?.data.map(item => ({
        title: `${item.exam_title}`,
        content: `Your Marksheet for "${item.exam_title}" has been processed. See details below.`,
        details: renderMarksheetDetails(item),
        icon: 'ios-arrow-down',
        badges: [
          `Status: ${item.status || '-'}`,
          `${item.status}: ${item.send_date || '-'}`,
        ],
      }));

      setData(accordionData);
    };

    checkForData();
  }, []);

  return (
    <View style={{flex: 1}}>
      <AppBar title="Marksheet" />
      <VStack w={'100%'} flex={1}>
        {data && data.length > 0 ? (
          <ScrollView>
            <VStack w="100%" alignItems="flex-start" p={1}>
              {data.map((item, index) => (
                <AccordionComponent data={item} iconUrl={iconUrl} details={item.details} key={index} />
              ))}
            </VStack>
          </ScrollView>
        ) : (
          <ScrollView>
            {[...Array(3)].map((_, index) => (
              <IconListLoading key={index} />
            ))}
          </ScrollView>
        )}
      </VStack>
    </View>
  );
};

export default Marksheet;
