import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { initializeIcons } from '@uifabric/icons';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider, Consumer } from './State';

import Login from './Login';
import App from './App';
import Privacy from './Privacy';
import registerServiceWorker from './registerServiceWorker';

initializeIcons();

ReactDOM.render((
  <Provider>
    <Router>
      <Fabric>
        <Consumer>
          {({ appState, update }) => {
            console.log(appState.get('token'));
            if (appState.get('token')) {
              return (
                <Fragment>
                  <Route exact path="/" component={App} />
                  <Route path="/privacy" component={Privacy} />
                </Fragment>
              );
            }
            return (
              <Fragment>
                <Route exact path="/" component={props => (<Login {...props} appState={appState} update={update} />)} />
                <Route path="/privacy" component={Privacy} />
              </Fragment>
            );
          }}
        </Consumer>
      </Fabric>
    </Router>
  </Provider>
), document.getElementById('root'));
registerServiceWorker();
