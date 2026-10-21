import { useState } from 'react';
import { callApi } from '../api.js';

const empty = { name: '', email: '', date: '', hours: '1', purpose: '' };

// Part B — HTTP POST with a JSON body.
// React sends JSON; Express reads it as req.body thanks to express.json().
// Expected API contract:
//   201 -> { "booking": { id, name, email, roomId, date, hours, ... } }
//   400 -> { "errors": { fieldName: "message", ... } }
export default function BookingForm({ roomId, onRoomChange }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(null);
  const [lastCall, setLastCall] = useState('');
  const [problem, setProblem] = useState('');

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBooking(null);
    const result = await callApi('POST', '/api/bookings', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, roomId, hours: Number(form.hours) })
    });
    setLastCall(`POST /api/bookings -> ${result.status || 'no response'}`);
    setProblem(result.problem);

    if (result.status === 400 && result.data?.errors) {
      setErrors(result.data.errors); // show the SERVER's validation messages
    } else if (result.ok) {
      setErrors({});
      setBooking(result.data.booking || result.data);
      setForm(empty);
    } else if (result.status === 400) {
      setErrors({});
      setProblem('POST /api/bookings returned 400 without an "errors" object.');
    }
  }

  const err = (field) =>
    errors[field] && (
      <p className="error" id={`${field}-err`}>
        Error: {errors[field]}
      </p>
    );

  return (
    <section aria-labelledby="book-h">
      <h2 id="book-h">
        2. Book a room <small>(POST /api/bookings + JSON body)</small>
      </h2>

      {booking && (
        <p role="status" className="ok">
          Booking {booking.id ? `#${booking.id} ` : ''}confirmed: room {booking.roomId} on{' '}
          {booking.date} for {booking.hours} hour(s).
        </p>
      )}
      {lastCall && <p className="mono">{lastCall}</p>}
      {problem && (
        <p role="alert" className="error">
          Backend: {problem}
        </p>
      )}

      {/* noValidate: let the SERVER do the validation so you can see it work */}
      <form onSubmit={submit} noValidate>
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" value={form.name} onChange={update} />
        {err('name')}

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={update} />
        {err('email')}

        <label htmlFor="roomId">Room</label>
        <input
          id="roomId"
          name="roomId"
          value={roomId}
          onChange={(e) => onRoomChange(e.target.value.toUpperCase())}
          placeholder="Pick one in the table above"
        />
        {err('roomId')}

        <label htmlFor="date">Date</label>
        <input id="date" name="date" type="date" value={form.date} onChange={update} />
        {err('date')}

        <label htmlFor="hours">Hours</label>
        <select id="hours" name="hours" value={form.hours} onChange={update}>
          <option>1</option>
          <option>2</option>
          <option>3</option>
        </select>
        {err('hours')}

        <label htmlFor="purpose">Purpose (optional)</label>
        <textarea id="purpose" name="purpose" rows="2" value={form.purpose} onChange={update} />
        {err('purpose')}

        <button>Book room</button>
      </form>
    </section>
  );
}
