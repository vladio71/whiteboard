import {
    sendEmailVerification,
    createUserWithEmailAndPassword,
    signOut, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, reauthenticateWithCredential
} from "firebase/auth";
import {auth} from './firebase'
import {toast} from "react-hot-toast";
import {deleteUser} from "@firebase/auth";


const GoogleProvider = new GoogleAuthProvider();


export function errorHandle(error) {
    toast.error("Something went wrong!")
    toast.error("Please try again later.")
    toast.error(error.message)
}


export async function signInWithGoogle() {
    return await signInWithPopup(auth, GoogleProvider)
        .catch((error) => errorHandle(error));
}


export async function createNewUser(email, password) {
    await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            verifyEmail()
        })
        .catch((error) => errorHandle(error));

}

export async function removeUser() {
    console.log(auth)
    if (auth?.currentUser)
        deleteUser(auth.currentUser).then(() => {
            toast.success("Data cleared!")
        })
            .catch((error) => {
                // reauthenticateWithCredential( auth.currentUser, )
                errorHandle(error)
            });

}

export async function signIn(email, password) {
    return await signInWithEmailAndPassword(auth, email, password)
        .catch((error) => errorHandle(error));
}

export function verifyEmail() {
    const user = auth.currentUser;
    if (user)
        sendEmailVerification(user, {
            url: "http://localhost:3000/auth?confirm_email=true",
        })
        .catch((error) => errorHandle(error));

}


export function SignOut() {
    signOut(auth)
    .catch((error) => errorHandle(error));

}

