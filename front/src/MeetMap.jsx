import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import styled, { injectGlobal } from 'styled-components';
import filter from 'lodash/filter';
import { createRef } from 'office-ui-fabric-react/lib/Utilities';
import get from 'lodash/get';
import api from './api';


mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

export default class MeetMap extends Component {
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


  render() {
    const style = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '100%',
    };
    return (

      <div style={style} ref={(el) => { this.mapContainer = el; }} />
    );
  }
}
