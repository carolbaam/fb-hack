import React, { Component, Fragment } from 'react';
import mapboxgl from 'mapbox-gl';
import styled, { injectGlobal } from 'styled-components';
import axios from 'axios';
import get from 'lodash/get';
import filter from 'lodash/filter';

import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { Modal } from 'office-ui-fabric-react/lib/Modal';

// import List from './List';
import icon from './img/mapbox-icon.png';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
// const endpoint = (lon, lat) => `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=${lon}&lat=${lat}&key=${process.env.REACT_APP_KEY}`;

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

class App extends Component {
  state = {
    markers: [],
    showModal: false,
    searchValue: '',
    modalContent: '',
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
  }


  componentWillUnmount() {
    this.map.remove();
  }

  onSearch = (value) => {
    const { markers } = this.state;
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    this.setState(() => ({ searchValue: value }));
    const elsToAdd = markers.filter(
      ({ event }) => event.name.toLowerCase().slice(0, inputLength) === inputValue,
    );
    const elsToRem = markers.filter(
      ({ event }) => event.name.toLowerCase().slice(0, inputLength) !== inputValue,
    );

    elsToAdd.forEach(({ domEl }) => {
      domEl.addTo(this.map);
    });

    elsToRem.forEach(({ domEl }) => {
      domEl.remove();
    });
  }

  closeModal = () => {
    this.setState(() => ({ showModal: false }));
  }

  showPosition = ({ coords: { longitude, latitude } }) => {
    this.map.setCenter([longitude, latitude]);
    console.log('post', process.env.REACT_APP_API);
    axios.post(process.env.REACT_APP_API, { lon: longitude, lat: latitude }).then((res) => {
      console.log('res', res);
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
    this.setState(() => ({
      showModal: true,
      modalContent: el.name,
    }));
  }


  render() {
    const style = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '100%',
    };
    const { searchValue, showModal, modalContent } = this.state;
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
        <div style={style} ref={(el) => { this.mapContainer = el; }} />
        <Modal
          isOpen={showModal}
          onDismiss={this.closeModal}
          isBlocking={false}
          containerClassName="ms-modalExample-container"
        >
          {modalContent}
        </Modal>
        {}
      </Fragment>
    );
  }
}

export default App;
