import {csrfFetch} from "./csrf";

const ADD_USER = "session/ADD_USER";
const REMOVE_USER = "session/REMOVE_USER";
const SET_USER = "session/SET_USER";

const addUser = (payload) => ({
  type: ADD_USER,
  payload
});

const removeUser = () => ({
  type: REMOVE_USER
});

const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user
  };
};



export const login = ({ credential, password }) => async (dispatch) => {
  let res = await csrfFetch("/api/session", {
    method: "POST",
    body: JSON.stringify({ credential, password })

  })


  if (res.ok) {
    let resTwo = await res.json();
    dispatch(addUser(resTwo));
    return resTwo;
  }
}

export const restoreUser = () => async (dispatch) => {
  const response = await csrfFetch("/api/session");
  const data = await response.json();
  dispatch(addUser(data.user));
  return response;
};

export const signup = (user) => async (dispatch) => {
  const { firstName, lastName, username, email, password } = user;
  console.log(user);

  const response = await csrfFetch("/api/users", {
    method: "POST",
    body: JSON.stringify({
      username,
      email,
      password,
      firstName,
      lastName
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (response.ok) {
  const data = await response.json();
  dispatch(setUser(data.user));
    return response;
  }
};

export const logout = () => async (dispatch) => {
  const response = await csrfFetch("/api/session", {
    method: "DELETE",
  });
  dispatch(removeUser());
  return response;
};


const initialState = { user: null };

const session = (state = initialState, action) => {
  switch (action.type) {
    case ADD_USER: {
      const newState = { ...state };
      newState.user = action.payload;
      console.log(newState);

      return newState;
    }
    case REMOVE_USER: {
      return {...state, ...initialState}
    }
    default:
      return state;
    }
  };

  export default session;
