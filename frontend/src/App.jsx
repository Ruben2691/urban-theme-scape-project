// frontend/src/App.jsx

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import SignupFormPage from "./components/SignupFormPage";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import LoginFormModal from "./components/LoginFormModal";

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

 useEffect(() => {
   let isMounted = true;

   dispatch(sessionActions.restoreUser()).then(() => {
     if (isMounted) {
       setIsLoaded(true); // Only set state if the component is still mounted
     }
   });

   return () => {
     isMounted = false; // Cleanup function
   };
 }, [dispatch]);


  return <>
    <Navigation  isLoaded={isLoaded}/>
    {isLoaded && <Outlet />}
  </>;
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <h1>Welcome!</h1>,
      },
      {
        path: "/login",
        element: <LoginFormModal />,
      },
      {
        path: "/signup",
        element: <SignupFormPage />,
      }
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
