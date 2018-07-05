/* eslint camelcase: 0 */
import React from 'react';


class InitAccount extends React.Component {
  state={
    value: 0,
    phone: '',
  }

  componentDidMount() {
    AccountKit_OnInteractive = function () {
      AccountKit.init(
        {
          appId: '{{179059249606625}}',
          state: '{{csrf}}',
          version: '{{v1.1}}',
          fbAppEventsEnabled: true,
          redirect: '{{https://safemeet.space/}}',
        },
      );
    };
  }

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
      
    onChangeValue

     onchangeCountryCode=()=>{
       this.setState({
         value:
       })
     }

  // phone form submission handler
    smsLogin = () => {
      this.setState({
        number: '',
      });
      const countryCode = document.getElementById('country_code').value;
      const phoneNumber = document.getElementById('phone_number').value;
      AccountKit.login(
        'PHONE',
        { countryCode, phoneNumber }, // will use default values if not specified
        loginCallback,
      );
    };


    // email form submission handler
    emailLogin = () => {
      const emailAddress = document.getElementById('email').value;
      AccountKit.login(
        'EMAIL',
        { emailAddress },
        loginCallback,
      );
    };

    render() {
      return (
        <div>
          <input value={this.state.value} onChange={this.onchangeCountryCode} id="country_code" />
          <input value={this.state.number} onChange={this.onchangePhoneNumber} placeholder="phone number" id="phone_number" />
          <button type="button" onClick={this.smsLogin}>
Login via SMS
          </button>
          <div>
OR
          </div>
          <input placeholder="email" id="email" />
          <button type="button" onClick={this.emailLogin}>
Login via Email
          </button>
        </div>
      );
    }
}

export default InitAccount;
