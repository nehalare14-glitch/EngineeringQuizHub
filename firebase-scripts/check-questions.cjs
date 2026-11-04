const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

if (getApps().length === 0) {
  initializeApp({
    credential: cert(require("./serviceAccountKey.json"))
  });
}

const db = getFirestore();

async function checkQuestions() {
  const snapshot = await db.collection("questions").get();
  const errors = [];
  const seen = new Set();
  const counts = {};

  for (const doc of snapshot.docs) {
    const q = doc.data();
    const id = doc.id;

    const branch = q.branchCode;
    const subject = q.subjectId;
    const difficulty = q.difficulty;
    const question = q.questionText;

    if (!branch || !subject || !question) {
      errors.push(`${id}: Missing required fields`);
    }

    if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      errors.push(`${id}: Invalid difficulty`);
    }

    if (!["A", "B", "C", "D"].includes(q.correctOption)) {
      errors.push(`${id}: Invalid correct answer`);
    }

    if (
      !q.options ||
      ["A", "B", "C", "D"].some(
        key => typeof q.options[key] !== "string" ||
               !q.options[key].trim()
      )
    ) {
      errors.push(`${id}: Missing answer options`);
    }

    const key = JSON.stringify([
      branch,
      subject,
      String(question || "").trim().toLowerCase()
    ]);

    if (seen.has(key)) {
      errors.push(`${id}: Duplicate question`);
    }

    seen.add(key);

    const group = `${branch}/${subject}/${difficulty}`;
    counts[group] = (counts[group] || 0) + 1;
  }

  console.log("\n=== FIREBASE QUESTION AUDIT ===");
  console.log("Total questions:", snapshot.size);
  console.log("Structural errors:", errors.length);

  console.log("\n=== QUESTION DISTRIBUTION ===");
  for (const [group, count] of Object.entries(counts).sort()) {
    console.log(`${group}: ${count}`);
  }

  if (errors.length > 0) {
    console.log("\n=== ERRORS ===");
    errors.forEach(error => console.log(error));
    process.exitCode = 1;
  } else {
    console.log("\nNo structural errors found.");
  }

  console.log(
    `\nTarget: 1500 | Current: ${snapshot.size} | Remaining: ${1500 - snapshot.size}`
  );
}

checkQuestions().catch(error => {
  console.error("Firebase audit failed:", error);
  process.exitCode = 1;
});
