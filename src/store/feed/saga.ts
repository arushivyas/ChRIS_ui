import { all, fork, put, takeEvery } from "redux-saga/effects";
import { FeedActionTypes } from "./types";
import { IActionTypeParam } from "../../api/models/base.model";
import ChrisAPIClient from "../../api/chrisapiclient";
import { Feed } from "@fnndsc/chrisapi";
import {
  getAllFeedsSuccess,
  getFeedSuccess,
  getPluginInstancesRequest,
  getPluginInstancesSuccess,
  getSelectedPlugin,
  addNodeSuccess,
} from "./actions";

// ------------------------------------------------------------------------
// Description: Get Feeds list and search list by feed name (form input driven)
// pass it a param and do a search querie
// ------------------------------------------------------------------------

function* handleGetAllFeeds(action: IActionTypeParam) {
  const { name, limit, offset } = action.payload;
  let params = {
    name,
    limit,
    offset,
  };
  const client = ChrisAPIClient.getClient();
  let feedsList = yield client.getFeeds(params);
  yield put(getAllFeedsSuccess(feedsList));
}

function* watchGetAllFeedsRequest() {
  yield takeEvery(FeedActionTypes.GET_ALL_FEEDS, handleGetAllFeeds);
}

// ------------------------------------------------------------------------
// Description: Get Feed's details
// ------------------------------------------------------------------------

function* handleGetFeedDetails(action: IActionTypeParam) {
  try {
    const id = Number(action.payload);
    const client = ChrisAPIClient.getClient();
    const feed = yield client.getFeed(id);

    if (feed) {
      yield all([
        put(getFeedSuccess(feed)),
        put(getPluginInstancesRequest(feed)),
      ]);
    } else {
      console.error("Feed does not exist");
    }
  } catch (error) {
    console.error(error);
  }
}

function* handleGetPluginInstances(action: IActionTypeParam) {
  const feed: Feed = action.payload;
  try {
    const params = { limit: 10, offset: 0 };
    let pluginInstanceList = yield feed.getPluginInstances(params);
    let pluginInstances = yield pluginInstanceList.getItems();
    while (pluginInstanceList.hasNextPage) {
      try {
        params.offset += params.limit;
        pluginInstanceList = yield feed.getPluginInstances(params);
        pluginInstances = pluginInstances.concat(pluginInstanceList.getItems());
      } catch (e) {
        console.error(e);
      }
    }

    const selected = pluginInstances[pluginInstances.length - 1];

    let pluginInstanceObj = {
      selected,
      pluginInstances,
    };

    yield put(getPluginInstancesSuccess(pluginInstanceObj));
  } catch (err) {
    console.error(err);
  }
}

function* handleAddNode(action: IActionTypeParam) {
  const item = action.payload;
  try {
    yield all([put(addNodeSuccess(item)), put(getSelectedPlugin(item))]);
  } catch (err) {
    console.error(err);
  }
}

function* watchGetPluginInstanceRequest() {
  yield takeEvery(
    FeedActionTypes.GET_PLUGIN_INSTANCES_REQUEST,
    handleGetPluginInstances
  );
}

function* watchGetFeedRequest() {
  yield takeEvery(FeedActionTypes.GET_FEED_REQUEST, handleGetFeedDetails);
}

function* watchAddNode() {
  yield takeEvery(FeedActionTypes.ADD_NODE, handleAddNode);
}

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* feedSaga() {
  yield all([
    fork(watchGetAllFeedsRequest),
    fork(watchGetFeedRequest),
    fork(watchGetPluginInstanceRequest),
    fork(watchAddNode),
  ]);
}
