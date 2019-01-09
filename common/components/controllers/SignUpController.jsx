// @flow

import DjangoCSRFToken from 'django-react-csrftoken'
import React from 'react';
import type {Validator} from '../forms/FormValidation.jsx'
import FormValidation from '../forms/FormValidation.jsx'
import metrics from "../utils/metrics.js";
import moment from 'moment';
import _ from 'lodash';

type Props = {|
  +errors: {+[key: string]: $ReadOnlyArray<string>},
|};

type State = {|
  firstName: string,
  lastName: string,
  email: string,
  password1: string,
  password2: string,
  validations: $ReadOnlyArray<Validator>,
  isValid: boolean
|}

class SignUpController extends React.Component<Props, State> {
  minimumPasswordLength: number;
  
  constructor(): void {
    super();
  
    // Make sure to keep validators in sync with the backend validators specified in settings.py
    this.minimumPasswordLength = 8;
    this.hasNumberPattern = new RegExp("[0-9]");
    this.hasLetterPattern = new RegExp("[A-Za-z]");
    this.hasSpecialCharacterPattern = new RegExp("[^A-Za-z0-9]");
  
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password1: '',
      password2: '',
      isValid: false,
      validations: [
        {
          checkFunc: (state: State) => !_.isEmpty(state.firstName),
          errorMessage: "Please enter First Name"
        },
        {
          checkFunc: (state: State) => !_.isEmpty(state.lastName),
          errorMessage: "Please enter Last Name"
        },
        {
          checkFunc: (state: State) => !_.isEmpty(state.email),
          errorMessage: "Please enter email address"
        },
        {
          checkFunc: (state: State) => state.password1.length >= this.minimumPasswordLength,
          errorMessage: `Password must be at least ${this.minimumPasswordLength} characters`
        },
        {
          checkFunc: (state: State) => {
            return this.hasNumberPattern.test(state.password1)
              && this.hasLetterPattern.test(state.password1)
              && this.hasSpecialCharacterPattern.test(state.password1);
          },
          errorMessage: "Password must contain at least one letter, one number, and one special character (examples: !,@,$,&)"
        },
        {
          checkFunc: (state: State) => state.password1 === state.password2,
          errorMessage: "Passwords don't match"
        },
      ]
    };
  }
  
  onValidationCheck(isValid: boolean): void {
    if(isValid !== this.state.isValid) {
      this.setState({isValid});
    }
  }

  render(): React$Node {
    return (
      <div className="LogInController-root">
        <div className="LogInController-greeting">
          SIGN UP, IT'S EASY AND FREE
        </div>
        <form action="/signup/" method="post">
          <DjangoCSRFToken />
          <div>
            First Name:
          </div>
          <div>
            <input
              className="LogInController-input"
              name="first_name"
              onChange={e => this.setState({firstName: e.target.value})}
              type="text"
            />
          </div>
          <div>
            Last Name:
          </div>
          <div>
            <input
              className="LogInController-input"
              name="last_name"
              onChange={e => this.setState({lastName: e.target.value})}
              type="text"
            />
          </div>
          <div>
            Email:
          </div>
          <div>
            <input
              className="LogInController-input"
              name="email"
              onChange={e => this.setState({email: e.target.value})}
              type="text"
            />
          </div>
          <div>
            Password:
          </div>
          <div>
            <input
              className="LogInController-input"
              name="password1"
              onChange={e => this.setState({password1: e.target.value})}
              type="password"
            />
          </div>
          <div>
            Re-Enter Password:
          </div>
          <div>
            <input
              className="LogInController-input"
              name="password2"
              onChange={e => this.setState({password2: e.target.value})}
              type="password"
            />
          </div>
          <input name="password" value={this.state.password1} type="hidden" />

          {/* TODO: Replace with visible forms, or modify backend. */}
          <input name="postal_code" value="123456" type="hidden" />
          <input name="username" value={this.state.email} type="hidden" />
          <input
            name="date_joined"
            value={moment().utc().format('MM/DD/YYYY')}
            type="hidden"
          />

          <FormValidation
            validations={this.state.validations}
            onValidationCheck={this.onValidationCheck.bind(this)}
            formState={this.state}
          />

          <button
            className="LogInController-signInButton"
            disabled={!this.state.isValid}
            type="submit"
            onClick={() => metrics.logSignupAttempt()}
          >
            Create Account
          </button>
        </form>
      </div>
    );
  }
}

export default SignUpController;
