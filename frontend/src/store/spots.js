

import { csrfFetch } from "./csrf";

// actions

const GET_SPOTS = "spots/GET_SPOTS";
const GET_SPOT = "spots/GET_SPOT";
const CREATE_SPOT = "spots/CREATE_SPOT";
const REMOVE_SPOT = "spots/REMOVE_SPOT"
const UPDATE_SPOT = "spots/UPDATE_SPOT"

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

const removeSpotAction = (spot) => {
  return {
    type: REMOVE_SPOT,
    payload: spot,
  }
}

const updateSpotAction = (spotId) => {
  return {
    type: UPDATE_SPOT,
    payload: spotId
  }
}

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

export const removeSpot = (spot) =>  async (dispatch) => {
  const res = await csrfFetch(`/api/spots/${spot.id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(removeSpotAction(data));
  }
}

export const updateSpot = (spotId, update) => async (dispatch) => {
  const res = await csrfFetch(`/api/spots/${spotId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(updateSpotAction(data));
  }
}


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
    case REMOVE_SPOT:
      return {
        ...state,
        allSpots: state.allSpots.filter(
          (spot) => spot.id !== action.payload.id
        ),
      };
    case UPDATE_SPOT:
      return {
        ...state,
        allSpots: state.allSpots.map((spot) =>
          spot.id === action.payload.id ? action.payload : spot
        ),
        singleSpot:
          state.singleSpot && state.singleSpot.id === action.payload.id
            ? action.payload
            : state.singleSpot,
      };
    default:
      return state;
  }
};

export default spotsReducer;
