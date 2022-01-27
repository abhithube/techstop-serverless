import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Amplify, { Auth } from 'aws-amplify';
import { useState } from 'react';

const [localSignin, productionSignin] =
  import.meta.env.VITE_AMPLIFY_REDIRECT_SIGN_IN.split(',');

Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_AMPLIFY_REGION,
    userPoolId: import.meta.env.VITE_AMPLIFY_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_AMPLIFY_CLIENT_ID,
  },
  oauth: {
    domain: import.meta.env.VITE_AMPLIFY_DOMAIN,
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: import.meta.env.DEV ? localSignin : productionSignin,
    responseType: 'code',
  },
});

export default function App() {
  const [step, setStep] = useState('signIn');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const signUp = async () => {
    try {
      await Auth.signUp({
        username: username,
        password: password,
        attributes: {
          email: email,
        },
      });

      setStep('confirmSignUp');
    } catch (err) {
      console.log(err);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Google,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const confirmSignUp = async () => {
    try {
      await Auth.confirmSignUp(username, verificationCode);

      setStep('signIn');
    } catch (err) {
      console.log(err);
    }
  };

  const signIn = async () => {
    try {
      await Auth.signIn(username, password);

      setStep('signedIn');
    } catch (err) {
      console.log(err);
    }
  };

  if (step === 'signUp') {
    return (
      <div>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        />
        <input
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Enter password"
        />
        <button onClick={signUp}>Sign Up</button>
      </div>
    );
  }

  if (step === 'confirmSignUp') {
    return (
      <div>
        <input
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        />
        <input
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter verification code"
        />
        <button onClick={confirmSignUp}>Confirm Sign Up</button>
      </div>
    );
  }

  if (step === 'signIn') {
    return (
      <div>
        <button onClick={signInWithGoogle}>
          <FontAwesomeIcon icon={faGoogle} />
          <span>Sign In with Google</span>
        </button>
        <input
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        />
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
        <button onClick={signIn}>Sign In</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Logged in as {username}</h1>
    </div>
  );
}
