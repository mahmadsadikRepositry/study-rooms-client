import { useEffect, useState } from 'react';
import { callApi } from '../api.js';

// Part A — HTTP GET with a query string.
// React builds the query string with URLSearchParams; Express reads it as req.query.
async function fetchRooms({ building, minSeats, quiet }) {
  const params = new URLSearchParams();
  if (building) params.set('building', building);
  if (minSeats) params.set('minSeats', minSeats);
  if (quiet) params.set('quiet', 'yes');

  const url = `/api/rooms?${params}`;
  const result = await callApi('GET', url);
  if (result.ok && !Array.isArray(result.data.results)) {
    result.ok = false;
    result.problem = 'GET /api/rooms must return JSON like { "results": [ ...rooms ] }.';
  }
  return { url, ...result };
}

export default function RoomSearch({ onBook }) {
  const [filters, setFilters] = useState({ building: '', minSeats: '', quiet: false });
  const [results, setResults] = useState([]);
  const [lastCall, setLastCall] = useState('');
  const [error, setError] = useState('');

  // apply the result of one GET request to the component's state
  function show({ url, ok, status, data, problem }) {
    setLastCall(`GET ${url} -> ${status || 'no response'}`);
    setResults(ok ? data.results : []);
    setError(problem);
  }

  async function search(e) {
    e.preventDefault();
    show(await fetchRooms(filters));
  }

  // load all rooms once when the component first appears
  useEffect(() => {
    let ignore = false;
    fetchRooms({}).then((data) => {
      if (!ignore) show(data);
    });
    return () => {
      ignore = true; // StrictMode runs effects twice in development
    };
  }, []);

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({ ...filters, [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <section aria-labelledby="search-h">
      <h2 id="search-h">
        1. Find a room <small>(GET /api/rooms + query string)</small>
      </h2>
      <form onSubmit={search} className="row">
        <label>
          Building
          <select name="building" value={filters.building} onChange={update}>
            <option value="">Any</option>
            <option value="library">library</option>
            <option value="tech">tech</option>
            <option value="student">student</option>
          </select>
        </label>
        <label>
          Min seats
          <input
            name="minSeats"
            type="number"
            min="1"
            max="10"
            value={filters.minSeats}
            onChange={update}
          />
        </label>
        <label className="check">
          <input name="quiet" type="checkbox" checked={filters.quiet} onChange={update} />{' '}
          Quiet only
        </label>
        <button>Search</button>
      </form>

      {lastCall && <p className="mono">{lastCall}</p>}
      {error && (
        <p role="alert" className="error">
          Backend: {error}
        </p>
      )}

      <table>
        <caption>{results.length} room(s) found</caption>
        <thead>
          <tr>
            <th scope="col">Room</th>
            <th scope="col">Building</th>
            <th scope="col">Seats</th>
            <th scope="col">Quiet</th>
            <th scope="col">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.building}</td>
              <td>{r.seats}</td>
              <td>{r.quiet ? 'Yes' : 'No'}</td>
              <td>
                <button type="button" onClick={() => onBook(r.id)}>
                  Book {r.id}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
