import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyCZ7SX_2NwAxflElWcWaOe7QuqBk2oXRvk",
  authDomain: "cap-this.firebaseapp.com",
  databaseURL: "https://cap-this-default-rtdb.firebaseio.com",
  projectId: "cap-this",
  storageBucket: "cap-this.appspot.com",
  messagingSenderId: "357983648624",
  appId: "1:357983648624:web:fa4a414168ee3a9317edb5",
  measurementId: "G-2C4QFNL1B1",
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
