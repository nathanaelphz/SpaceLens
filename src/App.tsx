import { useMemo, useState } from "react";
import "./App.css";

type Booking = {
  start: string;
  end: string;
};

type Room = {
  name: string;
  category: string;
  capacity: number;
  image: string;
  features: string[];
  bookings: Booking[];
};

const roomNames = [
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
  "Culinary Bar Theatre 1",
  "Culinary Bar Theatre 2",
  "Discussion Room 1 (4th floor Library)",
  "Discussion Room 2 (4th floor Library)",
  "Discussion Room 3 (4th floor Library)",
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

const roomImages = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85",
];

const sampleFeatures = [
  ["Whiteboard", "Display", "Power outlets"],
  ["Whiteboard", "Power outlets"],
  ["Display", "Video conferencing"],
  ["Display", "Power outlets"],
];

const sampleBookings: Booking[][] = [
  [],
  [{ start: "10:00", end: "11:00" }],
  [{ start: "13:00", end: "14:30" }],
  [{ start: "09:30", end: "10:30" }],
];

function getCategory(name: string) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("auditorium") || lowerName.includes("theatre")) {
    return "Auditorium";
  }
  if (lowerName.includes("tech lab")) return "Technology lab";
  if (lowerName.includes("discussion room")) return "Study room";
  if (lowerName.includes("presentation room")) return "Meeting room";
  if (lowerName.includes("studio")) return "Studio";
  if (lowerName.includes("workshop")) return "Workshop";
  if (lowerName.includes("lab")) return "Laboratory";
  return "Campus space";
}

const rooms: Room[] = roomNames.map((name, index) => ({
  name,
  category: getCategory(name),
  capacity: [80, 60, 40, 12, 10, 8, 6][index % 7],
  image: roomImages[index % roomImages.length],
  features: sampleFeatures[index % sampleFeatures.length],
  bookings: sampleBookings[index % sampleBookings.length],
}));

const equipmentOptions = [
  "Whiteboard",
  "Display",
  "Video conferencing",
];

function getToday() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function timeFromMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function App() {
  const today = getToday();

  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(2);
  const [capacity, setCapacity] = useState(2);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const endTime = timeFromMinutes(toMinutes(startTime) + duration * 60);

  const availableRooms = useMemo(() => {
    const requestedStart = toMinutes(startTime);
    const requestedEnd = requestedStart + duration * 60;

    return rooms.filter((room) => {
      const hasCapacity = room.capacity >= capacity;
      const hasEquipment = selectedEquipment.every((item) =>
        room.features.includes(item),
      );

      // Reject a room if any booking overlaps any part of the requested interval.
      const hasNoConflict = room.bookings.every((booking) => {
        const bookingStart = toMinutes(booking.start);
        const bookingEnd = toMinutes(booking.end);
        const overlaps =
          requestedStart < bookingEnd && requestedEnd > bookingStart;

        return !overlaps;
      });

      return hasCapacity && hasEquipment && hasNoConflict;
    });
  }, [capacity, duration, selectedEquipment, startTime]);

  function toggleEquipment(item: string) {
    setSelectedEquipment((current) =>
      current.includes(item)
        ? current.filter((feature) => feature !== item)
        : [...current, item],
    );
  }

  function scrollToResults() {
    document.getElementById("spaces")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="SpaceLens home">
          <span className="brand-mark">S</span>
          <span>SpaceLens</span>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a className="active" href="#spaces">Find a space</a>
          <a href="#about">About</a>
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
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          >
            <option value={1}>1 hour</option>
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
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

        <button className="search-button" type="button" onClick={scrollToResults}>
          Find spaces <span aria-hidden="true">↗</span>
        </button>
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

        <div className="equipment-filters" aria-label="Filter by equipment">
          <span className="filter-caption">I need</span>
          {equipmentOptions.map((item) => (
            <button
              className={`chip ${selectedEquipment.includes(item) ? "selected" : ""}`}
              key={item}
              type="button"
              aria-pressed={selectedEquipment.includes(item)}
              onClick={() => toggleEquipment(item)}
            >
              <span className="chip-check">
                {selectedEquipment.includes(item) ? "✓" : "+"}
              </span>
              {item}
            </button>
          ))}
        </div>

        <p className="time-note">
          Showing spaces for <strong>{startTime}–{endTime}</strong> on{" "}
          <strong>{formatDate(date)}</strong>
        </p>

        {availableRooms.length > 0 ? (
          <div className="room-grid">
            {availableRooms.map((room) => (
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
                    <span className="capacity-badge" title="Demo capacity">
                      <span aria-hidden="true">♙</span> {room.capacity}
                    </span>
                  </div>

                  <div className="feature-list">
                    {room.features.slice(0, 3).map((feature) => (
                      <span className="feature" key={feature}>{feature}</span>
                    ))}
                  </div>

                  <button
                    className="details-button"
                    type="button"
                    onClick={() => setSelectedRoom(room)}
                  >
                    Room details <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">⌕</span>
            <h3>No spaces match just yet</h3>
            <p>Try another time, group size, or equipment filter.</p>
            <button
              className="reset-button"
              type="button"
              onClick={() => {
                setCapacity(2);
                setSelectedEquipment([]);
              }}
            >
              Clear equipment and capacity filters
            </button>
          </div>
        )}
      </section>

      <footer className="footer" id="about">
        <a className="footer-brand" href="#">SpaceLens</a>
        <p>
          Room names are based on the visible APU Classroom Finder list.
          Availability, capacity, and equipment are fictional demo data.
        </p>
      </footer>

      {selectedRoom && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelectedRoom(null)}
        >
          <section
            className="room-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close room details"
              onClick={() => setSelectedRoom(null)}
            >
              ×
            </button>
            <p className="eyebrow">{selectedRoom.category}</p>
            <h2 id="modal-title">{selectedRoom.name}</h2>
            <p className="modal-description">
              A campus space listed in the SpaceLens prototype.
            </p>
            <div className="modal-facts">
              <div><span>Campus</span><strong>APU Campus</strong></div>
              <div><span>Demo capacity</span><strong>{selectedRoom.capacity} people</strong></div>
              <div><span>Requested time</span><strong>{startTime}–{endTime}</strong></div>
            </div>
            <p className="modal-note">
              Availability and room details are sample data for this prototype.
            </p>
            <button
              className="search-button modal-done"
              type="button"
              onClick={() => setSelectedRoom(null)}
            >
              Done
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;