import React, { Component, Fragment } from 'react';
import mapboxgl from 'mapbox-gl';
import styled from 'styled-components';
import filter from 'lodash/filter';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import get from 'lodash/get';

import api from './api';

const StyDefaultButton = styled(DefaultButton)`
  position: fixed;
  z-index: 2;
  bottom: 2rem;
  right: 2rem;
`;


mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';


export default class MeetMap extends Component {
  state = {
    empty: false,
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      zoom: 12.5,
    });
    if (navigator.geolocation) {
      const id = get(this, 'props.match.params.id');
      api.get(`/rallypoint?id=${id}`).then((res) => {
        const empty = get(res, 'data.empty', false);
        this.setState({ empty }, () => {
          if (!empty) {
            const marker = new mapboxgl.Marker()
              .setLngLat([res.data.lng, res.data.lat])
              .addTo(this.map);
            navigator.geolocation.getCurrentPosition(({ coords: { longitude, latitude } }) => {
              this.map.setCenter([longitude, latitude]);
            });
          } else {
            navigator.geolocation.getCurrentPosition(this.showPosition);
          }
        });
      });
    }
  }

  setPosition = () => {
    const { lng, lat } = this.map.getBounds().getCenter();
    const id = get(this, 'props.match.params.id');
    api.post('/rallypoint', {
      lng,
      lat,
      id,
    }).then((data) => {
      this.map.off(this.moveMap);
      this.dragmarker.remove();
      const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(this.map);
      this.setState({ empty: false });
    }).catch((err) => {
      console.error(err);
    });
  }

  moveMap = () => {
    const { lng, lat } = this.map.getBounds().getCenter();
    this.dragmarker.setLngLat([lng, lat]);
  }

  showPosition = ({ coords: { longitude, latitude } }) => {
    this.map.setCenter([longitude, latitude]);
    const { empty } = this.state;
    if (empty) {
      const marker = new mapboxgl.Marker()
        .setLngLat([longitude, latitude])
        .addTo(this.map);
      this.setState(() => ({ marker }));
      this.dragmarker = marker;
      this.map.on('move', this.moveMap);
    }
  }


  render() {
    const { empty } = this.state;
    const style = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '100%',
    };
    return (
      <Fragment>
        {empty && (
        <StyDefaultButton onClick={this.setPosition}>
          Agregar Punto de Reunion
        </StyDefaultButton>
        )}
        <div style={style} ref={(el) => { this.mapContainer = el; }} />
      </Fragment>
    );
  }
}
