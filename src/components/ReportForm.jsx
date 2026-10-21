import { useState } from 'react';
import { callApi } from '../api.js';

// Part C — multipart/form-data file upload.
// FormData lets the browser set the multipart Content-Type (with its boundary) for us;
// Express hands the request to Formidable.
// Expected API contract:
//   201 -> { "report": { roomId, problem, photo: { url, ... } } }
//   400 -> { "error": "message" }
export default function ReportForm() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [lastCall, setLastCall] = useState('');

  async function submit(e) {
    e.preventDefault();
    const form = e.target;
    const result = await callApi('POST', '/api/reports', { body: new FormData(form) });
    setLastCall(`POST /api/reports -> ${result.status || 'no response'}`);

    if (result.ok) {
      setReport(result.data.report || result.data);
      setError('');
      form.reset();
    } else {
      setReport(null);
      setError(result.problem || result.data?.error || 'Request failed');
    }
  }

  return (
    <section aria-labelledby="report-h">
      <h2 id="report-h">
        3. Report a problem <small>(POST /api/reports + file upload)</small>
      </h2>
      <form onSubmit={submit}>
        <label htmlFor="r-room">Room</label>
        <input id="r-room" name="roomId" placeholder="e.g. T305" />

        <label htmlFor="problem">What is wrong?</label>
        <textarea id="problem" name="problem" rows="2" />

        <label htmlFor="photo">Photo (image, max 2 MB)</label>
        <input id="photo" name="photo" type="file" accept="image/*" />

        <button>Send report</button>
      </form>

      {lastCall && <p className="mono">{lastCall}</p>}
      {error && (
        <p role="alert" className="error">
          Error: {error}
        </p>
      )}
      {report && (
        <div role="status" className="ok">
          <p>
            Report saved for room {report.roomId}: {report.problem}
          </p>
          {report.photo?.url && (
            <img
              src={report.photo.url}
              width="240"
              alt={`Photo of the problem in room ${report.roomId}`}
            />
          )}
        </div>
      )}
    </section>
  );
}
