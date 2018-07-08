/* eslint camelcase: 0 */
import React, { Component } from 'react';
import axios from 'axios';

import api from './api';

// import { withRouter } from 'react-router-dom';

type Props = {
  appState: Object,
  update: Function
}

class InitAccount extends Component<Props> {
  state = {
    countryCode: '',
    phoneNumber: '',
    emailAddress: '',
    csrf: '',
  };

  componentDidMount() {
    api.get('/csrf').then(({ data: { csrf } }) => {
      this.setState(() => ({ csrf }));
      window.AccountKit_Promise.then(() => {
        AccountKit.init({
          appId: '179059249606625',
          state: csrf,
          version: 'v1.1',
          fbAppEventsEnabled: true,
          redirect: process.env.REACT_CALLBACK_URL,
        });
      });
    });
  }

  onChangeValue = (param, value) => {
    this.setState(() => ({
      [param]: value,
    }));
  };

  // login callback
  loginCallback = (response) => {
    if (response.status === 'PARTIALLY_AUTHENTICATED') {
      const { appState, update } = this.props;
      const { code } = response;
      console.log(code);

      const { state: { csrf: resCsrf } } = response;
      const { csrf } = this.state;

      api.get('/me', {
        headers: {
          'x-access-token': code,
        },
      }).then(({ data: { token } }) => {
        localStorage.setItem('token', token);
        update(appState.set('token', token));
      });

      // Send code to server to exchange for access token
    } else if (response.status === 'NOT_AUTHENTICATED') {
      // handle authentication failure
    } else if (response.status === 'BAD_PARAMS') {
      // handle bad parameters
    }
  };

  // phone form submission handler
  smsLogin = () => {
    const { countryCode, phoneNumber } = this.state;
    AccountKit.login(
      'PHONE',
      { countryCode, phoneNumber }, // will use default values if not specified
      this.loginCallback,
    );
  };

  // email form submission handler
  emailLogin = () => {
    const { emailAddress } = this.state;
    AccountKit.login('EMAIL', { emailAddress }, this.loginCallback);
  };

  render() {
    const { countryCode, phoneNumber, emailAddress } = this.state;
    return (
      <div className="container">
        <form>
          <div className="row">
            <input
              value={countryCode}
              placeholder="codigo de pais"
              onChange={({ target: { value } }) => {
                this.onChangeValue('countryCode', value);
              }}
              id="country_code"
            />
            <input
              value={phoneNumber}
              onChange={({ target: { value } }) => {
                this.onChangeValue('phoneNumber', value);
              }}
              placeholder="numero cel"
              id="phone_number"
            />
            <button type="button" onClick={this.smsLogin}>
              Ingresa via SMS
            </button>
          </div>
        </form>
        <div>
        O
        </div>
        <form>
          <input
            value={emailAddress}
            placeholder="email"
            id="email"
            onChange={({ target: { value } }) => {
              this.onChangeValue('emailAddress', value);
            }}
          />
          <button type="button" onClick={this.emailLogin}>
            Ingresa con email
          </button>
        </form>
      </div>
    );
  }
}

export default (InitAccount);
