import { csrfFetch } from "./csrf";

// actions

const GET_SPOTS = "spots/GET_SPOTS";
const GET_SPOT = "spots/GET_SPOT"



// action creators

const getSpotsAction = (spots) => {
    return {
        type: GET_SPOTS,
        payload: spots
    }
}

const getSingleSpotAction = (spot) => {
    return {
        type: GET_SPOT,
        payload: spot
    }
}

// thunks
export const getSpotsFromDB = () => async (dispatch) => {
    const res = await csrfFetch('/api/spots')
    const data = await res.json()
    return dispatch(getSpotsAction(data))
}

export const getSingleSpot = (spotId) => async (dispatch) => {
    const res = await csrfFetch(`/api/spots/${spotId}`)
    const data = await res.json()
    return dispatch(getSingleSpotAction(data))
}



// spots initial state
const initialState = {
    allSpots: [],
    singleSpot: null
}

// spots reducer
const spotsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_SPOTS:
            return { ...state, allSpots: [...action.payload.Spots]}
        case GET_SPOT:
            console.log('what is get from single spot', action);

            return {...state, singleSpot: {...action.payload}}
        default:
            return state
    }
}

export default spotsReducer;
