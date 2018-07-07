/* eslint camelcase: 0 */
import React, { Component } from 'react';
import axios from 'axios';

// import { withRouter } from 'react-router-dom';
// https://graph.accountkit.com/v1.3/access_token?grant_type=authorization_code&code=<authorization_code>&access_token=AA|<facebook_app_id>|<app_secret>
window.AccountKit_OnInteractive = function () {};

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
    axios.get(process.env.REACT_APP_API).then(({ data: { csrf } }) => {
      this.setState(() => ({ csrf }));
      console.log('csrf', csrf);
      AccountKit.init({
        appId: '179059249606625',
        state: csrf,
        version: 'v1.1',
        fbAppEventsEnabled: true,
        redirect: process.env.REACT_CALLBACK_URL,
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
      console.log('resCsrf', resCsrf);
      console.log('csrf', csrf);
      update(appState.set('token', code));
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
    console.log(AccountKit);
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
