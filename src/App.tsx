import { useEffect, useMemo, useState } from "react";
import "./App.css";

type ClassSlot = {
  day: number;
  start: string;
  end: string;
  code: string;
  title: string;
};

type PlaceFilter = "all" | "library" | "discussion";

type Room = {
  name: string;
  category: string;
  capacity: number;
  features: string[];
  timetable: ClassSlot[];
  librarySeats?: { total: number; area: "study" | "computer" };
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
  "B-04-01",
  "Culinary Bar Theatre 1",
  "Culinary Bar Theatre 2",
  "Discussion Room 1 (4th floor Library)",
  "Discussion Room 2 (4th floor Library)",
  "Discussion Room 3 (4th floor Library)",
  "Discussion Room 4 (4th floor Library)",
  "Discussion Room 5 (4th floor Library)",
  "Discussion Room 6 (4th floor Library)",
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
  "Tech Lab 4-07",
  "Tech Lab 5-01 Financial Trading Centre",
  "Tech Lab 5-02 Cisco Lab",
  "Tech Lab 6-01",
  "Tech Lab 6-02",
  "Tech Lab 6-03",
  "Tech Lab 6-04",
  "Tech Lab 6-05",
  "Tech Lab 6-06",
  "Tech Lab 6-07",
  "Tech Lab 6-08",
  "Tech Lab 6-09",
  "Tech Lab 6-10 (ID Suite)",
  "Tech Lab 6-11",
  "Tech Lab 6-12 (Pixels Suite)",
  "Tech Lab 6-13",
  "Tech Lab 6-14",
  "Tech Lab 6-15 (CGI Suite)",
  "Tech Lab 6-16 (iMac Suite)",
  "Tech Lab 6-17 (Animation Suite)",
  "Tech Lab 6-18 (VFX Suite)",
  "Tech Lab 6-19 (Greenscreen)",
  "Tech Lab 7-01",
  "Tech Lab 7-02",
];

const facilityOptions = [
  "Whiteboard",
  "Projector",
  "Power outlets",
  "Video conferencing",
  "Quiet study",
];

const facilityPatterns = [
  ["Whiteboard", "Projector", "Power outlets"],
  ["Whiteboard", "Power outlets"],
  ["Projector", "Video conferencing"],
  ["Power outlets", "Quiet study"],
  ["Whiteboard", "Video conferencing"],
  ["Projector", "Power outlets", "Quiet study"],
];

const classBlocks = [
  { start: "08:30", end: "10:30" },
  { start: "10:30", end: "12:30" },
  { start: "13:00", end: "15:00" },
  { start: "15:00", end: "17:00" },
];

const demoSubjects = [
  "Sample lecture",
  "Sample tutorial",
  "Project workshop",
  "Group study booking",
  "Sample laboratory class",
];

function getCategory(name: string) {
  const lower = name.toLowerCase();

  if (lower.includes("library open")) return "Library · Open study";
  if (lower.includes("computer zone")) return "Library · Computer area";
  if (lower.includes("discussion room")) return "Library · Discussion room";
  if (lower.includes("auditorium") || lower.includes("theatre")) return "Auditorium";
  if (lower.includes("tech lab")) return "Technology lab";
  if (lower.includes("presentation room")) return "Meeting room";
  if (lower.includes("studio")) return "Studio";
  if (lower.includes("workshop")) return "Workshop";
  if (lower.includes("lab")) return "Laboratory";
  return "Campus space";
}

function makeTimetable(roomName: string, roomIndex: number): ClassSlot[] {
  // The Tuesday class is from the timetable screenshot you shared.
  if (roomName === "B-04-01") {
    return [
      {
        day: 2,
        start: "08:30",
        end: "10:30",
        code: "CT044-3-1-IOOP-L-10",
        title: "Introduction to Object Oriented Programming",
      },
      {
        day: 4,
        start: "13:00",
        end: "15:00",
        code: "DEMO",
        title: "Sample scheduled class",
      },
    ];
  }

  const slots: ClassSlot[] = [];

  // Fictional classes are generated for weekdays. Saturday and Sunday stay free.
  for (const day of [1, 2, 3, 4, 5]) {
    if ((roomIndex + day) % 5 === 0) continue;

    const firstBlock = (roomIndex + day * 2) % classBlocks.length;
    const blocksForDay = [firstBlock];

    if ((roomIndex + day) % 3 === 0) {
      blocksForDay.push((firstBlock + 2) % classBlocks.length);
    }

    for (const blockIndex of blocksForDay) {
      const block = classBlocks[blockIndex];
      slots.push({
        day,
        start: block.start,
        end: block.end,
        code: `DEMO-${String(roomIndex + 1).padStart(2, "0")}`,
        title: demoSubjects[(roomIndex + day + blockIndex) % demoSubjects.length],
      });
    }
  }

  return slots;
}

const rooms: Room[] = roomNames.map((name, index) => {
  const category = getCategory(name);
  const isAuditorium = category === "Auditorium";
  const isOpenLibrary = name === "Library Open Study Area";
  const isComputerLibrary = name === "Library Computer Zone";
  const isDiscussion = category === "Library · Discussion room";

  let capacity = 12;
  if (isAuditorium) capacity = 120;
  else if (isOpenLibrary) capacity = 60;
  else if (isComputerLibrary) capacity = 24;
  else if (isDiscussion) capacity = 6;
  else if (category === "Technology lab") capacity = 30;
  else if (category === "Laboratory") capacity = 24;
  else if (category === "Studio" || category === "Workshop") capacity = 20;

  return {
    name,
    category,
    capacity,
    features: facilityPatterns[index % facilityPatterns.length],
    timetable: makeTimetable(name, index),
    librarySeats: isOpenLibrary
      ? { total: 60, area: "study" }
      : isComputerLibrary
        ? { total: 24, area: "computer" }
        : undefined,
  };
});

const weekdays = [
  { day: 1, name: "Monday" },
  { day: 2, name: "Tuesday" },
  { day: 3, name: "Wednesday" },
  { day: 4, name: "Thursday" },
  { day: 5, name: "Friday" },
  { day: 6, name: "Saturday" },
  { day: 0, name: "Sunday" },
];

function localDate(date: Date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(minutes: number) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function mondayOf(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
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

function getToday() {
  return localDate(new Date());
}

function App() {
  const today = getToday();

  const [date, setDate] = useState(today);
  const [roomQuery, setRoomQuery] = useState("");
  const [placeFilter, setPlaceFilter] = useState<PlaceFilter>("all");
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [capacity, setCapacity] = useState(2);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [weekStart, setWeekStart] = useState(mondayOf(today));

  // Simulated library occupancy for the prototype, not a live camera feed.
  const [libraryOccupancy, setLibraryOccupancy] = useState({
    study: 38,
    computer: 17,
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLibraryOccupancy((current) => ({
        study: Math.max(0, Math.min(60, current.study + (Math.random() < 0.5 ? -1 : 1))),
        computer: Math.max(0, Math.min(24, current.computer + (Math.random() < 0.5 ? -1 : 1))),
      }));
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  const selectedWeekday = new Date(`${date}T12:00:00`).getDay();
  const absoluteStart = toMinutes(startTime);
  const absoluteEnd = absoluteStart + durationMinutes;

  const endTimeText =
    absoluteEnd >= 1440
      ? `${fromMinutes(absoluteEnd)} (+1 day)`
      : fromMinutes(absoluteEnd);

  const libraryFreeSeats =
    (60 - libraryOccupancy.study) + (24 - libraryOccupancy.computer);

  const libraryAreaCount = rooms.filter((room) =>
    room.category === "Library · Open study" ||
    room.category === "Library · Computer area",
  ).length;

  const discussionRoomCount = rooms.filter(
    (room) => room.category === "Library · Discussion room",
  ).length;

  const availableRooms = useMemo(() => {
    const query = roomQuery.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesText =
        !query ||
        room.name.toLowerCase().includes(query) ||
        room.category.toLowerCase().includes(query);

      const isLibrarySeatArea =
        room.category === "Library · Open study" ||
        room.category === "Library · Computer area";

      const isDiscussionRoom = room.category === "Library · Discussion room";

      const matchesPlace =
        placeFilter === "all" ||
        (placeFilter === "library" && isLibrarySeatArea) ||
        (placeFilter === "discussion" && isDiscussionRoom);

      let roomCapacity = room.capacity;

      if (room.librarySeats?.area === "study") {
        roomCapacity = room.librarySeats.total - libraryOccupancy.study;
      } else if (room.librarySeats?.area === "computer") {
        roomCapacity = room.librarySeats.total - libraryOccupancy.computer;
      }

      const capacityMatches = roomCapacity >= capacity;
      const facilitiesMatch = selectedFacilities.every((facility) =>
        room.features.includes(facility),
      );

      let hasClassConflict = false;
      const lastOffset = Math.floor((absoluteEnd - 1) / 1440);

      for (let offset = 0; offset <= lastOffset; offset++) {
        const weekday = (selectedWeekday + offset) % 7;

        // This sample dataset has no Saturday or Sunday classes.
        if (weekday === 0 || weekday === 6) continue;

        const intervalStart = Math.max(absoluteStart, offset * 1440) - offset * 1440;
        const intervalEnd = Math.min(absoluteEnd, (offset + 1) * 1440) - offset * 1440;

        hasClassConflict = room.timetable.some((slot) => {
          if (slot.day !== weekday) return false;

          return (
            intervalStart < toMinutes(slot.end) &&
            intervalEnd > toMinutes(slot.start)
          );
        });

        if (hasClassConflict) break;
      }

      return (
        matchesText &&
        matchesPlace &&
        capacityMatches &&
        facilitiesMatch &&
        !hasClassConflict
      );
    });
  }, [
    absoluteEnd,
    absoluteStart,
    capacity,
    libraryOccupancy,
    placeFilter,
    roomQuery,
    selectedFacilities,
    selectedWeekday,
  ]);

  function toggleFacility(facility: string) {
    setSelectedFacilities((current) =>
      current.includes(facility)
        ? current.filter((item) => item !== facility)
        : [...current, facility],
    );
  }

  function choosePlace(filter: PlaceFilter) {
    setPlaceFilter(filter);
    setRoomQuery("");
    document.getElementById("spaces")?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollToResults() {
    document.getElementById("spaces")?.scrollIntoView({ behavior: "smooth" });
  }

  function openRoom(room: Room) {
    setSelectedRoom(room);
    setWeekStart(mondayOf(date));
  }

  function timelineFor(room: Room, day: number) {
    if (day === 0 || day === 6) {
      return [
        {
          start: "00:00",
          end: "24:00",
          title: "Free · no demo classes",
          free: true,
        },
      ];
    }

    const slots = room.timetable
      .filter((slot) => slot.day === day)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    const timeline: Array<{
      start: string;
      end: string;
      title: string;
      code?: string;
      free: boolean;
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
          free: true,
        });
      }

      timeline.push({
        start: slot.start,
        end: slot.end,
        title: slot.title,
        code: slot.code,
        free: false,
      });

      cursor = Math.max(cursor, classEnd);
    }

    if (cursor < 18 * 60) {
      timeline.push({
        start: fromMinutes(cursor),
        end: "18:00",
        title: "Free",
        free: true,
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
        <nav className="nav-links">
          <a className="active" href="#spaces">Find a space</a>
        </nav>
        <span className="campus-label">APU campus</span>
      </header>

      <section className="hero">
        <p className="eyebrow">A little more room to think</p>
        <h1>Your space.<br /><span>Found.</span></h1>
        <p className="hero-copy">
          Find a place to focus, meet, and make something great.
        </p>
      </section>

      <section className="search-panel" aria-label="Room search filters">
        <div className="quick-space-links">
          <button
            className={`quick-space-button library ${placeFilter === "library" ? "selected" : ""}`}
            type="button"
            onClick={() => choosePlace("library")}
          >
            <span className="quick-space-icon" aria-hidden="true">⌂</span>
            <span className="quick-space-copy">
              <strong>Library seats</strong>
              <small>{libraryFreeSeats} demo seats free · {libraryAreaCount} areas</small>
            </span>
            <span className="quick-space-arrow" aria-hidden="true">→</span>
          </button>

          <button
            className={`quick-space-button discussion ${placeFilter === "discussion" ? "selected" : ""}`}
            type="button"
            onClick={() => choosePlace("discussion")}
          >
            <span className="quick-space-icon" aria-hidden="true">▦</span>
            <span className="quick-space-copy">
              <strong>Discussion rooms</strong>
              <small>{discussionRoomCount} sample rooms · up to 6 people</small>
            </span>
            <span className="quick-space-arrow" aria-hidden="true">→</span>
          </button>

          {placeFilter !== "all" && (
            <button
              className="show-all-button"
              type="button"
              onClick={() => choosePlace("all")}
            >
              Show all rooms
            </button>
          )}
        </div>

        <form
          className="room-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            scrollToResults();
          }}
        >
          <div className="room-search-intro">
            <span className="room-search-kicker">QUICK SEARCH</span>
            <strong>Looking for a specific room?</strong>
          </div>

          <div className="room-search-input">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              aria-label="Search rooms"
              placeholder="Try “Tech Lab”, “Auditorium”, or “Library”"
              value={roomQuery}
              onChange={(event) => {
                setRoomQuery(event.target.value);
                setPlaceFilter("all");
              }}
            />
          </div>

          <button className="room-search-button" type="submit">
            See availability <span aria-hidden="true">→</span>
          </button>
        </form>

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
              <option value={50}>50+ people</option>
              <option value={100}>100+ people</option>
            </select>
          </div>

          <button className="search-button" type="button" onClick={scrollToResults}>
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
            {availableRooms.length} sample spaces available
          </p>
        </div>

        <p className="time-note">
          Showing spaces for <strong>{startTime}–{endTimeText}</strong> on{" "}
          <strong>
            {new Date(`${date}T12:00:00`).toLocaleDateString("en-MY", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </strong>
        </p>

        {placeFilter === "library" && (
          <p className="demo-live-note">
            Demo occupancy updates every 10 seconds. It is not connected to live cameras.
          </p>
        )}

        {availableRooms.length > 0 ? (
          <div className="room-grid">
            {availableRooms.map((room) => {
              const occupied =
                room.librarySeats?.area === "study"
                  ? libraryOccupancy.study
                  : room.librarySeats?.area === "computer"
                    ? libraryOccupancy.computer
                    : 0;

              const freeSeats = room.librarySeats
                ? room.librarySeats.total - occupied
                : 0;

              return (
                <article className="room-card" key={room.name}>
                  <div className="room-info">
                    <div className="room-title-row">
                      <div>
                        <p className="room-category">{room.category}</p>
                        <h3>{room.name}</h3>
                      </div>
                      <span className="capacity-badge">
                        ♙ {room.librarySeats ? room.librarySeats.total : room.capacity}{" "}
                        {room.librarySeats ? "seats" : "people"}
                      </span>
                    </div>

                    {room.librarySeats && (
                      <div className="occupancy-box">
                        <strong>{freeSeats} seats free now</strong>
                        <span>
                          Demo live count: {occupied} of {room.librarySeats.total} occupied
                        </span>
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
            <h3>No spaces match your search</h3>
            <p>Try another room name, time, group size, or facility.</p>
          </div>
        )}
      </section>

      <footer className="footer">
        <a className="footer-brand" href="#">SpaceLens</a>
        <p>
          Timetables, capacities, facilities, and library occupancy are demo data.
          Weekends and unscheduled hours are shown as free.
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
              Weekly timetable · fictional prototype schedule
            </p>

            <div className="week-toolbar">
              <button
                className="week-arrow"
                type="button"
                aria-label="Previous week"
                onClick={() => setWeekStart(shiftDate(weekStart, -7))}
              >
                ←
              </button>
              <strong>Week of {prettyDate(weekStart)}</strong>
              <button
                className="week-arrow"
                type="button"
                aria-label="Next week"
                onClick={() => setWeekStart(shiftDate(weekStart, 7))}
              >
                →
              </button>
            </div>

            <div className="week-list">
              {weekdays.map(({ day, name }, index) => {
                const dateOfDay = shiftDate(weekStart, index);
                const timeline = timelineFor(selectedRoom, day);

                return (
                  <section className="day-section" key={name}>
                    <div className="day-heading">
                      <strong>{name}</strong>
                      <span>{prettyDate(dateOfDay)}</span>
                    </div>

                    {timeline.map((item, itemIndex) => (
                      <div
                        className={`timeline-item ${item.free ? "free" : "class"}`}
                        key={`${name}-${item.start}-${itemIndex}`}
                      >
                        <span className="timeline-time">
                          {item.start}–{item.end}
                        </span>
                        <div>
                          <strong>{item.title}</strong>
                          {item.code && (
                            <span className="timeline-sub">
                              {item.code === "DEMO" ? "Sample timetable entry" : item.code}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </section>
                );
              })}
            </div>

            <p className="modal-note">
              This timetable is generated sample data and does not sync with APSpace.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;