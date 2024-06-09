import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {VStack, ScrollView} from 'native-base';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getResult} from '../../service/api';
import 'react-native-pager-view';
import {IconListLoading} from '../../components/LoadingAnimation';
import AccordionComponent from '../../components/AccordionComponent';

const Result = ({navigation}) => {
  const [data, setData] = useState([]);
  const [iconUrl, setIconUrl] = useState();
  useEffect(() => {
    const checkForData = async () => {
      const reg = await AsyncStorage.getItem('reg');
      const dashboard = await AsyncStorage.getItem('dashboard');
      const syllabusIcon = JSON.parse(dashboard).find(
        item => item.screen === 'Result',
      ).icon;
      setIconUrl(syllabusIcon);
      const response = await getResult(reg);
      const accordionData = response?.result.map(item => ({
        title: `${item.exam_title}`,
        content: `Held in: ${item.exam_held_in}, Exam Roll: ${item.exam_roll}, Result Publication Date: ${item.result_pub_date} `,
        icon: 'ios-arrow-down',
        badges: [
          `${item.result || 'Improvement'}`,
          `GPA ${
            item.final_cgpa ||
            item.eight_gpa ||
            item.seven_gpa ||
            item.six_gpa ||
            item.five_gpa ||
            item.four_gpa ||
            item.three_gpa ||
            item.second_gpa ||
            item.final_cgpa ||
            '-'
          }`,
        ], // You can customize the badges as needed
      }));
      setData(accordionData);
    };

    checkForData();
  }, [data]);

  return (
    <View style={{flex: 1}}>
      <AppBar title="Result" />
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

export default Result;
