import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {VStack, ScrollView, Text, Box, Badge} from 'native-base';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getNotice} from '../../service/api';
import 'react-native-pager-view';
import {IconListLoading} from '../../components/LoadingAnimation';
import AccordionComponent from '../../components/AccordionComponent';
import {formatDateTime} from '../../service/utils';
import { dashboardButtons } from '../../service/utils';

const Notice = ({navigation}) => {
  const [data, setData] = useState([]);
  const [iconUrl, setIconUrl] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noDataMsg, setNoDataMsg] = useState('');

  useEffect(() => {
    const checkForData = async () => {
      setLoading(true);
      setNoDataMsg('');
      const reg = await AsyncStorage.getItem('reg');
      const syllabusIcon = dashboardButtons.find(
        item => item.screen === 'Notice',
      ).icon;
      setIconUrl(syllabusIcon);

      const response = await getNotice('2017417693');
      const typeList = response?.type || [];
      const getTypeColor = name => {
        const found = typeList.find(t => t.name.trim() === name.trim());
        return found ? found.color : 'gray';
      };

      if (response.status === 201) {
        setData([]);
        setNoDataMsg(response.message || 'No notice found for you.');
      } else if (
        response.status === 200 &&
        Array.isArray(response.result) &&
        response.result.length > 0
      ) {
        const accordionData = response.result.map(item => ({
          title: item.text,
          details: (
            <ScrollView style={{maxHeight: 200}}>
              <VStack space={2}>
                <Box>
                  <Badge variant={'outline'} colorScheme={'error'}>{item.name}</Badge>
                </Box>
                <Text fontSize="sm">{item.description}</Text>
                {item.file ? (
                  <Text color="blue.500" underline>
                    Attachment: {item.file}
                  </Text>
                ) : null}
                <Text fontSize="xs" color="gray.500">
                  {formatDateTime(item.dateTime)}
                </Text>
              </VStack>
            </ScrollView>
          ),
          content: `Published: ${formatDateTime(item.dateTime)}`,
          icon: 'ios-arrow-down',
          badges: [item.name],
        }));
        setData(accordionData);
      } else {
        setData([]);
        setNoDataMsg(
          '📢 No notices are available for you at the moment. Please check back later or contact your department or hall for updates.',
        );
      }
      setLoading(false);
    };

    checkForData();
  }, []);

  return (
    <View style={{flex: 1}}>
      <AppBar title="Notice" />
      <VStack w={'100%'} flex={1}>
        {loading ? (
          <ScrollView>
            {[...Array(3)].map((_, index) => (
              <IconListLoading key={index} />
            ))}
          </ScrollView>
        ) : data.length > 0 ? (
          <ScrollView>
            <VStack w="100%" alignItems="flex-start" p={1}>
              {data.map((item, index) => (
                <AccordionComponent data={item} iconUrl={iconUrl} key={index} />
              ))}
            </VStack>
          </ScrollView>
        ) : (
          <Box flex={1} alignItems="center" justifyContent="center">
            <Text color="gray.500" fontSize="md" textAlign="center">
              {noDataMsg}
            </Text>
          </Box>
        )}
      </VStack>
    </View>
  );
};

export default Notice;
