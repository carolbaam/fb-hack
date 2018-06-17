import React, { Component, Fragment } from 'react';
import mapboxgl from 'mapbox-gl';
import styled, { injectGlobal } from 'styled-components';
import jsonp from 'jsonp';
import get from 'lodash/get';
import filter from 'lodash/filter';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';

import icon from './img/mapbox-icon.png'

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
const endpoint = (lon, lat) => `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=${lon}&lat=${lat}&key=${process.env.REACT_APP_KEY}`;

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

const geojson = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-77.032, 38.913]
    },
    properties: {
      title: 'Mapbox',
      description: 'Washington, D.C.'
    }
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-122.414, 37.776]
    },
    properties: {
      title: 'Mapbox',
      description: 'San Francisco, California'
    }
  }]
};

class App extends Component {
  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      zoom: 12.5
    });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition);
    }

  }

  showPosition = ({ coords : { longitude, latitude }}) => {
    this.map.setCenter([longitude, latitude]);
    console.log(endpoint(longitude, latitude),);
    jsonp(endpoint(longitude, latitude), null, (err, data) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(data);
        const events = get(data, 'data.events', []);
        filter(events, event => (get(event, 'venue.lon') !== undefined) && (get(event, 'venue.lat') !== undefined)).forEach((event) => {
          // create a HTML element for each feature
          var el = document.createElement('div');
          el.className = 'marker';
          console.log(event);
          const lon = get(event, 'venue.lon')
          const lat = get(event, 'venue.lat')
          // make a marker for each feature and add to the map
//          coordinates: [-77.032, 38.913]
          new mapboxgl.Marker(el)
          .setLngLat([lon, lat])
          .addTo(this.map);
        });
      }
    });
    
  }

  componentWillUnmount() {
    this.map.remove();
  }

  render() {
    const style = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '100%'
    };

    return (
    <Fragment>
      <SearchContainer>
        <div className="cont">
          <SearchBox
            placeholder="Search"
            onFocus={() => console.log('onFocus called')}
            onBlur={() => console.log('onBlur called')}
            onChange={() => console.log('onChange called')}
          />
        </div>
      </SearchContainer>
      <div style={style} ref={el => this.mapContainer = el} />
    </Fragment>
    );
  }
}

export default App;
