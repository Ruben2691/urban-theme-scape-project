import {csrfFetch} from "./csrf";

const ADD_USER = "session/ADD_USER";
const REMOVE_USER = "session/REMOVE_USER";

const addUser = (payload) => ({
  type: ADD_USER,
  payload
});

const removeUser = () => ({
  type: REMOVE_USER
});


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


const initialState = { user: null };

const session = (state = initialState, action) => {
  switch (action.type) {
    case ADD_USER: {
      const newState = { ...state };
      newState.user = action.payload;
      return newState;
    }
    case REMOVE_USER: {
      return initialState
    }
    default:
      return state;
  }
};

export default session;
