import { csrfFetch } from "./csrf";

// actions
const GET_REVIEWS = "reviews/GET_REVIEWS";
const DELETE_REVIEW = "reviews/DELETE_REVIEW";
const CREATE_REVIEW = "reviews/CREATE_REVIEW";

//action creators
const getReviews = (reviews) => {
  return {
    type: GET_REVIEWS,
    payload: reviews,
  };
};

export const deleteReview = (reviewId) => {
  return {
    type: DELETE_REVIEW,
    payload: reviewId,
  };
};

const createReview = (review) => {
  return {
    type: CREATE_REVIEW,
    payload: review,
  };
};

//thunks
export const getReviewsFromDB = (spotId) => async (dispatch) => {
  const res = await csrfFetch(`/api/spots/${spotId}/reviews`);
  const data = await res.json();
  return dispatch(getReviews(data.Reviews));
};

export const deleteReviewFromDB = (reviewId) => async (dispatch) => {
    const res = await csrfFetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
    });
    if (res.ok) {
        dispatch(deleteReview(reviewId));
    }
}

export const createReviewInDB = (review, spotId) => async (dispatch) => {
    const res = await csrfFetch(`/api/spots/${spotId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });
    const data = await res.json();
    return dispatch(createReview(data));
}


//initial state
const initialState = {
  allReviews: [],
  // singleReview: null,
};

//reducers
const reviewsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_REVIEWS:
          return { ...state, allReviews: [...action.payload] };
    case DELETE_REVIEW:
          return { ...state, allReviews: state.allReviews.filter((review) => review.id !== action.payload) };
    case CREATE_REVIEW:
          return { ...state, allReviews: [...state.allReviews, action.payload] };
    default:
      return state;
  }
};

export default reviewsReducer;
