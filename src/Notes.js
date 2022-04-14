import React, { useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { deleteNote, addNote } from "./store";

const Notes = () => {
  const [note, setNote] = useState("hello");
  const notes = useSelector((state) => state.notes.notes);
  const dispatch = useDispatch();
  const history = useHistory();
  const handleForm = (ev) => {
    setNote(ev.target.value);
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();

    dispatch(addNote(note));
    setNote("");
  };

  return (
    <div>
      <Link to="/home">Home</Link>
      <div>TODO - Ability of User to manage notes</div>
      <div>
        <ul>
          {notes &&
            notes.map((note) => (
              <div key={note.id}>
                <li>{note.txt}</li>
                <button onClick={() => dispatch(deleteNote(note.id))}>
                  Delete
                </button>
              </div>
            ))}
        </ul>
        <form onSubmit={(ev) => handleSubmit(ev)}>
          <input
            name="txt"
            value={note}
            onChange={(ev) => handleForm(ev)}
            style={{ width: "50%" }}
          ></input>
          <button>Submit</button>
        </form>
      </div>
    </div>
  );
};

export default connect()(Notes);
