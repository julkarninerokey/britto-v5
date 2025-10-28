import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Box, Text, VStack, HStack, Badge, Fab, Icon } from 'native-base';
import AppBar from '../../components/AppBar';
import { color, toast } from '../../service/utils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const RNCalendars = (() => {
  try {
    // Lazy require to avoid runtime crash if dependency is not installed yet
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-calendars');
  } catch (e) {
    return null;
  }
})();

function FallbackCalendar({ onSelect }) {
  const today = useMemo(() => new Date(), []);
  const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${today.getFullYear()}`;
  return (
    <Box bg={color.background} p={4} borderRadius={12} m={3}>
      <VStack space={3}>
        <Text fontSize="lg" fontWeight="600" color={color.text}>
          Calendar
        </Text>
        <Text fontSize="sm" color={color.secondary}>
          react-native-calendars is not installed. Showing a simple fallback.
        </Text>
        <Text fontSize="md" color={color.primary} onPress={() => onSelect(dateStr)}>
          Today: {dateStr} (tap to select)
        </Text>
      </VStack>
    </Box>
  );
}

const demoEvents = [
  { id: 'e1', date: '2025-11-02', title: 'CSE 201 Midterm', type: 'Exam', time: '10:00 AM', desc: 'Room 301' },
  { id: 'e2', date: '2025-11-03', title: 'Leave - Personal errand', type: 'Leave', time: 'All Day', desc: '' },
  { id: 'e3', date: '2025-11-05', title: 'Math 102 Quiz', type: 'Exam', time: '9:00 AM', desc: 'Chapter 3-4' },
  { id: 'e4', date: '2025-11-05', title: 'Lab Submission', type: 'Deadline', time: '11:59 PM', desc: 'Data Structures' },
  { id: 'e5', date: '2025-11-10', title: 'Medical Leave', type: 'Leave', time: 'All Day', desc: '' },
];

function groupEventsByDate(events) {
  return events.reduce((acc, ev) => {
    acc[ev.date] = acc[ev.date] ? [...acc[ev.date], ev] : [ev];
    return acc;
  }, {});
}

const CalendarScreen = () => {
  const [selected, setSelected] = useState('');
  const eventsByDate = useMemo(() => groupEventsByDate(demoEvents), []);

  const onDayPress = (day) => {
    const value = day?.dateString || day;
    setSelected(value);
  };

  const CalendarComponent = RNCalendars?.Calendar;
  const markingType = RNCalendars ? 'multi-dot' : undefined;

  // Build markedDates with simple dots per date
  const marked = useMemo(() => {
    const m: any = {};
    Object.keys(eventsByDate).forEach((d) => {
      const dots = (eventsByDate[d] || []).map((ev) => ({
        color:
          ev.type === 'Exam' ? color.accent : ev.type === 'Leave' ? color.warning : color.info,
      }));
      m[d] = dots.length > 1 ? { dots } : { marked: true, dotColor: dots[0]?.color || color.accent };
    });
    if (selected) {
      m[selected] = { ...(m[selected] || {}), selected: true, selectedColor: color.primary };
    }
    return m;
  }, [eventsByDate, selected]);

  return (
    <View style={{ flex: 1, backgroundColor: color.secondaryBackground }}>
      <AppBar title="Calendar" />
      <VStack flex={1}>
        {CalendarComponent ? (
          <CalendarComponent
            onDayPress={onDayPress}
            markedDates={marked}
            markingType={markingType}
            theme={{
              selectedDayBackgroundColor: color.primary,
              todayTextColor: color.accent,
              arrowColor: color.primary,
              monthTextColor: color.text,
              textSectionTitleColor: color.muted,
            }}
          />
        ) : (
          <FallbackCalendar onSelect={onDayPress} />
        )}

        {/* Selected day events */}
        <VStack space={2} m={3}>
          <Text fontSize="md" color={color.text} fontWeight="600">
            {selected ? `Events on ${selected}` : 'Upcoming Events'}
          </Text>
          {selected && (eventsByDate[selected] || []).length === 0 && (
            <Text fontSize="sm" color={color.secondary}>No events for this day.</Text>
          )}
          {(selected ? eventsByDate[selected] || [] : demoEvents)
            .slice(0, selected ? undefined : 5)
            .map((ev) => (
              <Box key={ev.id} bg={color.background} p={3} borderRadius={10} borderWidth={1} borderColor={color.light}>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack>
                    <Text fontSize="md" color={color.text} fontWeight="600">{ev.title}</Text>
                    <Text fontSize="xs" color={color.muted}>{ev.time}{ev.desc ? ` • ${ev.desc}` : ''}</Text>
                  </VStack>
                  <Badge bg={ev.type === 'Exam' ? color.accent : ev.type === 'Leave' ? color.warning : color.info} _text={{ color: 'white' }}>
                    {ev.type}
                  </Badge>
                </HStack>
              </Box>
            ))}
        </VStack>

        {/* Add event FAB */}
        <Fab
          renderInPortal={false}
          shadow={2}
          icon={
            <VStack alignItems="center" space={0}>
              <Text color="white" fontSize="xs" fontWeight="500">
               <Icon as={MaterialIcons} name="add" color="white" /> Add New Event
              </Text>
            </VStack>
          }
          bg={color.primary}
          onPress={() => toast('success', 'New Event', 'Event creation coming soon')}
          position="absolute"
          bottom={6}
          right={6}
          _pressed={{ bg: color.primaryLight }}
        />
      </VStack>
    </View>
  );
};

export default CalendarScreen;
