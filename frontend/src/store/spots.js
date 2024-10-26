import { csrfFetch } from "./csrf";

// actions

const GET_SPOTS = "spots/GET_SPOTS";
const GET_SPOT = "spots/GET_SPOT";
const CREATE_SPOT = "spots/CREATE_SPOT";

// action creators

const getSpotsAction = (spots) => {
  return {
    type: GET_SPOTS,
    payload: spots,
  };
};

const getSingleSpotAction = (spot) => {
  return {
    type: GET_SPOT,
    payload: spot,
  };
};

const createSpotAction = (spotInfoForm) => {
  return {
    type: CREATE_SPOT,
    payload: spotInfoForm,
  };
};

// thunks
export const getSpotsFromDB = () => async (dispatch) => {
  const res = await csrfFetch("/api/spots");
  const data = await res.json();
  return dispatch(getSpotsAction(data));
};

export const getSingleSpot = (spotId) => async (dispatch) => {
  const res = await csrfFetch(`/api/spots/${spotId}`);
  const data = await res.json();
  return dispatch(getSingleSpotAction(data));
};

// spots.js (Redux Thunk)
export const createSpot = (spotData) => async (dispatch) => {
  const response = await csrfFetch("/api/spots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spotData),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(createSpotAction(data));
  } else {
    const error = await response.json();
    throw error;
  }
};


// spots initial state
const initialState = {
  allSpots: [],
  singleSpot: null,
};

// spots reducer
const spotsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SPOTS:
      return { ...state, allSpots: [...action.payload.Spots] };
    case GET_SPOT:
      return { ...state, singleSpot: { ...action.payload } };
    case CREATE_SPOT:
      return { ...state, allSpots: [...state.allSpots, action.payload] };
    default:
      return state;
  }
};

export default spotsReducer;
