import { csrfFetch } from "./csrf";

// action creators
const ADD_SPOT_IMAGE = "spots/createSpotImage";
const DELETE_SPOT_IMAGE = "spots/deleteSpotImage";

const createSpotImage = (payload) => ({
  type: ADD_SPOT_IMAGE,
  payload,
});

//thunks
const deleteSpotImage = (imageId) => ({
  type: DELETE_SPOT_IMAGE,
  imageId,
});

export const addSpotImage = (spotId, payload) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(createSpotImage(data));
  }
};

export const deleteImageFromSpot = (imageId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spot-images/${imageId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(deleteSpotImage(imageId));
    return true;
  }
  return false;
};

const initialState = {};

//reducer
const spotImageReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case ADD_SPOT_IMAGE:
      newState = { ...state };
      newState[action.payload.id] = action.payload;
      return newState;
    case DELETE_SPOT_IMAGE:
      newState = { ...state };
      delete newState[action.imageId];
      return newState;
    default:
      return state;
  }
};

export default spotImageReducer;
