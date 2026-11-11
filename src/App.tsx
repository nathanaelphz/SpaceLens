import { useMemo, useState } from "react";
import "./App.css";

type ClassSlot = {
  day: number; // Sunday = 0, Tuesday = 2, Thursday = 4
  start: string;
  end: string;
  code: string;
  title: string;
  lecturer?: string;
};

type Room = {
  name: string;
  category: string;
  capacity: number;
  image: string;
  features: string[];
  timetable: ClassSlot[];
  hasTimetableSample: boolean;
  librarySeats?: { total: number; occupied: number };
};

const names = [
  "Auditorium 1 @ Level 7",
  "Auditorium 2 @ Level 6",
  "Auditorium 3 @ Block C Level 9",
  "Auditorium 4 @ Level 3",
  "Auditorium 5 @ Level 3",
  "Auditorium 6 @ Block C Level 3",
  "Auditorium 7 @ Block A Level 3",
  "B-01-GEOLOGY LAB",
  "B-01-RESERVOIR LAB",
  "B-02-01-Model Making Studio 1",
  "B-02-02-Clay Workshop",
  "B-02-03-3D Workshop",
  "B-02-06-Eco-Innovation Lab",
  "B-02-07 Model Making Studio 2",
  "B-03-CADCAM LAB",
  "B-03-Design-LAB",
  "B-03-Robotic LAB",
  "B-04-01",
  "Culinary Bar Theatre 1",
  "Culinary Bar Theatre 2",
  "Discussion Room 1 (4th floor Library)",
  "Discussion Room 2 (4th floor Library)",
  "Discussion Room 3 (4th floor Library)",
  "Library Open Study Area",
  "Library Computer Zone",
  "E-05-01 (Architecture Studio)",
  "Presentation Room 1 @ Cyber range",
  "Presentation Room 2 @ Cyber range",
  "Presentation Room 3 @ Cyber range",
  "S-05-01 (Studio 1)",
  "S-05-03 (Architecture Studio)",
  "S-06-02 (Design Suite)",
  "S-07-01 (Studio 3)",
  "S-07-02 (Drawing Studio)",
  "Tech Lab 4-01",
  "Tech Lab 4-02",
  "Tech Lab 4-03",
  "Tech Lab 5-01 Financial Trading Centre",
  "Tech Lab 5-02 Cisco Lab",
  "Tech Lab 6-10 (ID Suite)",
  "Tech Lab 6-12 (Pixels Suite)",
  "Tech Lab 6-15 (CGI Suite)",
  "Tech Lab 6-16 (iMac Suite)",
  "Tech Lab 6-17 (Animation Suite)",
  "Tech Lab 6-18 (VFX Suite)",
  "Tech Lab 6-19 (Greenscreen)",
];

const images = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85",
];

const facilityOptions = [
  "Whiteboard",
  "Projector",
  "Power outlets",
  "Video conferencing",
  "Quiet study",
];

const featureSamples = [
  ["Whiteboard", "Projector", "Power outlets"],
  ["Whiteboard", "Power outlets"],
  ["Projector", "Video conferencing"],
  ["Power outlets", "Quiet study"],
  ["Whiteboard", "Video conferencing"],
];

function getCategory(name: string) {
  const n = name.toLowerCase();
  if (n.includes("library open")) return "Library · Open study";
  if (n.includes("computer zone")) return "Library · Computer area";
  if (n.includes("discussion room")) return "Library · Discussion room";
  if (n.includes("auditorium") || n.includes("theatre")) return "Auditorium";
  if (n.includes("tech lab")) return "Technology lab";
  if (n.includes("presentation room")) return "Meeting room";
  if (n.includes("studio")) return "Studio";
  if (n.includes("workshop")) return "Workshop";
  if (n.includes("lab")) return "Laboratory";
  return "Campus space";
}

const rooms: Room[] = names.map((name, index) => {
  const isLibraryOpen = name === "Library Open Study Area";
  const isLibraryComputer = name === "Library Computer Zone";
  const hasTimetableSample = name === "B-04-01";

  return {
    name,
    category: getCategory(name),
    capacity: isLibraryOpen ? 60 : isLibraryComputer ? 24 : [80, 60, 40, 12, 10, 8, 6][index % 7],
    image: images[index % images.length],
    features: isLibraryOpen
      ? ["Power outlets", "Quiet study"]
      : isLibraryComputer
        ? ["Power outlets"]
        : featureSamples[index % featureSamples.length],
    librarySeats: isLibraryOpen
      ? { total: 60, occupied: 38 }
      : isLibraryComputer
        ? { total: 24, occupied: 17 }
        : undefined,
    hasTimetableSample,
    timetable: hasTimetableSample
      ? [
          {
            day: 2,
            start: "08:30",
            end: "10:30",
            code: "CT044-3-1-IOOP-L-10",
            title: "Introduction to Object Oriented Programming",
            lecturer: "Dr. Hong Siaw Swin",
          },
          {
            day: 4,
            start: "13:00",
            end: "15:00",
            code: "DEMO",
            title: "Scheduled class · sample timetable entry",
          },
        ]
      : [],
  };
});

const weekDays = [
  { day: 1, name: "Monday" },
  { day: 2, name: "Tuesday" },
  { day: 3, name: "Wednesday" },
  { day: 4, name: "Thursday" },
  { day: 5, name: "Friday" },
];

function localDate(date: Date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function getToday() {
  return localDate(new Date());
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function mondayOf(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return localDate(date);
}

function shiftDate(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDate(date);
}

function prettyDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
  });
}

function App() {
  const today = getToday();
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [capacity, setCapacity] = useState(2);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [weekStart, setWeekStart] = useState(mondayOf(today));

  const endTime = fromMinutes(toMinutes(startTime) + durationMinutes);
  const selectedDay = new Date(`${date}T12:00:00`).getDay();

  const availableRooms = useMemo(() => {
    const requestedStart = toMinutes(startTime);
    const requestedEnd = requestedStart + durationMinutes;

    return rooms.filter((room) => {
      const capacityMatches = room.capacity >= capacity;
      const facilitiesMatch = selectedFacilities.every((facility) =>
        room.features.includes(facility),
      );

      const hasNoClassConflict = room.timetable
        .filter((slot) => slot.day === selectedDay)
        .every((slot) => {
          const overlaps =
            requestedStart < toMinutes(slot.end) &&
            requestedEnd > toMinutes(slot.start);
          return !overlaps;
        });

      return capacityMatches && facilitiesMatch && hasNoClassConflict;
    });
  }, [capacity, durationMinutes, selectedDay, selectedFacilities, startTime]);

  function toggleFacility(facility: string) {
    setSelectedFacilities((current) =>
      current.includes(facility)
        ? current.filter((item) => item !== facility)
        : [...current, facility],
    );
  }

  function openRoom(room: Room) {
    setSelectedRoom(room);
    setWeekStart(mondayOf(date));
  }

  function timelineFor(room: Room, day: number) {
    if (!room.hasTimetableSample) return [];

    const slots = room.timetable
      .filter((slot) => slot.day === day)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    const timeline: Array<{
      start: string;
      end: string;
      title: string;
      code?: string;
      kind: "free" | "class";
      lecturer?: string;
    }> = [];

    let cursor = 8 * 60;

    for (const slot of slots) {
      const classStart = toMinutes(slot.start);
      const classEnd = toMinutes(slot.end);

      if (classStart > cursor) {
        timeline.push({
          start: fromMinutes(cursor),
          end: fromMinutes(classStart),
          title: "Free",
          kind: "free",
        });
      }

      timeline.push({
        start: slot.start,
        end: slot.end,
        title: slot.title,
        code: slot.code,
        lecturer: slot.lecturer,
        kind: "class",
      });

      cursor = Math.max(cursor, classEnd);
    }

    if (cursor < 18 * 60) {
      timeline.push({
        start: fromMinutes(cursor),
        end: "18:00",
        title: "Free",
        kind: "free",
      });
    }

    return timeline;
  }

  const durationOptions = Array.from({ length: 12 }, (_, index) => (index + 1) * 30);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="SpaceLens home">
          <span className="brand-mark">S</span>
          <span>SpaceLens</span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a className="active" href="#spaces">Find a space</a>
        </nav>
        <span className="campus-label">APU campus</span>
      </header>

      <section className="hero">
        <div className="hero-copy-block">
          <p className="eyebrow">A little more room to think</p>
          <h1>Your space.<br /><span>Found.</span></h1>
          <p className="hero-copy">
            Find a place to focus, meet, and make something great.
          </p>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="orbit-dot" />
          <span className="orbit-label">space<br />to think</span>
        </div>
      </section>

      <section className="search-panel" aria-label="Room search filters">
        <div className="filter-fields">
          <div className="filter-field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              min={today}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="start-time">Start time</label>
            <input
              id="start-time"
              type="time"
              min="07:00"
              max="20:00"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="duration">Duration</label>
            <select
              id="duration"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
            >
              {durationOptions.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes < 60
                    ? `${minutes} minutes`
                    : minutes % 60 === 0
                      ? `${minutes / 60} ${minutes === 60 ? "hour" : "hours"}`
                      : `${Math.floor(minutes / 60)} hr 30 min`}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label htmlFor="capacity">People</label>
            <select
              id="capacity"
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
            >
              <option value={1}>1+ people</option>
              <option value={2}>2+ people</option>
              <option value={4}>4+ people</option>
              <option value={6}>6+ people</option>
              <option value={10}>10+ people</option>
              <option value={20}>20+ people</option>
            </select>
          </div>

          <button
            className="search-button"
            type="button"
            onClick={() => document.getElementById("spaces")?.scrollIntoView({ behavior: "smooth" })}
          >
            Find spaces <span aria-hidden="true">↗</span>
          </button>
        </div>

        <div className="facility-row">
          <span className="filter-caption">I need</span>
          {facilityOptions.map((facility) => (
            <label className="facility-check" key={facility}>
              <input
                type="checkbox"
                checked={selectedFacilities.includes(facility)}
                onChange={() => toggleFacility(facility)}
              />
              <span className="custom-check" aria-hidden="true">✓</span>
              <span>{facility}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="results-section" id="spaces">
        <div className="results-heading">
          <div>
            <p className="eyebrow">Made for your next big idea</p>
            <h2>Spaces for you</h2>
          </div>
          <p className="result-count">
            <span className="status-dot" />
            {availableRooms.length} sample spaces
          </p>
        </div>

        <p className="time-note">
          Showing spaces for <strong>{startTime}–{endTime}</strong> on{" "}
          <strong>{new Date(`${date}T12:00:00`).toLocaleDateString("en-MY", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}</strong>
        </p>

        {availableRooms.length > 0 ? (
          <div className="room-grid">
            {availableRooms.map((room) => {
              const seatsFree = room.librarySeats
                ? room.librarySeats.total - room.librarySeats.occupied
                : 0;

              return (
                <article className="room-card" key={room.name}>
                  <div className="room-image-wrap">
                    <img src={room.image} alt="" className="room-image" />
                    <span className="availability">
                      <span className="status-dot" /> Available
                    </span>
                  </div>

                  <div className="room-info">
                    <div className="room-title-row">
                      <div>
                        <p className="room-category">{room.category}</p>
                        <h3>{room.name}</h3>
                      </div>
                      <span className="capacity-badge">♙ {room.capacity}</span>
                    </div>

                    {room.librarySeats && (
                      <div className="occupancy-box">
                        <div>
                          <span className="occupancy-label">Library occupancy · demo</span>
                          <strong>{seatsFree} seats free</strong>
                        </div>
                        <span className="occupancy-icon" aria-hidden="true">◉</span>
                        <small>
                          Simulated computer vision count: {room.librarySeats.occupied} of{" "}
                          {room.librarySeats.total} occupied
                        </small>
                      </div>
                    )}

                    <div className="feature-list">
                      {room.features.map((feature) => (
                        <span className="feature" key={feature}>{feature}</span>
                      ))}
                    </div>

                    <button
                      className="details-button"
                      type="button"
                      onClick={() => openRoom(room)}
                    >
                      View weekly timetable <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">⌕</span>
            <h3>No spaces match just yet</h3>
            <p>Try another time, group size, or facility filter.</p>
          </div>
        )}
      </section>

      <footer className="footer">
        <a className="footer-brand" href="#">SpaceLens</a>
        <p>
          Room names are based on the visible APU Classroom Finder list.
          Timetable and library occupancy are sample data, not live APSpace or camera data.
        </p>
      </footer>

      {selectedRoom && (
        <div className="modal-backdrop" onClick={() => setSelectedRoom(null)}>
          <section
            className="timetable-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="timetable-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close timetable"
              onClick={() => setSelectedRoom(null)}
            >
              ×
            </button>

            <p className="eyebrow">{selectedRoom.category} · APU Campus</p>
            <h2 id="timetable-title">{selectedRoom.name}</h2>
            <p className="modal-description">
              Weekly room timetable · sample view
            </p>

            <div className="week-toolbar">
              <button
                type="button"
                className="week-arrow"
                aria-label="Previous week"
                onClick={() => setWeekStart(shiftDate(weekStart, -7))}
              >
                ←
              </button>
              <strong>Week of {prettyDate(weekStart)}</strong>
              <button
                type="button"
                className="week-arrow"
                aria-label="Next week"
                onClick={() => setWeekStart(shiftDate(weekStart, 7))}
              >
                →
              </button>
            </div>

            {!selectedRoom.hasTimetableSample ? (
              <div className="no-timetable">
                <strong>Sample timetable not added for this room yet.</strong>
                <span>
                  The real university timetable needs to be supplied or connected
                  before SpaceLens can show its actual classes.
                </span>
              </div>
            ) : (
              <div className="week-list">
                {weekDays.map(({ day, name }, index) => {
                  const dateOfDay = shiftDate(weekStart, index);
                  const timeline = timelineFor(selectedRoom, day);

                  return (
                    <section className="day-section" key={name}>
                      <div className="day-heading">
                        <strong>{name}</strong>
                        <span>{prettyDate(dateOfDay)}</span>
                      </div>

                      {timeline.length === 0 ? (
                        <div className="day-free">No classes scheduled · free in this sample</div>
                      ) : (
                        timeline.map((item, itemIndex) => (
                          <div
                            className={`timeline-item ${item.kind}`}
                            key={`${name}-${item.start}-${itemIndex}`}
                          >
                            <span className="timeline-time">
                              {item.start}–{item.end}
                            </span>
                            <div>
                              <strong>{item.kind === "free" ? "Free" : item.title}</strong>
                              {item.code && item.code !== "DEMO" && (
                                <span className="timeline-sub">{item.code}</span>
                              )}
                              {item.lecturer && (
                                <span className="timeline-sub">{item.lecturer}</span>
                              )}
                              {item.code === "DEMO" && (
                                <span className="timeline-sub">Demo timetable entry</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </section>
                  );
                })}
              </div>
            )}

            <p className="modal-note">
              This prototype does not currently sync with the university timetable.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;