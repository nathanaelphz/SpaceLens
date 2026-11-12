import { useEffect, useMemo, useState } from "react";
import "./App.css";

type ClassSlot = {
  day: number; // Sunday = 0; Monday = 1
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
  facilities: string[];
  timetable: ClassSlot[];
  libraryArea?: "study" | "computer";
  librarySeatTotal?: number;
};

type RoomMatch = {
  room: Room;
  score: number;
  reasons: string[];
};

type AlternativeTime = {
  room: Room;
  date: string;
  time: string;
  score: number;
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
  "Quiet study",
  "Video conferencing",
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

const demoClassNames = [
  "Sample lecture",
  "Sample tutorial",
  "Project workshop",
  "Group study booking",
  "Sample laboratory class",
];

const sampleStudentTimetable: ClassSlot[] = [
  { day: 1, start: "09:00", end: "11:00", code: "SAMPLE-01", title: "Sample class" },
  { day: 1, start: "13:00", end: "15:00", code: "SAMPLE-02", title: "Sample tutorial" },
  { day: 2, start: "08:30", end: "10:30", code: "SAMPLE-03", title: "Sample lecture" },
  { day: 2, start: "15:00", end: "17:00", code: "SAMPLE-04", title: "Sample class" },
  { day: 3, start: "10:00", end: "12:00", code: "SAMPLE-05", title: "Sample class" },
  { day: 3, start: "14:00", end: "16:00", code: "SAMPLE-06", title: "Sample tutorial" },
  { day: 4, start: "08:30", end: "10:30", code: "SAMPLE-07", title: "Sample lecture" },
  { day: 4, start: "15:00", end: "16:00", code: "SAMPLE-08", title: "Sample class" },
  { day: 5, start: "09:00", end: "12:00", code: "SAMPLE-09", title: "Sample lecture" },
];

const weekDays = [
  { day: 1, name: "Monday" },
  { day: 2, name: "Tuesday" },
  { day: 3, name: "Wednesday" },
  { day: 4, name: "Thursday" },
  { day: 5, name: "Friday" },
  { day: 6, name: "Saturday" },
  { day: 0, name: "Sunday" },
];

function getCategory(name: string) {
  const lower = name.toLowerCase();

  if (name === "Library Open Study Area") return "Library · Open study";
  if (name === "Library Computer Zone") return "Library · Computer area";
  if (lower.includes("discussion room")) return "Library · Discussion room";
  if (lower.includes("auditorium") || lower.includes("theatre")) return "Auditorium";
  if (lower.includes("tech lab")) return "Technology lab";
  if (lower.includes("presentation room")) return "Meeting room";
  if (lower.includes("studio")) return "Studio";
  if (lower.includes("workshop")) return "Workshop";
  if (lower.includes("lab")) return "Laboratory";
  return "Campus space";
}

function makeRoomTimetable(name: string, index: number, category: string): ClassSlot[] {
  // Library study areas use occupancy data and do not show class timetables.
  if (category === "Library · Open study" || category === "Library · Computer area") {
    return [];
  }

  // This class is visible in the timetable screenshot you shared.
  if (name === "B-04-01") {
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

  // Generated weekday entries are sample data; weekends intentionally have no classes.
  for (const day of [1, 2, 3, 4, 5]) {
    if ((index + day) % 5 === 0) continue;

    const firstBlock = (index + day * 2) % classBlocks.length;
    const blockIndexes = [firstBlock];

    if ((index + day) % 3 === 0) {
      blockIndexes.push((firstBlock + 2) % classBlocks.length);
    }

    for (const blockIndex of blockIndexes) {
      const block = classBlocks[blockIndex];
      slots.push({
        day,
        start: block.start,
        end: block.end,
        code: `DEMO-${String(index + 1).padStart(2, "0")}`,
        title: demoClassNames[(index + day + blockIndex) % demoClassNames.length],
      });
    }
  }

  return slots;
}

const rooms: Room[] = roomNames.map((name, index) => {
  const category = getCategory(name);
  const isAuditorium = category === "Auditorium";
  const isDiscussion = category === "Library · Discussion room";
  const isLibraryStudy = category === "Library · Open study";
  const isLibraryComputer = category === "Library · Computer area";

  let capacity = 12;
  if (isAuditorium) capacity = 120;
  else if (isDiscussion) capacity = 6;
  else if (category === "Technology lab") capacity = 30;
  else if (category === "Laboratory") capacity = 24;
  else if (category === "Studio" || category === "Workshop") capacity = 20;
  else if (isLibraryStudy) capacity = 60;
  else if (isLibraryComputer) capacity = 24;

  return {
    name,
    category,
    capacity,
    facilities: facilityPatterns[index % facilityPatterns.length],
    timetable: makeRoomTimetable(name, index, category),
    libraryArea: isLibraryStudy ? "study" : isLibraryComputer ? "computer" : undefined,
    librarySeatTotal: isLibraryStudy ? 60 : isLibraryComputer ? 24 : undefined,
  };
});

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

function fromMinutes(total: number) {
  const normalized = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(
    normalized % 60,
  ).padStart(2, "0")}`;
}

function addDays(dateString: string, amount: number) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return localDate(date);
}

function mondayOf(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return localDate(date);
}

function shortDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
  });
}

function longDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function durationLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes % 60 === 0) return `${minutes / 60} ${minutes === 60 ? "hour" : "hours"}`;
  return `${Math.floor(minutes / 60)} hr 30 min`;
}

function hasOverlap(
  slots: ClassSlot[],
  day: number,
  start: number,
  end: number,
) {
  return slots.some((slot) => {
    if (slot.day !== day) return false;
    return start < toMinutes(slot.end) && end > toMinutes(slot.start);
  });
}

function roomHasConflict(room: Room, date: string, startTime: string, duration: number) {
  if (room.libraryArea) return false;

  const weekday = new Date(`${date}T12:00:00`).getDay();
  const start = toMinutes(startTime);
  const end = start + duration;
  const lastDayOffset = Math.floor((end - 1) / 1440);

  for (let offset = 0; offset <= lastDayOffset; offset++) {
    const day = (weekday + offset) % 7;

    // Saturday and Sunday have no demo classes.
    if (day === 0 || day === 6) continue;

    const segmentStart = Math.max(start, offset * 1440) - offset * 1440;
    const segmentEnd = Math.min(end, (offset + 1) * 1440) - offset * 1440;

    if (hasOverlap(room.timetable, day, segmentStart, segmentEnd)) return true;
  }

  return false;
}

function studentHasClassConflict(date: string, startTime: string, duration: number) {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  const start = toMinutes(startTime);
  const end = start + duration;
  const lastDayOffset = Math.floor((end - 1) / 1440);

  for (let offset = 0; offset <= lastDayOffset; offset++) {
    const day = (weekday + offset) % 7;
    if (day === 0 || day === 6) continue;

    const segmentStart = Math.max(start, offset * 1440) - offset * 1440;
    const segmentEnd = Math.min(end, (offset + 1) * 1440) - offset * 1440;

    if (hasOverlap(sampleStudentTimetable, day, segmentStart, segmentEnd)) return true;
  }

  return false;
}

function App() {
  const today = getToday();

  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("11:00");
  const [duration, setDuration] = useState(90);
  const [people, setPeople] = useState(2);
  const [roomQuery, setRoomQuery] = useState("");
  const [placeFilter, setPlaceFilter] = useState<PlaceFilter>("all");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [useSampleSchedule, setUseSampleSchedule] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [studentScheduleOpen, setStudentScheduleOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(mondayOf(today));

  // Simulated live occupancy. It is deliberately labelled as demo data.
  const [libraryOccupied, setLibraryOccupied] = useState({
    study: 38,
    computer: 17,
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLibraryOccupied((current) => ({
        study: Math.max(0, Math.min(60, current.study + (Math.random() < 0.5 ? -1 : 1))),
        computer: Math.max(0, Math.min(24, current.computer + (Math.random() < 0.5 ? -1 : 1))),
      }));
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  const librarySeatsFree =
    60 - libraryOccupied.study + (24 - libraryOccupied.computer);

  const durationOptions = Array.from({ length: 12 }, (_, index) => (index + 1) * 30);

  const searchResults = useMemo(() => {
    const query = roomQuery.trim().toLowerCase();
    const studentConflict = studentHasClassConflict(date, startTime, duration);

    function matchesPlace(room: Room) {
      if (placeFilter === "all") return true;
      if (placeFilter === "library") return Boolean(room.libraryArea);
      return room.category === "Library · Discussion room";
    }

    function availableCapacity(room: Room) {
      if (room.libraryArea === "study") return 60 - libraryOccupied.study;
      if (room.libraryArea === "computer") return 24 - libraryOccupied.computer;
      return room.capacity;
    }

    function passesFilters(room: Room, candidateDate: string, candidateTime: string) {
      const matchesName =
        !query ||
        room.name.toLowerCase().includes(query) ||
        room.category.toLowerCase().includes(query);

      const matchesFacilities = selectedFacilities.every((facility) =>
        room.facilities.includes(facility),
      );

      return (
        matchesName &&
        matchesPlace(room) &&
        availableCapacity(room) >= people &&
        matchesFacilities &&
        !roomHasConflict(room, candidateDate, candidateTime, duration)
      );
    }

    function scoreRoom(room: Room, candidateDate: string, candidateTime: string) {
      const capacity = availableCapacity(room);
      const profileGap = !useSampleSchedule ||
        !studentHasClassConflict(candidateDate, candidateTime, duration);
      const capacityFit = Math.round(15 * Math.min(1, people / Math.max(1, capacity)));
      const facilityFit = selectedFacilities.length > 0 ? 10 : 6;
      const scheduleFit = profileGap ? 20 : 8;
      return Math.min(99, 59 + capacityFit + facilityFit + scheduleFit);
    }

    function reasonsFor(room: Room) {
      const reasons = [
        `Fits ${people} ${people === 1 ? "person" : "people"}`,
        `${durationLabel(duration)} clear`,
      ];

      if (selectedFacilities.length > 0) {
        reasons.push(...selectedFacilities.slice(0, 2));
      } else if (room.facilities.length > 0) {
        reasons.push(room.facilities[0]);
      }

      if (useSampleSchedule && !studentConflict) {
        reasons.push("Fits sample class gap");
      }

      return reasons.slice(0, 4);
    }

    const matches: RoomMatch[] = rooms
      .filter((room) => passesFilters(room, date, startTime))
      .map((room) => ({
        room,
        score: scoreRoom(room, date, startTime),
        reasons: reasonsFor(room),
      }))
      .sort((a, b) => b.score - a.score || a.room.name.localeCompare(b.room.name));

    const alternatives: AlternativeTime[] = [];

    if (matches.length === 0) {
      for (let dayOffset = 0; dayOffset < 14 && alternatives.length < 3; dayOffset++) {
        const candidateDate = addDays(date, dayOffset);
        let firstMinute =
          dayOffset === 0
            ? Math.ceil((toMinutes(startTime) + 30) / 30) * 30
            : 8 * 60;

        // Scan half-hour increments. Midnight can be a valid result because there are no demo classes then.
        for (
          let minute = firstMinute;
          minute + duration <= 1440 && alternatives.length < 3;
          minute += 30
        ) {
          const candidateTime = fromMinutes(minute);
          const room = rooms
            .filter((candidate) => passesFilters(candidate, candidateDate, candidateTime))
            .sort(
              (a, b) =>
                scoreRoom(b, candidateDate, candidateTime) -
                scoreRoom(a, candidateDate, candidateTime),
            )[0];

          if (room) {
            alternatives.push({
              room,
              date: candidateDate,
              time: candidateTime,
              score: scoreRoom(room, candidateDate, candidateTime),
            });
          }
        }
      }
    }

    return { matches, alternatives, studentConflict };
  }, [
    date,
    duration,
    libraryOccupied,
    people,
    placeFilter,
    roomQuery,
    selectedFacilities,
    startTime,
    useSampleSchedule,
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

  function applyAlternative(alternative: AlternativeTime) {
    setDate(alternative.date);
    setStartTime(alternative.time);
    scrollToResults();
  }

  function openRoom(room: Room) {
    setSelectedRoom(room);
    setStudentScheduleOpen(false);
    setWeekStart(mondayOf(date));
  }

  function openStudentSchedule() {
    setSelectedRoom(null);
    setWeekStart(mondayOf(date));
    setStudentScheduleOpen(true);
  }

  function closeDialog() {
    setSelectedRoom(null);
    setStudentScheduleOpen(false);
  }

  function availableCapacity(room: Room) {
    if (room.libraryArea === "study") return 60 - libraryOccupied.study;
    if (room.libraryArea === "computer") return 24 - libraryOccupied.computer;
    return room.capacity;
  }

  function roomTimeline(room: Room, day: number) {
    if (day === 0 || day === 6) {
      return [{
        start: "00:00",
        end: "24:00",
        title: "Free · no demo classes",
        free: true,
      }];
    }

    const slots = room.timetable
      .filter((slot) => slot.day === day)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    const rows: Array<{
      start: string;
      end: string;
      title: string;
      code?: string;
      free: boolean;
    }> = [];

    let cursor = 0;

    for (const slot of slots) {
      const classStart = toMinutes(slot.start);
      const classEnd = toMinutes(slot.end);

      if (classStart > cursor) {
        rows.push({
          start: fromMinutes(cursor),
          end: fromMinutes(classStart),
          title: "Free · no demo class",
          free: true,
        });
      }

      rows.push({
        start: slot.start,
        end: slot.end,
        title: slot.title,
        code: slot.code,
        free: false,
      });

      cursor = Math.max(cursor, classEnd);
    }

    if (cursor < 1440) {
      rows.push({
        start: fromMinutes(cursor),
        end: "24:00",
        title: "Free · no demo class",
        free: true,
      });
    }

    return rows;
  }

  function studentTimeline(day: number) {
    if (day === 0 || day === 6) {
      return [{
        start: "00:00",
        end: "24:00",
        title: "No sample classes",
        free: true,
      }];
    }

    const slots = sampleStudentTimetable
      .filter((slot) => slot.day === day)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    const rows: Array<{
      start: string;
      end: string;
      title: string;
      free: boolean;
    }> = [];

    let cursor = 8 * 60;

    for (const slot of slots) {
      const classStart = toMinutes(slot.start);
      const classEnd = toMinutes(slot.end);

      if (classStart > cursor) {
        rows.push({
          start: fromMinutes(cursor),
          end: fromMinutes(classStart),
          title: "Free gap",
          free: true,
        });
      }

      rows.push({
        start: slot.start,
        end: slot.end,
        title: slot.title,
        free: false,
      });

      cursor = Math.max(cursor, classEnd);
    }

    if (cursor < 18 * 60) {
      rows.push({
        start: fromMinutes(cursor),
        end: "18:00",
        title: "Free gap",
        free: true,
      });
    }

    return rows;
  }

  const endMinutes = toMinutes(startTime) + duration;
  const endTime = fromMinutes(endMinutes);
  const endTimeLabel = endMinutes >= 1440 ? `${endTime} (+1 day)` : endTime;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="SpaceLens home">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>SpaceLens</span>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a className="active" href="#finder">Find a space</a>
          <button type="button" onClick={openStudentSchedule}>My schedule</button>
        </nav>

        <div className="profile-label">
          <span className="profile-avatar">S</span>
          <span>Sample student</span>
          <span className="demo-tag">DEMO</span>
        </div>
      </header>

      <section className="hero" id="finder">
        <p className="eyebrow">APU CAMPUS · SPACE DISCOVERY</p>
        <h1>Find a space <span>between classes.</span></h1>
        <p className="hero-copy">
          Search rooms and study areas that fit your time, group, and facilities.
        </p>
      </section>

      <section className="search-panel" aria-label="Space search">
        <form
          className="room-search"
          onSubmit={(event) => {
            event.preventDefault();
            scrollToResults();
          }}
        >
          <label className="room-search-label" htmlFor="room-query">
            Search by room or area
          </label>
          <div className="room-search-input">
            <span aria-hidden="true">⌕</span>
            <input
              id="room-query"
              type="search"
              placeholder="Try “Tech Lab”, “Auditorium”, or “Library”"
              value={roomQuery}
              onChange={(event) => {
                setRoomQuery(event.target.value);
                setPlaceFilter("all");
              }}
            />
          </div>
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
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            >
              {durationOptions.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {durationLabel(minutes)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label htmlFor="people">People</label>
            <select
              id="people"
              value={people}
              onChange={(event) => setPeople(Number(event.target.value))}
            >
              {[1, 2, 4, 6, 10, 20, 50, 100].map((count) => (
                <option key={count} value={count}>{count}+ people</option>
              ))}
            </select>
          </div>

          <button className="find-button" type="button" onClick={scrollToResults}>
            Find matches <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="facility-row">
          <span className="facility-heading">Facilities</span>
          {facilityOptions.map((facility) => (
            <label className="facility-check" key={facility}>
              <input
                type="checkbox"
                checked={selectedFacilities.includes(facility)}
                onChange={() => toggleFacility(facility)}
              />
              <span className="check-box" aria-hidden="true">✓</span>
              <span>{facility}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="quick-row" aria-label="Popular space types">
        <button
          className={`quick-card library-quick ${placeFilter === "library" ? "selected" : ""}`}
          type="button"
          onClick={() => choosePlace("library")}
        >
          <span className="quick-icon" aria-hidden="true">▤</span>
          <span className="quick-copy">
            <strong>Library seats</strong>
            <small><b>{librarySeatsFree}</b> estimated seats free now</small>
          </span>
          <span className="simulated-pill">SIMULATED</span>
          <span className="quick-arrow" aria-hidden="true">→</span>
        </button>

        <button
          className={`quick-card discussion-quick ${placeFilter === "discussion" ? "selected" : ""}`}
          type="button"
          onClick={() => choosePlace("discussion")}
        >
          <span className="quick-icon" aria-hidden="true">▦</span>
          <span className="quick-copy">
            <strong>Discussion rooms</strong>
            <small>6 sample rooms · up to 6 people</small>
          </span>
          <span className="quick-arrow" aria-hidden="true">→</span>
        </button>

        {placeFilter !== "all" && (
          <button className="clear-place-button" type="button" onClick={() => choosePlace("all")}>
            Show all spaces
          </button>
        )}
      </section>

      <section className="results-section" id="spaces">
        <div className="results-heading">
          <div>
            <p className="eyebrow">EXPLAINABLE ROOM MATCHING</p>
            <h2>Best matches for your search</h2>
          </div>
          <span className="results-count">
            {searchResults.matches.length} matches
          </span>
        </div>

        <div className="gap-hint">
          <span className="gap-icon" aria-hidden="true">◷</span>
          <div>
            <strong>
              {useSampleSchedule
                ? searchResults.studentConflict
                  ? "Your selected time overlaps a sample class"
                  : "Your selected time fits a sample class gap"
                : "Sample student schedule matching is off"}
            </strong>
            <span>
              {longDate(date)} · {startTime}–{endTimeLabel} · {durationLabel(duration)}
            </span>
          </div>
          <label className="schedule-toggle">
            <input
              type="checkbox"
              checked={useSampleSchedule}
              onChange={(event) => setUseSampleSchedule(event.target.checked)}
            />
            <span>Use sample schedule</span>
          </label>
        </div>

        {searchResults.matches.length > 0 ? (
          <div className="room-list">
            {searchResults.matches.map(({ room, score, reasons }, index) => {
              const isLibrary = Boolean(room.libraryArea);
              const seatsAvailable = isLibrary ? availableCapacity(room) : 0;

              return (
                <article className={`room-card ${index === 0 ? "top-match" : ""}`} key={room.name}>
                  <div className="room-main">
                    <div className="room-title-line">
                      <div>
                        <p className="room-category">{room.category}</p>
                        <h3>{room.name}</h3>
                      </div>

                      {index === 0 && (
                        <span className="best-match-label">BEST MATCH</span>
                      )}
                    </div>

                    <div className="room-facts">
                      <span className="capacity-pill">
                        ♙ {isLibrary ? `${room.librarySeatTotal} total seats` : `${room.capacity} people`}
                      </span>

                      {isLibrary && (
                        <span className="seat-count-pill">
                          {seatsAvailable} seats free now · simulated
                        </span>
                      )}
                    </div>

                    <div className="reason-list">
                      {reasons.map((reason) => (
                        <span className="reason-pill" key={reason}>{reason}</span>
                      ))}
                    </div>

                    <div className="facility-list">
                      {room.facilities.map((facility) => (
                        <span className="facility-pill" key={facility}>{facility}</span>
                      ))}
                    </div>
                  </div>

                  <div className="room-side">
                    <div className="match-score">
                      <strong>{score}</strong>
                      <span>match</span>
                    </div>
                    <button
                      className="room-action"
                      type="button"
                      onClick={() => openRoom(room)}
                    >
                      {isLibrary ? "View seat count" : "View timetable"}
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="no-results">
            <div className="empty-mark" aria-hidden="true">⌕</div>
            <h3>No matching spaces found</h3>
            <p>
              Your requirements may conflict with a demo class, group size, or selected facilities.
            </p>

            {searchResults.alternatives.length > 0 ? (
              <div className="alternatives">
                <div className="alternatives-heading">
                  <div>
                    <h4>Try another available time</h4>
                    <p>These suggestions keep your room, group size, facilities, and duration requirements.</p>
                  </div>
                </div>

                {searchResults.alternatives.map((alternative) => (
                  <article
                    className="alternative-card"
                    key={`${alternative.room.name}-${alternative.date}-${alternative.time}`}
                  >
                    <div>
                      <p className="room-category">{alternative.room.category}</p>
                      <h4>{alternative.room.name}</h4>
                      <span>
                        {longDate(alternative.date)} · {alternative.time}–
                        {fromMinutes(toMinutes(alternative.time) + duration)}
                      </span>
                    </div>
                    <div className="alternative-action">
                      <span>{alternative.score} match</span>
                      <button type="button" onClick={() => applyAlternative(alternative)}>
                        Use this time →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="no-alternatives">
                No matching demo slots were found in the next two weeks. Try removing a facility or reducing the group size.
              </p>
            )}

            <button
              className="reset-button"
              type="button"
              onClick={() => {
                setRoomQuery("");
                setPlaceFilter("all");
                setSelectedFacilities([]);
                setPeople(2);
              }}
            >
              Reset search
            </button>
          </div>
        )}

        <p className="data-note">
          Prototype data: room capacities, facilities, timetables, and library occupancy are simulated.
          “Free” means no demo class conflict; it does not guarantee room access.
        </p>
      </section>

      <footer className="footer">
        <span className="footer-brand">SpaceLens</span>
        <span>APU smart-campus concept · Hackathon prototype</span>
      </footer>

      {(selectedRoom || studentScheduleOpen) && (
        <div className="modal-backdrop" onClick={closeDialog}>
          <section
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close"
              onClick={closeDialog}
            >
              ×
            </button>

            {selectedRoom?.libraryArea ? (
              <>
                <p className="eyebrow">SIMULATED OCCUPANCY · LIBRARY</p>
                <h2 id="detail-title">{selectedRoom.name}</h2>
                <p className="modal-intro">
                  Shared study areas use a seat-count view in this prototype, not a class timetable.
                </p>

                <div className="occupancy-detail">
                  <span className="occupancy-number">{availableCapacity(selectedRoom)}</span>
                  <span>estimated seats free now</span>
                  <div className="occupancy-meter">
                    <span
                      style={{
                        width: `${
                          (availableCapacity(selectedRoom) /
                            Math.max(1, selectedRoom.librarySeatTotal ?? 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <small>
                    Simulated occupancy updates every 10 seconds. This is not connected to cameras or APU systems.
                  </small>
                </div>
              </>
            ) : studentScheduleOpen ? (
              <>
                <p className="eyebrow">DEMO STUDENT PROFILE</p>
                <h2 id="detail-title">Sample weekly schedule</h2>
                <p className="modal-intro">
                  SpaceLens uses this sample timetable to award a schedule-gap match bonus.
                </p>
                <div className="schedule-week">
                  {weekDays.map(({ day, name }, index) => {
                    const dayDate = addDays(weekStart, index);
                    const rows = studentTimeline(day);

                    return (
                      <section className="day-card" key={name}>
                        <div className="day-heading">
                          <strong>{name}</strong>
                          <span>{shortDate(dayDate)}</span>
                        </div>
                        {rows.map((row, rowIndex) => (
                          <div
                            className={`timeline-row ${row.free ? "free" : "class"}`}
                            key={`${name}-${row.start}-${rowIndex}`}
                          >
                            <span>{row.start}–{row.end}</span>
                            <strong>{row.title}</strong>
                          </div>
                        ))}
                      </section>
                    );
                  })}
                </div>
                <p className="modal-note">This is sample data, not a connected student profile.</p>
              </>
            ) : selectedRoom ? (
              <>
                <p className="eyebrow">WEEKLY ROOM TIMETABLE · DEMO</p>
                <h2 id="detail-title">{selectedRoom.name}</h2>
                <p className="modal-intro">
                  Blue rows show sample scheduled classes. Green rows show no sample class conflict.
                </p>

                <div className="week-toolbar">
                  <button
                    type="button"
                    aria-label="Previous week"
                    onClick={() => setWeekStart(addDays(weekStart, -7))}
                  >
                    ←
                  </button>
                  <strong>Week of {shortDate(weekStart)}</strong>
                  <button
                    type="button"
                    aria-label="Next week"
                    onClick={() => setWeekStart(addDays(weekStart, 7))}
                  >
                    →
                  </button>
                </div>

                <div className="schedule-week">
                  {weekDays.map(({ day, name }, index) => {
                    const dayDate = addDays(weekStart, index);
                    const rows = roomTimeline(selectedRoom, day);

                    return (
                      <section className="day-card" key={name}>
                        <div className="day-heading">
                          <strong>{name}</strong>
                          <span>{shortDate(dayDate)}</span>
                        </div>
                        {rows.map((row, rowIndex) => (
                          <div
                            className={`timeline-row ${row.free ? "free" : "class"}`}
                            key={`${name}-${row.start}-${rowIndex}`}
                          >
                            <span>{row.start}–{row.end}</span>
                            <div>
                              <strong>{row.title}</strong>
                              {row.code && row.code !== "DEMO" && (
                                <small>{row.code}</small>
                              )}
                              {row.code === "DEMO" && <small>Sample timetable entry</small>}
                            </div>
                          </div>
                        ))}
                      </section>
                    );
                  })}
                </div>

                <p className="modal-note">
                  Timetable entries are generated demo data. No live APU timetable is connected.
                </p>
              </>
            ) : null}
          </section>
        </div>
      )}
    </main>
  );
}

export default App;