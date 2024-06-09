import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {VStack, ScrollView} from 'native-base';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getCertificate} from '../../service/api';
import 'react-native-pager-view';
import {IconListLoading} from '../../components/LoadingAnimation';
import AccordionComponent from '../../components/AccordionComponent';

const Certificate = ({navigation}) => {
  const [data, setData] = useState([]);
  const [iconUrl, setIconUrl] = useState();
  useEffect(() => {
    const checkForData = async () => {
      const reg = await AsyncStorage.getItem('reg');
      const dashboard = await AsyncStorage.getItem('dashboard');
      const syllabusIcon = JSON.parse(dashboard).find(
        item => item.screen === 'Certificate',
      ).icon;
      setIconUrl(syllabusIcon);
      const response = await getCertificate(reg);
      const accordionData = response?.result.map(item => ({
        title: `${item.exam_title}`,
        content: `You can Apply for your Certificate.`,
        icon: 'ios-arrow-down',
        badges: [`Provisional Certificate`, `Diploma Certificate`], // You can customize the badges as needed
      }));
      setData(accordionData);
    };

    checkForData();
  }, [data]);

  return (
    <View style={{flex: 1}}>
      <AppBar title="Certificate" />
      <VStack w={'100%'} flex={1}>
        {data.length > 0 ? (
          <ScrollView>
            <VStack w="100%" alignItems="flex-start" p={1}>
              {data.map((item, index) => (
                <AccordionComponent data={item} iconUrl={iconUrl} />
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

export default Certificate;
