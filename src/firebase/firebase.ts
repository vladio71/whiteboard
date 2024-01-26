import {initializeApp} from "firebase/app";
import {
    addDoc,
    collection,
    deleteDoc,
    getDoc,
    getDocs,
    getFirestore,
    initializeFirestore,
    updateDoc
} from "firebase/firestore";
import {doc, setDoc} from "firebase/firestore";
import {getAuth} from "@firebase/auth";
import {errorHandle} from "@/firebase/auth";
import {toast} from "react-hot-toast";


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

initializeFirestore(app, {
    ignoreUndefinedProperties: true,
});

export const db = getFirestore(app);





export async function addNewBoard(userId) {
    const docRef = await addDoc(collection(db, userId), {
        isEmpty: true
    });
    return docRef.id
}

export async function updateBoard(boardId, data) {
    if (auth.currentUser?.uid) {
        const frankDocRef = doc(db, auth.currentUser?.uid, boardId);

        await updateDoc(frankDocRef, {
            "common.boardName": data.name,
            ...(data?.url && {"common.cardUrl": data.url}),
        });
    }


}

export async function deleteBoard(boardId) {
    if (auth.currentUser?.uid)
        await deleteDoc(doc(db, auth.currentUser?.uid, boardId))
            .then(res => {
                toast.success("Board deleted")
            })
            .catch(error => errorHandle(error))
}

export async function setAllData(data, userId, boardId) {
    toast.loading('', {
        style: {
            maxWidth: "40px"
        }
    });
    const response = await setDoc(doc(db, userId, boardId), data)
    return response

}


export async function getData(userId, boardId) {
    const docRef = doc(db, userId, boardId);
    const docSnap = await getDoc(docRef);
    return docSnap.data()
}

export async function getUserBoards(callback) {
    try {
        if (auth.currentUser?.uid) {
            const querySnapshot = await getDocs(collection(db, auth.currentUser?.uid));
            if (querySnapshot) {
                callback(querySnapshot.docs.map(el => {
                    return {
                        ...el.data(),
                        id: el.id
                    }
                }))
            }
        }
    } catch (error) {
        errorHandle(error)
    }
}
