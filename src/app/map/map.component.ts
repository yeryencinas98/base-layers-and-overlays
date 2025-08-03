import { Component, HostListener } from '@angular/core';
import { Map } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import { TileWMS, XYZ } from 'ol/source';
import LayerGroup from 'ol/layer/Group';
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { environment } from '../../environments/environment'; 
@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  protected map!: Map;

  ngOnInit(){
    this.initMap();
  }

  @HostListener('unloaded')
  ngOnDestroy(): void {
    if (this.map) {
      this.map.setTarget(undefined); // Desvincular el mapa del DOM
      this.map.dispose(); // Liberar recursos del mapa
    }
  }

  initMap(){
    
    const osmLayer = new TileLayer({
      source: new OSM(),
      properties: {
        title: "Open Street Maps",
        baseLayer: true,
      },
      visible: true
    });

    const hybridLayer = new TileLayer({
      source: new XYZ({
        attributions:'Tiles © <a href="https://google.com">Google</a>',
        url: 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}&s=Ga',
      }),
      properties: {
        title: "Hibrid",
        baseLayer: true,
      },
      visible: false
    });

     const riverLayer = new TileLayer({
      source: new TileWMS({
        url: `${environment.geoserverUrl}/geonode/wms`,
        attributions:'Tiles © <a href="https://geo.gob.bo">GeoBolivia</a>',
        params: {
          'LAYERS': 'geonode:rios_principales',
          'TILED': true,
        },
        serverType: 'geoserver',
      }),
       properties: {
        title: "Main Rivers",
      },
    });

     const departmentalBoundaryLayer = new TileLayer({
      source: new TileWMS({
        url: `${environment.geoserverUrl}/geonode/wms`,
        attributions:'Tiles © <a href="https://geo.gob.bo">GeoBolivia</a>',
        params: {
          'LAYERS': 'geonode:limites_departamentales',
          'TILED': true,
        },
        serverType: 'geoserver',
      }),
       properties: {
        title: "Departamental Boundary",
      },
    });

    // Format layer geojson
    const riversSource = new VectorSource({
      format: new GeoJSON(),
      url: `${environment.geoserverUrl}/geonode/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geonode:rios_principales&maxFeatures=50&outputFormat=application/json`
    });

    const layersRivers = new VectorLayer({
      source: riversSource
    });
    
    const baseLayersGroup = new LayerGroup({
      properties:{
        title: "Base layers"
      },
      layers: [osmLayer, hybridLayer]
    });

    const overlaysGroup = new LayerGroup({
      properties:{
        title: "Overlapping layers"
      },
      layers: [riverLayer, departmentalBoundaryLayer]
    });

    this.map = new Map({
      target: 'map',
      layers: [baseLayersGroup, overlaysGroup],
      view: new View({
        center: [-65.165668, -15.723428],
        zoom: 6,
        projection: 'EPSG:4326'
      })
    });

    const layerSwitcher = new LayerSwitcher({
      activationMode: 'click',
      startActive: true,
      tipLabel: 'Leyenda',  // tooltip
      groupSelectStyle: 'children' // opción para seleccionar capas dentro de grupos
    });

    this.map.addControl(layerSwitcher);
  }
}
