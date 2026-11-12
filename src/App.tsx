import { useEffect, useMemo, useState } from "react";
import "./App.css";

type ClassSlot = {
  day: number; // Sunday = 0; Monday = 1
  start: string;
  end: string;
  code: string;
  title: string;
  eventType?: "class" | "booking";
};

type PlaceFilter = "all" | "library" | "discussion";

type Room = {
  name: string;
  category: string;
  capacity: number;
  facilities: string[];
  timetable: ClassSlot[];
  building: string;
  floor: string;
  distanceM: number;
  libraryArea?: "study" | "computer";
  librarySeatTotal?: number;
};

type RoomMatch = {
  room: Room;
  score: number;
  reasons: string[];
  breakdown: string[];
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

function facilitiesFor(category: string): string[] {
  if (category === "Library · Open study") return ["Quiet study", "Power outlets"];
  if (category === "Library · Computer area") return ["Power outlets"];
  if (category === "Library · Discussion room") {
    return ["Whiteboard", "Power outlets", "Video conferencing"];
  }
  if (category === "Auditorium" || category === "Meeting room") {
    return ["Projector", "Whiteboard", "Power outlets", "Video conferencing"];
  }
  if (category === "Technology lab") return ["Power outlets", "Projector"];
  if (category === "Laboratory") return ["Whiteboard", "Power outlets"];
  if (category === "Studio" || category === "Workshop") {
    return ["Whiteboard", "Power outlets", "Quiet study"];
  }
  return ["Whiteboard", "Projector", "Power outlets"];
}

function locationFor(name: string) {
  const block = name.match(/Block ([A-Z])/i)?.[1] || name.match(/^([A-Z])-/)?.[1];
  const level = name.match(/Level (\d+)/i)?.[1] ||
    name.match(/(\d+)(?:st|nd|rd|th) floor/i)?.[1] ||
    name.match(/^[A-Z]-(\d{2})-/)?.[1]?.[0] ||
    name.match(/Tech Lab (\d)-/)?.[1];
  return {
    building: name.toLowerCase().includes("library") || name.toLowerCase().includes("discussion")
      ? "Library"
      : block ? `Block ${block}` : "APU Campus",
    floor: level ? `Level ${level}` : "Campus",
  };
}

function makeRoomTimetable(name: string, index: number, category: string): ClassSlot[] {
  // Library study areas use occupancy data and do not show class timetables.
  if (category === "Library · Open study" || category === "Library · Computer area") {
    return [];
  }

  // Discussion rooms use sample reservations, not teaching classes.
  if (category === "Library · Discussion room") {
    const day = index % 2 === 0 ? 2 : 4;
    const start = index % 3 === 0 ? "10:00" : "14:00";
    const [hourText, minuteText] = start.split(":");
    const end = `${String(Number(hourText) + 1).padStart(2, "0")}:${minuteText}`;
    return [{
      day,
      start,
      end,
      code: `BOOKING-${String(index - 19).padStart(2, "0")}`,
      title: "Sample discussion-room booking",
      eventType: "booking",
    }];
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
    facilities: facilitiesFor(category),
    timetable: makeRoomTimetable(name, index, category),
    building: locationFor(name).building,
    floor: locationFor(name).floor,
    distanceM: 80 + ((index * 137) % 620),
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
  const start = toMinutes(startTime);
  const end = start + duration;
  // Prototype operating hours: 08:00–22:00. This also prevents midnight alternatives.
  if (start < 8 * 60 || end > 22 * 60) return true;
  if (date === getToday() && start < new Date().getHours() * 60 + new Date().getMinutes()) return true;
  if (room.libraryArea) return false;

  const weekday = new Date(`${date}T12:00:00`).getDay();
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

function studentHasClassConflict(
  date: string,
  startTime: string,
  duration: number,
  schedule: ClassSlot[] = sampleStudentTimetable,
) {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  const start = toMinutes(startTime);
  const end = start + duration;
  const lastDayOffset = Math.floor((end - 1) / 1440);

  for (let offset = 0; offset <= lastDayOffset; offset++) {
    const day = (weekday + offset) % 7;
    if (day === 0 || day === 6) continue;

    const segmentStart = Math.max(start, offset * 1440) - offset * 1440;
    const segmentEnd = Math.min(end, (offset + 1) * 1440) - offset * 1440;

    if (hasOverlap(schedule, day, segmentStart, segmentEnd)) return true;
  }

  return false;
}

function parseIcsSchedule(contents: string): ClassSlot[] {
  return contents.split("BEGIN:VEVENT").slice(1).flatMap((event, index) => {
    const startLine = event.match(/^DTSTART[^:]*:(.+)$/m)?.[1]?.trim();
    const endLine = event.match(/^DTEND[^:]*:(.+)$/m)?.[1]?.trim();
    const title = (event.match(/^SUMMARY:(.+)$/m)?.[1] || "Imported class")
      .replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\n/g, " ");
    if (!startLine || !endLine || startLine.length < 13 || endLine.length < 13) return [];
    const startDate = startLine.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
    const endDate = endLine.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
    if (!startDate || !endDate) return [];
    const day = new Date(Number(startDate[1]), Number(startDate[2]) - 1, Number(startDate[3])).getDay();
    const start = `${startDate[4]}:${startDate[5]}`;
    const end = `${endDate[4]}:${endDate[5]}`;
    return [{ day, start, end, code: `ICS-${index + 1}`, title, eventType: "class" as const }];
  });
}

function nextFreeSlot(room: Room, fromDate: string, startAfter: string, duration: number) {
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const candidateDate = addDays(fromDate, dayOffset);
    const min = dayOffset === 0 ? Math.max(8 * 60, toMinutes(startAfter)) : 8 * 60;
    for (let minute = min; minute + duration <= 22 * 60; minute += 30) {
      const time = fromMinutes(minute);
      if (!roomHasConflict(room, candidateDate, time, duration)) {
        return { date: candidateDate, time };
      }
    }
  }
  return null;
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
  const [studentSchedule, setStudentSchedule] = useState(sampleStudentTimetable);
  const [scheduleLabel, setScheduleLabel] = useState("Sample student schedule");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [roomVerifications, setRoomVerifications] = useState<Record<string, { status: "free" | "occupied"; at: number }>>({});
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
    const studentConflict = studentHasClassConflict(date, startTime, duration, studentSchedule);

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

    function scoreBreakdown(room: Room, candidateDate: string, candidateTime: string) {
      const capacity = availableCapacity(room);
      const capacityFit = Math.max(10, Math.round(25 - Math.max(0, capacity - people) * 0.22));
      const facilityFit = selectedFacilities.length
        ? Math.round(25 * selectedFacilities.filter((facility) => room.facilities.includes(facility)).length / selectedFacilities.length)
        : 15;
      const scheduleFit = !useSampleSchedule
        ? 12
        : studentHasClassConflict(candidateDate, candidateTime, duration, studentSchedule) ? 8 : 25;
      const proximityFit = Math.max(5, 25 - Math.round(room.distanceM / 40));
      return {
        total: Math.min(100, capacityFit + facilityFit + scheduleFit + proximityFit),
        labels: [
          `Capacity ${capacityFit}/25`,
          `Facilities ${facilityFit}/25`,
          `Schedule gap ${scheduleFit}/25`,
          `Proximity ${proximityFit}/25`,
        ],
      };
    }

    function scoreRoom(room: Room, candidateDate: string, candidateTime: string) {
      return scoreBreakdown(room, candidateDate, candidateTime).total;
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
        breakdown: scoreBreakdown(room, date, startTime).labels,
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

        // Scan only during the prototype's 08:00–22:00 operating hours.
        firstMinute = Math.max(firstMinute, 8 * 60);
        for (
          let minute = firstMinute;
          minute + duration <= 22 * 60 && alternatives.length < 3;
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
    studentSchedule,
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
    setAdminOpen(false);
    setWeekStart(mondayOf(date));
    setStudentScheduleOpen(true);
  }

  function openAdminDashboard() {
    setSelectedRoom(null);
    setStudentScheduleOpen(false);
    setAdminOpen(true);
  }

  function verifyRoom(room: Room, status: "free" | "occupied") {
    setRoomVerifications((current) => ({
      ...current,
      [room.name]: { status, at: Date.now() },
    }));
  }

  async function importStudentIcs(file: File | undefined) {
    if (!file) return;
    const imported = parseIcsSchedule(await file.text());
    if (imported.length === 0) {
      window.alert("I couldn’t read any timed events from that .ics file.");
      return;
    }
    setStudentSchedule(imported);
    setScheduleLabel("Imported .ics timetable");
    setUseSampleSchedule(true);
  }

  function findMyNextGap() {
    const requestedStart = date < today ? today : date;
    const earliest = requestedStart === today
      ? Math.max(8 * 60, Math.ceil((new Date().getHours() * 60 + new Date().getMinutes()) / 30) * 30)
      : 8 * 60;
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const candidateDate = addDays(requestedStart, dayOffset);
      for (let minute = dayOffset === 0 ? earliest : 8 * 60; minute + duration <= 22 * 60; minute += 30) {
        const candidateTime = fromMinutes(minute);
        if (!studentHasClassConflict(candidateDate, candidateTime, duration, studentSchedule)) {
          setDate(candidateDate);
          setStartTime(candidateTime);
          setUseSampleSchedule(true);
          scrollToResults();
          return;
        }
      }
    }
    window.alert("No matching gap found in the next two weeks. Try a shorter duration.");
  }

  function closeDialog() {
    setSelectedRoom(null);
    setStudentScheduleOpen(false);
    setAdminOpen(false);
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

    const slots = studentSchedule
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
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const roundedNow = Math.ceil(nowMinutes / 30) * 30;
  const earliestTime = date === today
    ? `${String(Math.floor(Math.max(8 * 60, roundedNow) / 60)).padStart(2, "0")}:${String(Math.max(8 * 60, roundedNow) % 60).padStart(2, "0")}`
    : "08:00";
  const latestStartMinutes = 22 * 60 - duration;
  const latestStartTime = `${String(Math.floor(latestStartMinutes / 60)).padStart(2, "0")}:${String(latestStartMinutes % 60).padStart(2, "0")}`;

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
          <button type="button" onClick={openAdminDashboard}>Campus insights</button>
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
              min={earliestTime}
              max={latestStartTime}
              value={startTime}
              onChange={(event) => {
                const chosen = event.target.value;
                setStartTime(chosen < earliestTime ? earliestTime : chosen > latestStartTime ? latestStartTime : chosen);
              }}
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
        <button className="find-gap-button" type="button" onClick={findMyNextGap}>
          Find my next class gap <span aria-hidden="true">↗</span>
        </button>
        <p className="hours-note">Search hours: 08:00–22:00 · past times are excluded</p>
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
            {searchResults.matches.map(({ room, score, reasons, breakdown }, index) => {
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

                    <p className="room-location">
                      {room.building} · {room.floor} · estimated proximity · about {room.distanceM} m (demo)
                    </p>
                    <p className="next-free-line">
                      {isLibrary
                        ? "Seat estimate changes during this demo · no future class timetable"
                        : <>Next free slot: {(() => {
                            const next = nextFreeSlot(room, date, startTime, duration);
                            return next ? `${longDate(next.date)} at ${next.time}` : "No slot found in the next two weeks";
                          })()}</>}
                    </p>
                    <div className="reason-list">
                      {reasons.map((reason) => (
                        <span className="reason-pill" key={reason}>{reason}</span>
                      ))}
                    </div>
                    <p className="score-breakdown">{score} / 100 · {breakdown.join(" · ")}</p>
                    <div className="verify-row">
                      {roomVerifications[room.name] && (
                        <span className={`verified-status ${roomVerifications[room.name].status}`}>
                          {roomVerifications[room.name].status === "free" ? "Reported free" : "Reported occupied"} · reported {Math.max(0, Math.floor((Date.now() - roomVerifications[room.name].at) / 60000))} min ago · local demo
                        </span>
                      )}
                      <button type="button" onClick={() => verifyRoom(room, "free")}>Still free</button>
                      <button type="button" onClick={() => verifyRoom(room, "occupied")}>Occupied</button>
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
        <span>APU smart-campus concept · Demo schedules and occupancy are simulated</span>
      </footer>

      {(selectedRoom || studentScheduleOpen || adminOpen) && (
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

            {adminOpen ? (
              <>
                <p className="eyebrow">CAMPUS INSIGHTS · SIMULATED DATA</p>
                <h2 id="detail-title">Space utilisation overview</h2>
                <p className="modal-intro">A demo view of how campus teams could spot underused spaces and busy periods. This is generated prototype data.</p>
                <div className="admin-metrics">
                  <article><strong>{rooms.length}</strong><span>spaces listed</span></article>
                  <article><strong>{rooms.filter((room) => !room.libraryArea && room.timetable.length <= 1).length}</strong><span>underused demo rooms</span></article>
                  <article><strong>{librarySeatsFree}</strong><span>estimated library seats free</span></article>
                </div>
                <section className="admin-panel">
                  <h3>Peak sample class times</h3>
                  <div className="admin-bars">
                    {["08:30", "10:30", "13:00", "15:00"].map((time) => {
                      const count = rooms.filter((room) => room.timetable.some((slot) => slot.start === time)).length;
                      return <div key={time}><span>{time}</span><div><i style={{ width: `${Math.max(4, count / rooms.length * 100)}%` }} /></div><b>{count}</b></div>;
                    })}
                  </div>
                </section>
                <section className="admin-panel cloud-roadmap">
                  <h3>Cloud rollout plan</h3>
                  <p><strong>Live prototype:</strong> SpaceLens frontend is hosted on Vercel.</p>
                  <p><strong>Next cloud step:</strong> Firebase / Google Cloud Functions + Firestore for shared room status and timetable data.</p>
                  <p><strong>Later pilot:</strong> import an approved timetable feed and aggregate library counts; test one library floor first. Gemini function calling can power the assistant from a secured server endpoint.</p>
                  <p className="modal-note">These backend and AI connections are proposed, not connected in this prototype.</p>
                </section>
                <section className="survey-note">
                  <strong>Impact evidence to collect</strong>
                  <p>Survey 30–50 APU students about time spent finding spaces. No survey results have been collected, so this demo shows no invented impact statistics.</p>
                </section>
                <p className="modal-note">Privacy by design: aggregate counts only, with no cameras or personal tracking in this concept. Real deployment would need APU approval and privacy review. Room reports stay in this browser session.</p>
              </>
            ) : selectedRoom?.libraryArea ? (
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
                  SpaceLens uses a {scheduleLabel.toLowerCase()} to identify available gaps.
                </p>
                <label className="ics-upload">
                  <span>Use your own timetable</span>
                  <input type="file" accept=".ics,text/calendar" onChange={(event) => void importStudentIcs(event.target.files?.[0])} />
                  <small>Import an .ics calendar file. It stays in this browser demo.</small>
                </label>
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
                  {selectedRoom.category === "Library · Discussion room"
                    ? "Blue rows show sample bookings. Green rows show open times."
                    : "Blue rows show sample scheduled classes. Green rows show no sample class conflict."}
                </p>
                <p className="next-free-line modal-next-free">
                  Next free slot: {(() => {
                    const next = nextFreeSlot(selectedRoom, date, startTime, duration);
                    return next ? `${longDate(next.date)} at ${next.time}` : "No slot found in the next two weeks";
                  })()}
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
      <SpaceLensChatbot
        rooms={rooms}
        date={date}
        startTime={startTime}
        duration={duration}
        libraryOccupied={libraryOccupied}
        onSelectRoom={openRoom}
      />
    </main>
  );
}

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  matches?: Room[];
};

function SpaceLensChatbot({
  rooms,
  date,
  startTime,
  duration,
  libraryOccupied,
  onSelectRoom,
}: {
  rooms: Room[];
  date: string;
  startTime: string;
  duration: number;
  libraryOccupied: { study: number; computer: number };
  onSelectRoom: (room: Room) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Tell me what kind of place you need. I can search rooms or check the simulated library seat count.",
    },
  ]);

  function replyToRequest(rawRequest: string) {
    const request = rawRequest.trim();
    if (!request) return;

    const lower = request.toLowerCase();
    const peopleMatch = lower.match(/\b(?:for|with)\s+(\d{1,3})(?!\s*(?:hours?|hrs?|minutes?|mins?))\b|\b(\d{1,3})\s*(?:people|person|students|pax|of us)\b/);
    const requestedPeople = peopleMatch ? Number(peopleMatch[1] || peopleMatch[2]) : 1;
    const durationMatch = lower.match(/\b(\d+)\s*(hours?|hrs?|minutes?|mins?)\b/);
    const requestedDuration = durationMatch
      ? Math.max(30, Math.min(360, Math.round((Number(durationMatch[1]) * (/^(?:hour|hr)/.test(durationMatch[2]) ? 60 : 1)) / 30) * 30))
      : duration;
    const timeMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
    let requestedTime = lower.includes("midnight") ? "00:00" : lower.includes("noon") ? "12:00" : startTime;
    if (timeMatch) {
      let hour = Number(timeMatch[1]) % 12;
      if (timeMatch[3] === "pm") hour += 12;
      requestedTime = `${String(hour).padStart(2, "0")}:${timeMatch[2] || "00"}`;
    }

    let requestedDate = date;
    if (lower.includes("tomorrow")) requestedDate = addDays(date, 1);
    else if (lower.includes("saturday")) {
      const currentDay = new Date(`${date}T12:00:00`).getDay();
      requestedDate = addDays(date, (6 - currentDay + 7) % 7 || 7);
    } else if (lower.includes("sunday")) {
      const currentDay = new Date(`${date}T12:00:00`).getDay();
      requestedDate = addDays(date, (7 - currentDay) % 7 || 7);
    }

    const isComputerLab = /computer lab|tech lab/.test(lower);
    const isLibraryRequest = /library|seat|computer/.test(lower) && !isComputerLab;
    const wantsDiscussion = /discussion|meeting room|group room/.test(lower);
    const requestedFacilities: string[] = [];
    if (/whiteboard|white board/.test(lower)) requestedFacilities.push("Whiteboard");
    if (/projector|presentation/.test(lower)) requestedFacilities.push("Projector");
    if (/power|charging|outlet|plug/.test(lower)) requestedFacilities.push("Power outlets");
    if (/video call|video conference|zoom/.test(lower)) requestedFacilities.push("Video conferencing");
    if (/quiet|silence/.test(lower) && !isLibraryRequest) requestedFacilities.push("Quiet study");

    const candidates = rooms.filter((room) => {
      if (isLibraryRequest && !room.libraryArea && !(wantsDiscussion && room.category === "Library · Discussion room")) return false;
      if (wantsDiscussion && room.category !== "Library · Discussion room") return false;
      if (!isLibraryRequest && !wantsDiscussion && /auditorium/.test(lower) && !room.category.toLowerCase().includes("auditorium")) return false;
      if (!isLibraryRequest && !wantsDiscussion && /lab|computer/.test(lower) && !room.category.toLowerCase().includes("lab")) return false;
      const available = room.libraryArea === "study"
        ? 60 - libraryOccupied.study
        : room.libraryArea === "computer"
          ? 24 - libraryOccupied.computer
          : room.capacity;
      if (available < requestedPeople) return false;
      if (!requestedFacilities.every((facility) => room.facilities.includes(facility))) return false;
      if (roomHasConflict(room, requestedDate, requestedTime, requestedDuration)) return false;
      return true;
    }).sort((a, b) => {
      const rank = (room: Room) => {
        const available = room.libraryArea === "study" ? 60 - libraryOccupied.study : room.libraryArea === "computer" ? 24 - libraryOccupied.computer : room.capacity;
        const facilityFit = requestedFacilities.filter((facility) => room.facilities.includes(facility)).length * 20;
        return facilityFit - Math.abs(available - requestedPeople) - room.distanceM / 20;
      };
      return rank(b) - rank(a);
    }).slice(0, 4);

    let response: string;
    if (candidates.length > 0) {
      response = isLibraryRequest
        ? `I found ${candidates.length} library option${candidates.length === 1 ? "" : "s"} for ${requestedPeople} ${requestedPeople === 1 ? "person" : "people"}. Seat counts are simulated and change during this demo.`
        : `These spaces fit your request for ${requestedPeople} ${requestedPeople === 1 ? "person" : "people"} on ${longDate(requestedDate)} at ${requestedTime}.`;
    } else if (isLibraryRequest) {
      response = "I couldn’t find a library area with enough simulated free seats for that request. Try a smaller group or check again shortly.";
    } else {
      response = `I couldn’t find a matching space at ${requestedTime} on ${longDate(requestedDate)}. Try another time or fewer requirements.`;
    }

    setMessages((current) => [
      ...current,
      { role: "user", text: request },
      { role: "assistant", text: response, matches: candidates },
    ]);
    setDraft("");
  }

  return (
    <div className="space-chat">
      {open && (
        <section className="space-chat-panel" aria-label="SpaceLens chat assistant">
          <header className="space-chat-header">
            <div>
              <strong>Ask SpaceLens</strong>
              <span>Room finder · demo assistant</span>
            </div>
            <button type="button" aria-label="Close chat" onClick={() => setOpen(false)}>×</button>
          </header>
          <div className="space-chat-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`space-chat-message ${message.role}`} key={index}>
                <p>{message.text}</p>
                {message.matches?.map((room) => {
                  const seats = room.libraryArea === "study"
                    ? 60 - libraryOccupied.study
                    : room.libraryArea === "computer"
                      ? 24 - libraryOccupied.computer
                      : null;
                  return (
                    <article className="space-chat-result" key={room.name}>
                      <div>
                        <strong>{room.name}</strong>
                        <small>
                          {room.category} · up to {room.capacity} people
                          {seats !== null ? ` · ${seats} seats free (simulated)` : ""}
                        </small>
                        <small>{room.facilities.slice(0, 3).join(" · ")}</small>
                      </div>
                      <button type="button" onClick={() => onSelectRoom(room)}>View</button>
                    </article>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="space-chat-prompts">
            <button type="button" onClick={() => replyToRequest("Find a quiet library seat with a computer")}>Library seat</button>
            <button type="button" onClick={() => replyToRequest("Discussion room for 4 people at 2 pm")}>Discussion room</button>
          </div>
          <form
            className="space-chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              replyToRequest(draft);
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Describe the space you need…"
              aria-label="Describe the space you need"
            />
            <button type="submit" aria-label="Send message">↑</button>
          </form>
          <p className="space-chat-disclaimer">Demo data only · library occupancy is simulated</p>
        </section>
      )}
      <button
        type="button"
        className="space-chat-launcher"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? "×" : "✦"}</span>
        {open ? "Close" : "Ask SpaceLens"}
      </button>
    </div>
  );
}

export default App;
