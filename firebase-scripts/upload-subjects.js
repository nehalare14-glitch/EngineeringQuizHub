const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");

const keyPath = "./serviceAccountKey.json";

if (!fs.existsSync(keyPath)) {
  console.error("Missing serviceAccountKey.json");
  process.exit(1);
}

const serviceAccount = require(keyPath);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const subjects = [
  ["CSE_PROGRAMMING", "CSE", "Programming"],
  ["CSE_DATA_STRUCTURES", "CSE", "Data Structures"],
  ["CSE_DBMS", "CSE", "Database Management"],
  ["CSE_NETWORKS", "CSE", "Computer Networks"],
  ["CSE_OS", "CSE", "Operating Systems"],

  ["ECE_DIGITAL", "ECE", "Digital Electronics"],
  ["ECE_ANALOG", "ECE", "Analog Electronics"],
  ["ECE_COMMUNICATION", "ECE", "Communication Systems"],
  ["ECE_MICROPROCESSORS", "ECE", "Microprocessors"],

  ["EEE_CIRCUITS", "EEE", "Circuit Theory"],
  ["EEE_MACHINES", "EEE", "Electrical Machines"],
  ["EEE_POWER", "EEE", "Power Systems"],
  ["EEE_CONTROL", "EEE", "Control Systems"],

  ["MECH_MECHANICS", "MECH", "Engineering Mechanics"],
  ["MECH_THERMO", "MECH", "Thermodynamics"],
  ["MECH_MANUFACTURING", "MECH", "Manufacturing"],
  ["MECH_DESIGN", "MECH", "Machine Design"],

  ["CIVIL_SURVEYING", "CIVIL", "Surveying"],
  ["CIVIL_STRUCTURAL", "CIVIL", "Structural Engineering"],
  ["CIVIL_MATERIALS", "CIVIL", "Building Materials"],
  ["CIVIL_ENVIRONMENTAL", "CIVIL", "Environmental Engineering"],

  ["AIML_PYTHON", "AIML", "Python for AI"],
  ["AIML_ML", "AIML", "Machine Learning"],
  ["AIML_DL", "AIML", "Deep Learning"],
  ["AIML_NN", "AIML", "Neural Networks"],
  ["AIML_NLP", "AIML", "Natural Language Processing"],
  ["AIML_GENAI", "AIML", "Generative AI"],
];

async function uploadSubjects() {
  const batch = db.batch();

  for (const [id, branchCode, name] of subjects) {
    const ref = db.collection("subjects").doc(id);

    batch.set(ref, {
      branchCode,
      name,
      active: true,
    });
  }

  await batch.commit();

  console.log(`Successfully uploaded ${subjects.length} subjects.`);
}

uploadSubjects().catch((error) => {
  console.error("Upload failed:", error.message);
  process.exitCode = 1;
});

