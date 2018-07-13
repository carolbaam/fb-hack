import React, { Component, Fragment } from 'react';
import mapboxgl from 'mapbox-gl';
import styled, { injectGlobal } from 'styled-components';
import axios from 'axios';
import get from 'lodash/get';
import filter from 'lodash/filter';
import difference from 'lodash/difference';

import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { IconButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { createRef } from 'office-ui-fabric-react/lib/Utilities';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import Fuse from 'fuse.js';
import MeetMap from './MeetMap';


import api from './api';
import icon from './img/mapbox-icon.png';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

injectGlobal`
  .marker {
    background-image: url('${icon}');
    background-size: cover;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const StyledIconButton = styled.div`
  position: fixed;
  z-index: 2;
  right: 3rem;
  top: 1rem;
  background-color: white;
`;

const CalloutContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SearchContainer = styled.div`
  position: fixed;
  width: 100vw;
  z-index: 2;
  top: 1rem;
  display: flex;
  justify-content: center;
  .cont {
    width: 66vw;
    background-color: white;
  }
`;

// const ListContainer = SearchContainer.extend`
//   top: 3rem;
// `;

const ModalContent = styled.div`

  width: 80vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  padding: 3rem;
  .content {
    overflow: scroll;
  }
`;


type Props = {
  appState: Object,
  update: Function,
  history:Object
}

class App extends Component<Props> {
  menuButtonElement = null;

  state = {
    markers: [],
    showModal: false,
    searchValue: '',
    modalContent: '',
    isCalloutVisible: false,
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      zoom: 12.5,
    });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition);
    }
    api.get('/profile').then(({ data }) => {
      const { appState, update } = this.props;
      console.log('data.meetups', data.meetups);
      update(appState.set('meetups', data.meetups));
    });
  }


  componentWillUnmount() {
    this.map.remove();
  }

  onClickModal = (props) => {
    const { history } = this.props;
    history.push('/meetmap');
  };


  onSearch = (value) => {
    const { markers } = this.state;
    const inputValue = value.trim().toLowerCase();
    this.setState(() => ({ searchValue: value }));

    if (inputValue === '') {
      markers.forEach(({ domEl }) => {
        domEl.addTo(this.map);
      });
      return;
    }

    const options = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        'event.name',
      ],
    };

    const fuse = new Fuse(markers, options);
    const elsToAdd = fuse.search(inputValue);

    const elsToRem = difference(markers, elsToAdd);

    elsToAdd.forEach(({ domEl }) => {
      domEl.addTo(this.map);
    });

    elsToRem.forEach(({ domEl }) => {
      domEl.remove();
    });
  }

  onShowMenuClicked = () => {
    const { isCalloutVisible } = this.state;
    this.setState({
      isCalloutVisible: !isCalloutVisible,
    });
  }

  onLogout = () => {
    requestAnimationFrame(() => {
      const { appState, update } = this.props;
      localStorage.removeItem('token');
      update(appState.set('token', undefined));
    });
  }

  onDismiss= () => {
    this.setState({ isCalloutVisible: false });
  }


  closeModal = () => {
    this.setState(() => ({ showModal: false }));
  }

  showPosition = ({ coords: { longitude, latitude } }) => {
    this.map.setCenter([longitude, latitude]);
    api.post('/meetups', { lon: longitude, lat: latitude }).then((res) => {
      const events = get(res, 'data.events', []);
      let markers = [];
      filter(events,
        event => (get(event, 'venue.lon') !== undefined) && (get(event, 'venue.lat') !== undefined)).forEach((event) => {
        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'marker';
        const lon = get(event, 'venue.lon');
        const lat = get(event, 'venue.lat');
        el.addEventListener('click', () => {
          this.clickMarker(event);
        });
        const marker = new mapboxgl.Marker(el)
          .setLngLat([lon, lat])
          .addTo(this.map);
        markers = markers.concat({
          domEl: marker,
          event,
        });
      });
      this.setState(() => ({ markers }));
    }).catch((err) => {
      console.error(err);
    });
  }


  clickMarker = (el) => {
    console.log(el);
    this.setState(() => ({
      showModal: true,
      modalContent: (
      // genModalContent(el.name, el.description),
        <ModalContent>
          <div className="title">
            {el.name}
          </div>
          <div className="content" dangerouslySetInnerHTML={{ __html: el.description }} />
          <div className="actions">
            <DefaultButton onClick={this.onClickModal} text="Ir a meetup" />
          </div>
        </ModalContent>
      ),
    }));
  }

  render() {
    const style = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '100%',
    };
    const {
      searchValue, showModal, modalContent, isCalloutVisible,
    } = this.state;
    return (
      <Fragment>
        <SearchContainer>
          <div className="cont">
            <SearchBox
              placeholder="Search"
              value={searchValue}
              onFocus={() => console.log('onFocus called')}
              onBlur={() => console.log('onBlur called')}
              onChange={this.onSearch}
            />
          </div>
        </SearchContainer>
        <StyledIconButton innerRef={(menuButton) => { (this.menuButtonElement = menuButton); }}>
          <IconButton
            // disabled={disabled}
            // checked={checked}
            onClick={this.onShowMenuClicked}
            iconProps={{ iconName: 'CollapseMenu' }}
            title="CollapseMenu"
            ariaLabel="CollapseMenu"
          />
        </StyledIconButton>
        <div style={style} ref={(el) => { this.mapContainer = el; }} />
        <Modal
          isOpen={showModal}
          onDismiss={this.closeModal}
          isBlocking={false}
          containerClassName="ms-modalExample-container"
        >
          {modalContent}
        </Modal>
        {isCalloutVisible ? (
          <Callout
            onDismiss={this.onDismiss}
            target={this.menuButtonElement}
            directionalHint={DirectionalHint.topRightEdge}
            coverTarget
            isBeakVisible={false}
            gapSpace={0}
            directionalHintFixed
          >
            <CalloutContainer>
              <DefaultButton onClick={this.onShowMenuClicked} text="Invitar Amigos" />
              <DefaultButton onClick={this.onLogout} text="Logout" />
            </CalloutContainer>
          </Callout>

        ) : null}
      </Fragment>
    );
  }
}

export default App;
