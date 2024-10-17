// frontend/src/components/LoginFormModal/LoginFormModal.jsx

import { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginFormPage.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal(); // Get closeModal from ModalContext

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal) // Close modal on successful login
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors); // Handle errors
        }
      });
  };

  return (
    <>
      <h1 id="login-header">Log In</h1>
      <form onSubmit={handleSubmit} id="login-form">
        <label className="login-credentials">
          Username or Email
          <input
            className="login-inputs"
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label className="login-credentials">
          Password
          <input
            className="login-inputs"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.credential && <p>{errors.credential}</p>}
        <button type="submit" id="login-button">Log In</button>
      </form>
    </>
  );
}

export default LoginFormModal;
