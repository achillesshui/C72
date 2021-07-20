import * as firebase from 'firebase';
require('@firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyCwzwlTn8u79BeGYbNUUwrLsjr9ACYMxBI",
    authDomain: "c71-42297.firebaseapp.com",
    projectId: "c71-42297",
    storageBucket: "c71-42297.appspot.com",
    messagingSenderId: "460620438530",
    appId: "1:460620438530:web:7985de9bde737f82cd9b1b"
  };

if(!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
}
export default firebase.firestore();
