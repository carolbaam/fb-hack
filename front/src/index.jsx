import React from 'react';
import ReactDOM from 'react-dom';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { initializeIcons } from '@uifabric/icons';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Login from './Login';
import App from './App';
import Privacy from './Privacy';
import registerServiceWorker from './registerServiceWorker';


initializeIcons();

ReactDOM.render((
  <Router>
    <Fabric>
      <Route exact path="/login" component={Login} />
      <Route exact path="/" component={App} />
      <Route path="/privacy" component={Privacy} />
    </Fabric>
  </Router>
), document.getElementById('root'));
registerServiceWorker();
