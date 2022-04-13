import React from "react";
import { connect, useSelector } from "react-redux";
import { logout } from "./store";
import { Link } from "react-router-dom";

const Home = ({ auth, logout, notes }) => {
  const theNotes = useSelector((state) => state.notes.notes);
  return (
    <div>
      Welcome {auth.username}
      <button onClick={logout}>Logout</button>
      <div>
        You have added {theNotes.length} notes.
        <br />
        <Link to="/notes">Access and Add Notes</Link>
      </div>
    </div>
  );
};

const mapState = (state) => state;
const mapDispatch = (dispatch) => {
  return {
    logout: () => {
      return dispatch(logout());
    },
  };
};

export default connect(mapState, mapDispatch)(Home);
