import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {VStack, ScrollView, Text, Button, HStack, Select, CheckIcon} from 'native-base';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getTranscript} from '../../service/api';
import 'react-native-pager-view';
import {IconListLoading} from '../../components/LoadingAnimation';
import AccordionComponent from '../../components/AccordionComponent';
import { formatDateTime } from '../../service/utils';
import BottomDrawer from '../../components/BottomDrawer';
import {toast} from '../../service/utils';

const Transcript = ({navigation}) => {
  const [data, setData] = useState([]);
  const [iconUrl, setIconUrl] = useState();
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [form, setForm] = useState({
    applicationType: '',
    numTranscript: '',
    numEnvelope: '',
  });

  useEffect(() => {
    const checkForData = async () => {
      setLoading(true);
      try {
        const reg = await AsyncStorage.getItem('reg');
        const dashboard = await AsyncStorage.getItem('dashboard');
        let syllabusIcon = undefined;
        try {
          syllabusIcon = JSON.parse(dashboard)?.find(
            item => item.screen === 'Certificate',
          )?.icon;
        } catch (err) {
          console.error('Dashboard JSON parse error:', err);
        }
        setIconUrl(syllabusIcon);
        const response = await getTranscript(reg);
        const transcriptData = response?.data || [];
        const accordionData = transcriptData.map((item, idx) => ({
          title: `${item.exam_title}`,
          content: `Result: ${item.result}, Published: ${item.result_pub_date}`,
          details: (
            <VStack space={2}>
              <Text>Exam Title: {item.exam_title}</Text>
              <Text>Result: {item.result}</Text>
              <Text>Result Published: {item.result_pub_date}</Text>
              <Text>Held In: {item.exam_held_in}</Text>
              <Text>Status: {item.result_publication_status}</Text>
              {/* Applications Table */}
              {Array.isArray(item.applications) && item.applications.length > 0 ? (
                <VStack mt={2}>
                  <Text bold>Applications:</Text>
                  {item.applications.map((app, aidx) => (
                    <VStack key={aidx} mt={1} p={2} borderWidth={1} borderRadius={8}>
                      <Text>Application ID: {app.trannscript_id}</Text>
                      <Text>Delivery Type: {app.delivery_type}</Text>
                      <Text>Payment Status: {app.payment_status === 1 ? 'Paid' : 'Unpaid'}</Text>
                      <Text>Status: {app.app_status}</Text>
                      <Text>Transaction ID: {app.transaction_id}</Text>
                      <Text>Amount: {app.amount}</Text>
                      <Text>Degree Name: {app.degree_name}</Text>
                      <Text>Degree Level: {app.degree_level}</Text>
                      <Text>Passing Academic Year: {app.passing_acyr}</Text>
                      <Text>Number of Transcripts: {app.num_of_transcript}</Text>
                      <Text>Number of Envelopes: {app.num_of_envelop}</Text>
                      <Text>Expected Delivery Date: {formatDateTime(app.expected_delivery_date)}</Text>
                      <Text>Application Time: {formatDateTime(app.create_at)}</Text>
                      <Text>Last Update: {formatDateTime(app.updated_at)}</Text>
                      <Text>Comment: {app.comment}</Text>
                      {/* Add more fields as needed */}
                    </VStack>
                  ))}
                </VStack>
              ) : (
                <Button mt={2} onPress={() => { setSelectedExam(item); setShowDrawer(true); }}>
                  Apply Now
                </Button>
              )}
            </VStack>
          ),
          icon: 'ios-arrow-down',
          badges: [
            `${item.applications?.length > 0 ? 'View Applications' : 'Apply Now'} `,
          ],
        }));
        setData(accordionData);
      } catch (error) {
        console.error('Error loading transcript data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    checkForData();
  }, []);

  const handleFormChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setShowDrawer(false);
    toast('success', 'Application Saved.' || 'You will be notified further updates.');
    setForm({ applicationType: '', numTranscript: '', numEnvelope: '' });
  };

  const renderDrawer = () => {
    if (!showDrawer || !selectedExam) return null;
    return (
      <BottomDrawer visible={showDrawer} onClose={() => setShowDrawer(false)}>
        <Text fontSize="lg" bold mb={2}>Apply for Transcript </Text>
        <Text>Exam: {selectedExam.exam_title}</Text>
        <VStack space={3} mt={2}>
          <Select
            selectedValue={form.applicationType}
            minWidth="200"
            accessibilityLabel="Choose Application Type"
            placeholder="Application Type"
            _selectedItem={{bg: 'teal.600', endIcon: <CheckIcon size="5" />}}
            onValueChange={value => handleFormChange('applicationType', value)}
          >
            <Select.Item label="URGENT" value="URGENT" />
            <Select.Item label="REGULAR" value="REGULAR" />
          </Select>
          <Select
            selectedValue={form.numTranscript}
            minWidth="200"
            accessibilityLabel="Number of Transcript"
            placeholder="Number of Transcript"
            _selectedItem={{bg: 'teal.600', endIcon: <CheckIcon size="5" />}}
            onValueChange={value => handleFormChange('numTranscript', value)}
          >
            {[1,2,3,4,5].map(n => (
              <Select.Item key={n} label={String(n)} value={String(n)} />
            ))}
          </Select>
          <Select
            selectedValue={form.numEnvelope}
            minWidth="200"
            accessibilityLabel="Number of Envelope"
            placeholder="Number of Envelope"
            _selectedItem={{bg: 'teal.600', endIcon: <CheckIcon size="5" />}}
            onValueChange={value => handleFormChange('numEnvelope', value)}
          >
            {[1,2,3,4,5].map(n => (
              <Select.Item key={n} label={String(n)} value={String(n)} />
            ))}
          </Select>
        </VStack>
        <Button mt={4} colorScheme="primary" onPress={handleSubmit}>Submit & Pay Now</Button>
        <Button mt={2} variant="ghost" onPress={() => setShowDrawer(false)}>Close</Button>
      </BottomDrawer>
    );
  };

  return (
    <View style={{flex: 1}}>
      <AppBar title="Transcript" />
      <VStack w={'100%'} flex={1}>
        {!loading && data.length > 0 ? (
          <ScrollView>
            <VStack w="100%" alignItems="flex-start" p={1}>
              {data.map((item, index) => (
                <AccordionComponent key={index} data={item} iconUrl={iconUrl} />
              ))}
            </VStack>
          </ScrollView>
        ) : !loading && data.length === 0 ? (
          <ScrollView>
            <VStack w="100%" alignItems="center" p={4}>
              <Text>No transcript data found.</Text>
            </VStack>
          </ScrollView>
        ) : (
          <ScrollView>
            {[...Array(3)].map((_, index) => (
              <IconListLoading key={index} />
            ))}
          </ScrollView>
        )}
        {renderDrawer()}
      </VStack>
    </View>
  );
};

export default Transcript;
