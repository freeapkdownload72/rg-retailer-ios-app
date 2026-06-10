const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCWkcxwUjssU14v88bmSMB3gwFOSsuorQ0",
  authDomain: "rg-retailer-31026.firebaseapp.com",
  projectId: "rg-retailer-31026",
  storageBucket: "rg-retailer-31026.firebasestorage.app",
  messagingSenderId: "860972932020",
  appId: "1:860972932020:web:1950b17e2f548f614370e1"
};

async function runTest() {
  try {
    console.log("Initializing Firebase...");
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log("Querying products...");
    const prodSnap = await getDocs(collection(db, "products"));
    console.log(`Success! Found ${prodSnap.size} documents in products.`);
    prodSnap.forEach(d => {
      console.log(` - Product ID: ${d.id}, Name: ${d.data().name}`);
    });

    console.log("Querying membership_plans...");
    const planSnap = await getDocs(collection(db, "membership_plans"));
    console.log(`Success! Found ${planSnap.size} documents in membership_plans.`);
    planSnap.forEach(d => {
      console.log(` - Plan ID: ${d.id}, Data:`, d.data());
    });
  } catch (err) {
    console.error("Firestore test failed:", err);
  }
}

runTest();
