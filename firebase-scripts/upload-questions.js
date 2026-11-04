const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { parse } = require("csv-parse/sync");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const keyPath = path.join(__dirname, "serviceAccountKey.json");
const csvPath = path.join(__dirname, "..", "backend", "data", "questions", "question_bank.csv");

if (!fs.existsSync(keyPath) || !fs.existsSync(csvPath)) {
  console.error("Missing serviceAccountKey.json or question_bank.csv");
  process.exit(1);
}

initializeApp({
  credential: cert(require(keyPath))
});

const db = getFirestore();

const subjectIds = {
  CSE: {
    "Programming": "CSE_PROGRAMMING",
    "Data Structures": "CSE_DATA_STRUCTURES",
    "Database Management": "CSE_DBMS",
    "Computer Networks": "CSE_NETWORKS",
    "Operating Systems": "CSE_OS"
  },
  ECE: {
    "Digital Electronics": "ECE_DIGITAL",
    "Analog Electronics": "ECE_ANALOG",
    "Communication Systems": "ECE_COMMUNICATION",
    "Microprocessors": "ECE_MICROPROCESSORS"
  },
  EEE: {
    "Circuit Theory": "EEE_CIRCUITS",
    "Electrical Machines": "EEE_MACHINES",
    "Power Systems": "EEE_POWER",
    "Control Systems": "EEE_CONTROL"
  },
  MECH: {
    "Engineering Mechanics": "MECH_MECHANICS",
    "Thermodynamics": "MECH_THERMO",
    "Manufacturing": "MECH_MANUFACTURING",
    "Machine Design": "MECH_DESIGN"
  },
  CIVIL: {
    "Surveying": "CIVIL_SURVEYING",
    "Structural Engineering": "CIVIL_STRUCTURAL",
    "Building Materials": "CIVIL_MATERIALS",
    "Environmental Engineering": "CIVIL_ENVIRONMENTAL"
  },
  AIML: {
    "Python for AI": "AIML_PYTHON",
    "Machine Learning": "AIML_ML",
    "Deep Learning": "AIML_DL",
    "Neural Networks": "AIML_NN",
    "Natural Language Processing": "AIML_NLP",
    "Generative AI": "AIML_GENAI"
  }
};

async function uploadQuestions() {
  const csv = fs.readFileSync(csvPath, "utf8");

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true
  });

  const questions = [];

  for (const row of rows) {
    const branchCode = row.branch?.trim().toUpperCase();
    const subjectName = row.subject?.trim();
    const subjectId = subjectIds[branchCode]?.[subjectName];
    const difficulty = row.difficulty?.trim().toUpperCase();
    const correctOption = row.correct_option?.trim().toUpperCase();
    const questionText = row.question_text?.trim();

    if (!subjectId || !questionText ||
        !["EASY", "MEDIUM", "HARD"].includes(difficulty) ||
        !["A", "B", "C", "D"].includes(correctOption) ||
        ![row.option_a, row.option_b, row.option_c, row.option_d]
          .every(value => typeof value === "string" && value.trim())) {
      throw new Error(`Invalid question: ${questionText || "(empty)"}`);
    }

    const id = crypto.createHash("sha256")
      .update(JSON.stringify([branchCode, subjectId, questionText]))
      .digest("hex");

    questions.push({
      id,
      data: {
        branchCode,
        subjectId,
        subjectName,
        difficulty,
        questionText,
        options: {
          A: row.option_a.trim(),
          B: row.option_b.trim(),
          C: row.option_c.trim(),
          D: row.option_d.trim()
        },
        correctOption,
        explanation: row.explanation?.trim() || "",
        active: true
      }
    });
  }

  // Validate all records before writing.
  const unique = new Map(questions.map(q => [q.id, q]));

  const entries = [...unique.values()];

  for (let i = 0; i < entries.length; i += 400) {
    const batch = db.batch();

    for (const question of entries.slice(i, i + 400)) {
      batch.set(
        db.collection("questions").doc(question.id),
        question.data
      );
    }

    await batch.commit();
  }

  console.log(`Successfully uploaded ${entries.length} unique questions.`);
}

uploadQuestions().catch(error => {
  console.error("Upload failed:", error.message);
  process.exitCode = 1;
});
