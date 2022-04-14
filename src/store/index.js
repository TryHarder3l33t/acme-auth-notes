import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import axios from "axios";

const initialNotes = {
  notes: [],
};

const notes = (state = initialNotes, action) => {
  switch (action.type) {
    case "SET_USER_NOTES":
      return { ...state, notes: action.payload };
    case "DELETE_NOTE":
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload.id),
      };
    case "ADD_NOTE":
      return {
        notes: [action.payload, ...state.notes],
      };
    default:
      return state;
  }
};

const auth = (state = {}, action) => {
  if (action.type === "SET_AUTH") {
    return action.auth;
  }

  return state;
};

const logout = () => {
  window.localStorage.removeItem("token");
  return {
    type: "SET_AUTH",
    auth: {},
  };
};

const __deleteNote = (payload) => {
  return {
    type: "DELETE_NOTE",
    payload,
  };
};

const deleteNote = (noteId) => {
  return async (dispatch) => {
    const token = window.localStorage.getItem("token");
    if (token) {
      let { data } = await axios.delete(`/api/note/${noteId}`, {
        headers: { authorization: token },
      });
      dispatch(__deleteNote(data));
    }
  };
};

const __addNote = (payload) => {
  return {
    type: "ADD_NOTE",
    payload,
  };
};

const addNote = (note) => {
  return async (dispatch) => {
    const token = window.localStorage.getItem("token");
    if (token) {
      let { data } = await axios.post(
        "/api/note/",
        { note },
        {
          headers: { authorization: token },
        }
      );

      dispatch(__addNote(data));
    }
  };
};

const signIn = (credentials) => {
  return async (dispatch) => {
    let response = await axios.post("/api/auth", credentials);
    const { token } = response.data;
    window.localStorage.setItem("token", token);
    return dispatch(attemptLogin());
  };
};
const attemptLogin = () => {
  return async (dispatch) => {
    const token = window.localStorage.getItem("token");
    if (token) {
      const response = await axios.get("/api/auth", {
        headers: {
          authorization: token,
        },
      });
      dispatch({ type: "SET_AUTH", auth: response.data });
    }
  };
};

const getNotes = () => {
  return async (dispatch) => {
    const token = window.localStorage.getItem("token");
    if (token) {
      const response = await axios.get("/api/notes", {
        headers: {
          authorization: token,
        },
      });

      dispatch({ type: "SET_USER_NOTES", payload: response.data });
    }
  };
};

const store = createStore(
  combineReducers({
    auth,
    notes,
  }),
  applyMiddleware(thunk, logger)
);

export { attemptLogin, signIn, logout, getNotes, deleteNote, addNote };

export default store;
