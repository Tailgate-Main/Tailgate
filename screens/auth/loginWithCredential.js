
// import { auth } from "../../config/firebaseConfig"

// export default async function loginWithCredential(credential, data) {
//   console.log('Logging in with credential', credential, data);

//   const { user } = await auth.signInWithCredential(auth, credential);

//   console.log('Signed in with credential. Updating profile details...');

// //   if (data?.email && !user.email) {
// //     await updateEmail(user, data.email);
// //   }

// //   if (data?.displayName && !user.displayName) {
// //     await updateProfile(user, { displayName: data.displayName });
// //   }

//   return user;
// }