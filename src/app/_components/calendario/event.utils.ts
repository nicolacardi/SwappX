import { EventInput } from '@fullcalendar/angular';

let eventGuid = 0;
const TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today

export const INITIAL_EVENTS: EventInput[] = [
//   {
//     id: createEventId(),
//     title: 'All-day event',
//     start: TODAY_STR,
//     eventColor: '#378006',
//     imageUrl: '../../assets/Antelope.jpg'
    
//   },
  {
    id: createEventId(),
    title: 'Timed event',
    start: TODAY_STR + 'T11:00:00',
    eventColor: '#FF0000',
    buttonMsg: 'hai premuto evento delle 11',
    buttonText: 'Butt1'
  },
  {
    id: createEventId(),
    title: 'Timed event',
    start: TODAY_STR + 'T13:00:00',
    eventColor: '#FF0000',
    buttonMsg: 'hai premuto evento delle 13',
    buttonText: 'Butt2'


  }
  
];

export function createEventId() {
  return String(eventGuid++);
}
