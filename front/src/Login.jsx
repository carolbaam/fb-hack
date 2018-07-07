/* eslint camelcase: 0 */
import React from 'react';

class InitAccount extends React.Component {
  state = {
    countryCode: '',
    phoneNumber: '',
    emailAddress: '',
  };

  onChangeValue = (param, value) => {
    this.setState(() => ({
      [param]: value,
    }));
  };

  // login callback
  loginCallback = (response) => {
    if (response.status === 'PARTIALLY_AUTHENTICATED') {
      const { code } = response;
      console.log(code);

      const { state: csrf } = response;
      console.log(csrf);
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
      <div>
        <input
          value={countryCode}
          onChange={(value) => {
            this.onChangeValue('countryCode', value);
          }}
          id="country_code"
        />
        <input
          value={phoneNumber}
          onChange={(value) => {
            this.onChangeValue('phoneNumber', value);
          }}
          placeholder="phone number"
          id="phone_number"
        />
        <button type="button" onClick={this.smsLogin}>
          Login via SMS
        </button>
        <div>
        OR
        </div>
        <input
          value={emailAddress}
          placeholder="email"
          id="email"
          onChange={(value) => {
            this.onChangeValue('emailAddress', value);
          }}
        />
        <button type="button" onClick={this.emailLogin}>
          Login via Email
        </button>
      </div>
    );
  }
}

export default InitAccount;
