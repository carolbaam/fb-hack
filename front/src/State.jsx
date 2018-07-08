import React, { Component } from 'react';
import { Map } from 'immutable';

import api from './api';

const AppContext = React.createContext();

type Props = {
    children: Component | [Component]
}

export class Provider extends Component<Props> {
  state ={
    appState: Map({ token: localStorage.getItem('token') }),
  }

  update = (newAppState) => {
    const { appState } = this.state;
    this.setState(() => ({ appState: newAppState }));
  }

  render() {
    const { children } = this.props;
    const { appState } = this.state;

    return (
      <AppContext.Provider value={{ appState, update: this.update }}>
        {children}
      </AppContext.Provider>
    );
  }
}

export const { Consumer } = AppContext;
