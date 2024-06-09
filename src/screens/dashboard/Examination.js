import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {VStack, ScrollView} from 'native-base';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getExam} from '../../service/api';
import 'react-native-pager-view';
import {IconListLoading} from '../../components/LoadingAnimation';
import AccordionComponent from '../../components/AccordionComponent';

const Examination = ({navigation}) => {
  const [data, setData] = useState([]);
  const [iconUrl, setIconUrl] = useState();
  useEffect(() => {
    const checkForData = async () => {
      const reg = await AsyncStorage.getItem('reg');
      const dashboard = await AsyncStorage.getItem('dashboard');
      const syllabusIcon = JSON.parse(dashboard).find(
        item => item.screen === 'Examination',
      ).icon;
      setIconUrl(syllabusIcon);
      const response = await getExam(reg);
      const accordionData = response?.result.map(item => ({
        title: `${item.EXAM_NAME} ${item.REGISTERED_EXAM_YEAR}`,
        content: `Last Date: ${item.LAST_DATE}, Exam Start: ${
          item.EXAM_START_DATE
        }, Hall Verification: ${
          item.HALL_VERIFY === '1' ? 'Verified' : 'Pending'
        } `,
        icon: 'ios-arrow-down',
        badges: [
          `${item.ADMIT_CARD_ISSUE === '1' ? 'Admit Issued' : 'Admit Pending'}`,
          `${
            item.REGISTERED_STUDENTS_EXAM_ROLL
              ? 'Roll: ' + item.REGISTERED_STUDENTS_EXAM_ROLL
              : 'Running'
          }`,
        ], // You can customize the badges as needed
      }));
      setData(accordionData);
    };

    checkForData();
  }, [data]);

  return (
    <View style={{flex: 1}}>
      <AppBar title="Form-fillup" />
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

export default Examination;
