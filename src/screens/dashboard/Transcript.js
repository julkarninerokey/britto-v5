import React, {useEffect, useState} from 'react';
import {View, Platform} from 'react-native';
import {VStack, ScrollView, Text, Button, HStack, Input, Box, Actionsheet, useDisclose} from 'native-base';
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
  const [noDataMessage, setNoDataMessage] = useState('No transcript data found.');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [form, setForm] = useState({
    applicationType: '',
    numTranscript: '',
    numEnvelope: '',
  });

  const appTypeDisclose = useDisclose();
  const numTranscriptDisclose = useDisclose();
  const numEnvelopeDisclose = useDisclose();

  const applicationTypes = [
    { label: 'URGENT', value: 'URGENT' },
    { label: 'REGULAR', value: 'REGULAR' },
  ];

  const numTranscriptOptions = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
  ];

  const numEnvelopeOptions = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
  ];

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

        if (response?.status === 201) {
          setNoDataMessage(response?.message || 'No transcript data found.');
          setData([]);
        } else if (
          response?.status === 200 &&
          (Array.isArray(response.data) ? response.data.length > 0 : Array.isArray(response.result) && response.result.length > 0)
        ) {
          const transcriptData = response?.data || response?.result || [];
          const accordionData = transcriptData.map((item, idx) => ({
            title: `${item.exam_title}`,
            content: `Result: ${item.result}, Published: ${item.result_pub_date}`,
            details: (
              <VStack space={2}>
                <Text>Exam Title: {item.exam_title}</Text>
                <Text>Held In: {item.exam_held_in}</Text>
                <Text>Result: {item.result}</Text>
                <Text>Published: {item.result_pub_date}</Text>
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
        } else {
          setNoDataMessage('No transcript data found.');
          setData([]);
        }
      } catch (error) {
        console.error('Error loading transcript data:', error);
        setNoDataMessage('No transcript data found.');
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
          {/* Application Type as Radio Buttons */}
          <Text mb={1}>Application Type</Text>
          <HStack space={2}>
            {applicationTypes.map(opt => (
              <Button
                key={opt.value}
                variant={form.applicationType === opt.value ? 'solid' : 'outline'}
                colorScheme="primary"
                onPress={() => handleFormChange('applicationType', opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </HStack>
          {/* Number of Transcript as Input */}
          <Input
            mt={3}
            placeholder="Number of Transcript"
            keyboardType="numeric"
            value={form.numTranscript}
            onChangeText={value => handleFormChange('numTranscript', value.replace(/[^0-9]/g, ''))}
          />
          {/* Number of Envelope as Input */}
          <Input
            placeholder="Number of Envelope"
            keyboardType="numeric"
            value={form.numEnvelope}
            onChangeText={value => handleFormChange('numEnvelope', value.replace(/[^0-9]/g, ''))}
          />
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
                <AccordionComponent key={index} data={item} iconUrl={iconUrl} />
              ))}
            </VStack>
          </ScrollView>
        ) : (
          <ScrollView>
            <Box flex={1} alignItems="center" justifyContent="center" mt={8} p={6}>
              <Text color="gray.500" fontSize="md" textAlign="center">
                {noDataMessage}
              </Text>
            </Box>
          </ScrollView>
        )}
        {renderDrawer()}
      </VStack>
    </View>
  );
};

export default Transcript;
