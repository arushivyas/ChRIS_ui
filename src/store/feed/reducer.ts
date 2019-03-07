import { Reducer } from "redux";
import { IFeedState, FeedActionTypes } from "./types";

// Type-safe initialState
const initialState: IFeedState = {
  details: undefined,
  items: undefined
  // selected: undefined,
  // descendants: undefined
};

// ***** NOTE: Working *****
const reducer: Reducer<IFeedState> = (state = initialState, action) => {
  switch (action.type) {
    case FeedActionTypes.GET_FEED_DETAILS_SUCCESS: {
      // return { ...state, details: action.payload.collection.items }; // Using the api
      return { ...state, details: action.payload };
    }
    case FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS: {
      // Note: when using the ChrisAPI the items will be action.payload.collection.items
      // return { ...state, items: action.payload.collection.items }; //Note: For API call... stub
      return { ...state, items: action.payload.data.results };
    }
    case FeedActionTypes.GET_PLUGIN_DESCENDANTS_SUCCESS: {
      const descendants = action.payload.data.results;
      const selected = (!!action.payload.data.results &&  action.payload.data.results.length) && action.payload.data.results[0];
      return { ...state, descendants, selected  };
    }
    case FeedActionTypes.FETCH_REQUEST: {
      return { ...state };
    }
    case FeedActionTypes.FETCH_SUCCESS: {
      // Note: when using the ChrisAPI the items will be action.payload.collection.items
      // return { ...state, items: action.payload.collection.items }; //Note: For API call... stub
      return { ...state, items: action.payload.data.results };
    }
    case FeedActionTypes.FETCH_ERROR: {
      return { ...state };
    }
    case FeedActionTypes.FETCH_COMPLETE: {
      return { ...state };
    }
    //  ***** Working *****
    default: {
      return state;
    }
  }
};

export { reducer as feedReducer };