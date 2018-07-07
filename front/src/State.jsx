import React, { Component } from 'react';
import { Map } from 'immutable';

const AppContext = React.createContext();

type Props = {
    children: Component | [Component]
}

export class Provider extends Component<Props> {
  state ={
    appState: Map({ token: localStorage.getItem('token') }),
  }

  update = (appState) => {
    this.setState(() => ({ appState }));
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
