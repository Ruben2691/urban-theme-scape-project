import { NavLink } from "react-router-dom"

export default function NavigationBar() {
  return (
    <>
      <ul>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/login">Log In</NavLink>
        <NavLink to="/signup">Sign Up</NavLink>
      </ul>
    </>
  );
}
