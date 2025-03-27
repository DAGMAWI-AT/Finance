import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const EmailVerification = () => {
  const { token } = useParams(); // Get the token from URL
  const [isVerified, setIsVerified] = useState(null); // To store verification status
  const [loading, setLoading] = useState(true); // To manage loading state
  const [error, setError] = useState(null); // To store error message

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Send request to backend to verify email
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/verify-email/${token}`);

        if (!response.ok) {
          // If response is not OK, throw an error with the response status text
          const errorMessage = `Verification failed: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.success) {
          setIsVerified(true); // Set status to true if verification is successful
        } else {
          setIsVerified(false); // Set status to false if verification failed
        }
      } catch (err) {
        console.error(err); // Log error for debugging
        setError(err.message); // Handle error
        setIsVerified(false);
      } finally {
        setLoading(false); // Stop loading after request is completed
      }
    };
 console.log(isVerified)
    verifyEmail(); // Call the verification function
  }, [token]); // Run the effect when the token changes

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <div style={styles.container}>
      {isVerified ? (
        <div style={styles.successMessage}>
          <h2>Email Verified Successfully!</h2>
          <p>You can now log in and start using your account.</p>
        </div>
      ) : (
        <div style={styles.errorMessage}>
          <h2>Email Verification Failed</h2>
          {error ? <p>{error}</p> : <p>Please check your verification link or try again.</p>}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
  },
  successMessage: {
    color: 'green',
    fontSize: '18px',
  },
  errorMessage: {
    color: 'red',
    fontSize: '18px',
  },
};

export default EmailVerification;
