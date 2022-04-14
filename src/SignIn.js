import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { signIn } from "./store";
const env = require("../.client.env");
//const client_id = "f43167d78bf47a2ba42d";

class SignIn extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      error: "",
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  onChange(ev) {
    this.setState({ [ev.target.name]: ev.target.value });
  }
  async onSubmit(ev) {
    ev.preventDefault();
    const { username, password } = this.state;
    try {
      await this.props.signIn({
        username,
        password,
      });
    } catch (ex) {
      console.log(ex);
      this.setState({ error: ex.response.data.error });
    }
  }
  render() {
    const { onChange, onSubmit } = this;
    const { username, password, error } = this.state;
    return (
      <div style={{ width: "50%" }}>
        <form onSubmit={onSubmit}>
          {error}
          <input value={username} onChange={onChange} name="username" />
          <input value={password} onChange={onChange} name="password" />
          <button>Sign In</button>
        </form>
        <a
          href={`https://github.com/login/oauth/authorize?client_id=${env.client_id}`}
        >
          <button>Github Sign In</button>
        </a>
      </div>
    );
  }
}

const mapDispatch = (dispatch) => {
  return {
    signIn: (credentials) => dispatch(signIn(credentials)),
  };
};

export default connect(null, mapDispatch)(SignIn);
