// import { useAuthRequest, useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
// import { maybeCompleteAuthSession } from 'expo-web-browser';
// import firebase from "firebase"

// maybeCompleteAuthSession();

// function login(id_token) {
//   console.log('Signing in with Google...', { id_token });

//   try {
//     const credential = firebase.auth.GoogleAuthProvider.credential(id_token);

//     return credential;
//   } catch (error) {
//     throw error;
//   }
// }

// export default function useGoogleAuthentication() {
//   const [request, _, promptAsync] = useIdTokenAuthRequest({
//     clientId: "1055584929031-817cu9jj6ofqcs1c7amuc7f7i2pr931f.apps.googleusercontent.com"
//   });

//   async function prompt() {
//     const response = await promptAsync();
    

//     if (response?.type !== 'success') {
//       throw new Error(response.type);
//     }
//     const credential = login(response.params.id_token);

//     return [credential];
//   }

//   return [!!request, prompt];
// }