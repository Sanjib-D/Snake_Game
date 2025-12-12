const firebaseConfig = {
  apiKey: "AIzaSyChe8npwLVyBN6ffm1paZtKKtcAUib14xk",
  authDomain: "online-code-editor-2bb39.firebaseapp.com",
  projectId: "online-code-editor-2bb39",
  storageBucket: "online-code-editor-2bb39.firebasestorage.app",
  messagingSenderId: "998271838832",
  appId: "1:998271838832:web:7df745ea125db6940ea2b5",
};

try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase Connected");
} catch (error) {
  console.error("Firebase Connection Error:", error);
}

const db = firebase.firestore();
const BAD_WORDS = [
  "badword",
  "abuse",
  "admin",
  "null",
  "undefined",
  "sex",
  "xxx",
];

function cleanName(name) {
  const lowerName = name.toLowerCase();
  for (let word of BAD_WORDS) {
    if (lowerName.includes(word)) return "***";
  }
  return name.replace(/[^a-zA-Z0-9 ]/g, "");
}

let top10Unsubscribe = null;

function subscribeToTop10() {
  if (top10Unsubscribe) return;
  top10Unsubscribe = db
    .collection("scores")
    .orderBy("score", "desc")
    .limit(10)
    .onSnapshot((snapshot) => {
      if (!ui.top10List) return;
      ui.top10List.innerHTML = "";
      let rank = 1;
      snapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `<div><span class="rank">#${rank}</span> ${data.name}</div><b>${data.score}</b>`;
        ui.top10List.appendChild(li);
        rank++;
      });
      if (rank === 1) ui.top10List.innerHTML = "<li>No scores yet.</li>";
    });
}

function openLeaderboardModal() {
  ui.leaderboardModal.classList.remove("hidden");
  ui.top100List.innerHTML = "<li>Loading...</li>";
  db.collection("scores")
    .orderBy("score", "desc")
    .limit(100)
    .get()
    .then((snapshot) => {
      ui.top100List.innerHTML = "";
      let rank = 1;
      snapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `<div><span class="rank">#${rank}</span> ${data.name} <small>(${data.mode})</small></div><b>${data.score}</b>`;
        ui.top100List.appendChild(li);
        rank++;
      });
    });
}

function closeLeaderboardModal() {
  ui.leaderboardModal.classList.add("hidden");
}

function saveScore() {
  const rawName = ui.nameInput.value.trim();
  if (!rawName) return alert("Please enter a name");

  const clean = cleanName(rawName); 
  ui.saveBtn.disabled = true;
  ui.saveBtn.innerText = "Saving...";
  ui.saveBtn.style.backgroundColor = "#ccc";

  db.collection("scores")
    .add({
      name: clean,
      score: score,
      mode: currentMode,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      ui.saveContainer.style.display = "none";
      ui.saveMsg.innerText = "✅ Score Saved Successfully!";
      ui.saveMsg.style.display = "block";
      ui.saveMsg.classList.remove("hidden");
    })
    .catch((error) => {
      console.error("Error saving score: ", error);
      ui.saveBtn.disabled = false;
      ui.saveBtn.innerText = "Try Again";
      alert("Error saving score.");
    });
}
