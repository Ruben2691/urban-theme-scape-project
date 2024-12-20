// frontend/src/components/Navigation/Navigation.jsx

import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import OpenModalButton from "../OpenModalButton";
import LoginFormModal from "../LoginFormModal";
// import "./Navigation.css";

function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);

  // const sessionLinks = sessionUser ? (
  //   <li>
  //     <ProfileButton user={sessionUser} />
  //   </li>
  // ) : (
  //   <>
  //     <li>
  //       <OpenModalButton
  //         buttonText="Log In"
  //         modalComponent={<LoginFormModal />} // Modal content for login
  //       />
  //     </li>
  //     <li>
  //       <NavLink to="/signup">Sign Up</NavLink>
  //     </li>
  //   </>
  // );

  return (
    <ul>
      <li>
        <NavLink to="/">Home</NavLink>
      </li>
      {isLoaded && (<li><ProfileButton user={sessionUser} /></li>)}
    </ul>
  );
}

export default Navigation;
