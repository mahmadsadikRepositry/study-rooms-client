import { useState } from 'react';
import RoomSearch from './components/RoomSearch.jsx';
import BookingForm from './components/BookingForm.jsx';
import ReportForm from './components/ReportForm.jsx';

export default function App() {
  const [selectedRoom, setSelectedRoom] = useState('');

  return (
    <main>
      <h1>Study Room Booker</h1>
      <p className="intro">
        Prebuilt React frontend. You build the Express API behind it (Ch. 6: query strings, POST bodies, file uploads).
      </p>
      <RoomSearch onBook={setSelectedRoom} />
      <BookingForm roomId={selectedRoom} onRoomChange={setSelectedRoom} />
      <ReportForm />
    </main>
  );
}
