import options from "../../shared/options.json" with { type: "json" };

const artwork = [
  "1621596181028_math.jpg",
  "1621596297238_physic.jpg",
  "1621596123907_CHEMISTRY.jpg",
  "1623346991196_Biology.jpeg",
  "1623348468142_English.jpg",
  "1623347188181_Literature.jpg",
  "1626101993698_swim.png",
  "1623347288909_Guitar.jpg",
  "1623347404904_Piano.jpg",
  "1623347456272_Ballet.jpg",
  "1623347576174_Chess.jpg",
];

export const demoCourses = options.subjects.map((name, index) => ({
  _id: "demo-course-" + (index + 1),
  name,
  imgPath: artwork[index],
  description: `Explore ${name} through practical lessons, friendly guidance, and a plan suited to your goals. This is an example course for the Tutim demo.`,
}));

function portrait(name, index) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  const background = ["#dfece0", "#f5e4d8", "#dce7f2"][index % 3];
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" rx="32" fill="${background}"/><text x="120" y="142" text-anchor="middle" font-family="sans-serif" font-size="72" fill="#315447">${initials}</text></svg>`,
    )
  );
}

const teacherNames = [
  "Minh An",
  "Linh Chi",
  "Bao Long",
  "Mai Anh",
  "Gia Han",
  "Thanh Nam",
  "Ngoc Lan",
  "Quang Huy",
  "Thao Vy",
  "Duc Anh",
  "Khanh Linh",
  "Hoang Son",
];
const studentNames = [
  "An Nguyen",
  "Binh Tran",
  "Chi Le",
  "Dung Pham",
  "Ha Vo",
  "Khoa Do",
];

function profile(name, index, kind) {
  const subject = options.subjects[index % options.subjects.length];
  return {
    _id: `demo-${kind}-${index + 1}`,
    name,
    email: `${kind}${index + 1}@example.invalid`,
    telnum: "",
    imgPath: portrait(name, index),
    district: [options.districts[index % 6]],
    grade: ["Grade 10", options.grades[index % 9]],
    subject: [subject],
    weekly: index % 2 === 0 ? [2, 4, 6] : [3, 5, 7],
    fee: 150000 + (index % 5) * 50000,
    address: `Example learning location, ${options.districts[index % 6]}`,
    available: index % 4 !== 3,
    description:
      kind === "teacher"
        ? `Patient, encouraging ${subject} lessons with clear explanations and plenty of practice. Fictional profile for demonstration.`
        : `Looking for supportive ${subject} lessons and a steady weekly learning routine. Fictional profile for demonstration.`,
    commentCount: kind === "teacher" ? 2 : 0,
    rate: kind === "teacher" ? 9 : 0,
  };
}

export const demoTeachers = teacherNames.map((name, i) =>
  profile(name, i, "teacher"),
);
export const demoStudents = studentNames.map((name, i) =>
  profile(name, i, "student"),
);
export const demoReviews = demoTeachers.flatMap((teacher, i) => [
  {
    _id: `demo-review-${i}-1`,
    commentTo: teacher._id,
    commenter: demoStudents[i % demoStudents.length],
    rating: 5,
    comment:
      "Clear explanations and a friendly learning pace. An example review for this demo.",
    createdAt: "2026-01-12T00:00:00.000Z",
  },
  {
    _id: `demo-review-${i}-2`,
    commentTo: teacher._id,
    commenter: demoStudents[(i + 1) % demoStudents.length],
    rating: 4,
    comment:
      "The practice exercises helped me feel more confident. An example review for this demo.",
    createdAt: "2026-02-08T00:00:00.000Z",
  },
]);

export function demoRequest(path, { method = "GET" } = {}) {
  const fail = (message, status) => {
    throw Object.assign(new Error(message), { status });
  };
  if (method.toUpperCase() !== "GET")
    return fail(
      "This is a read-only demo. Sign-in and changes are disabled.",
      403,
    );
  const [resource, rawId] = path.split("/");
  const id = rawId ? decodeURIComponent(rawId) : null;
  const list = {
    teacherReg: demoTeachers,
    studentReg: demoStudents,
    course: demoCourses,
    comments: demoReviews,
  }[resource];
  if (list) {
    const result = id
      ? list.find((item) => item._id === id || item.name === id)
      : list;
    if (!result) return fail("Demo item not found.", 404);
    return structuredClone(result);
  }
  if (resource === "awaiting") return [];
  if (["profile", "users", "admin"].includes(resource))
    return fail("Accounts are disabled in this public demo.", 401);
  return fail("Demo page not found.", 404);
}
