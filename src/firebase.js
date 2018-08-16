import firebase from 'firebase'

var config = {
  apiKey: "AIzaSyBP308433NXPPRxPRLGXGo8Ng_eyf2prxg",
  authDomain: "social-8cb85.firebaseapp.com",
  databaseURL: "https://social-8cb85.firebaseio.com",
  projectId: "social-8cb85",
  storageBucket: "social-8cb85.appspot.com",
  messagingSenderId: "510667312214"
};

firebase.initializeApp(config);
export default firebase;
