import React, { Component } from 'react';
import { Map } from 'immutable';
import isEqual from 'lodash/isEqual';

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
    try {
      const { appState } = this.state;
      if (!isEqual(newAppState.toJS(), appState.toJS())) {
        this.setState(() => ({ appState: newAppState }));
      }
    } catch (error) {
      console.error(error);
    }
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
