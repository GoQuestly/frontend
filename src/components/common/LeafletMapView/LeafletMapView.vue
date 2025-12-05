<template>
  <div class="leaflet-map-container">
    <div ref="mapRef" class="leaflet-map"></div>
    <div
        v-if="selectedCheckpoint && interactive && editable && showInstructions"
        class="map-instructions"
    >
      <p>{{ $t('quests.createQuest.step2.mapInstructions') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, withDefaults, toRefs } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { QuestCheckpoint } from '@/types/checkpoint';
import { getDefaultCoordinates } from '@/utils/geolocation';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type Checkpoint = QuestCheckpoint;

interface Props {
  checkpoints: Checkpoint[];
  selectedCheckpointId: string | null;
  interactive?: boolean;
  showInstructions?: boolean;
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  interactive: true,
  showInstructions: true,
  editable: true,
});

const emit = defineEmits<{
  (e: 'update-coordinates', id: string, lat: number, lng: number): void;
  (e: 'marker-click', id: string): void;
}>();

const mapRef = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let markers: Map<string, L.Marker> = new Map();

const selectedCheckpoint = computed(() =>
    props.checkpoints.find(cp => cp.id === props.selectedCheckpointId)
);

onMounted(() => {
  initMap();
});

const initMap = () => {
  if (!mapRef.value) return;

  const defaultCoords = getDefaultCoordinates();
  const center = props.checkpoints.length > 0
      ? [props.checkpoints[0].latitude, props.checkpoints[0].longitude] as L.LatLngExpression
      : [defaultCoords.lat, defaultCoords.lng] as L.LatLngExpression;

  const mapOptions: L.MapOptions = {
    dragging: props.interactive,
    touchZoom: props.interactive,
    scrollWheelZoom: props.interactive,
    doubleClickZoom: props.interactive,
    boxZoom: props.interactive,
    keyboard: props.interactive,
    zoomControl: props.interactive,
  };

  map = L.map(mapRef.value, mapOptions).setView(center, 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  updateMarkers();

  if (props.interactive && props.editable) {
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (props.selectedCheckpointId) {
        const { lat, lng } = e.latlng;
        emit('update-coordinates', props.selectedCheckpointId, lat, lng);
      }
    });
  }
};

const createCustomIcon = (number: number, isSelected: boolean): L.DivIcon => {
  const backgroundColor = isSelected ? '#30b79d' : '#9ca3af';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-inner" style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: ${backgroundColor};
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: ${props.interactive && props.editable ? 'pointer' : 'default'};
      ">
        ${number}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const updateMarkers = () => {
  if (!map) return;

  markers.forEach(marker => map?.removeLayer(marker));
  markers.clear();

  props.checkpoints.forEach((checkpoint, index) => {
    const isSelected = checkpoint.id === props.selectedCheckpointId;

    const marker = L.marker(
        [checkpoint.latitude, checkpoint.longitude],
        {
          icon: createCustomIcon(index + 1, isSelected),
          draggable: isSelected && props.interactive && props.editable,
          title: checkpoint.name || `Checkpoint ${index + 1}`,
        }
    ).addTo(map!);

    const popupContent = `
      <div style="font-family: inherit;">
        <strong>${checkpoint.name || `Checkpoint ${index + 1}`}</strong><br/>
        <span style="font-size: 0.85em; color: #666;">
          Lat: ${checkpoint.latitude.toFixed(4)}<br/>
          Lng: ${checkpoint.longitude.toFixed(4)}
        </span>
      </div>
    `;
    marker.bindPopup(popupContent);

    if (isSelected && props.interactive && props.editable) {
      marker.on('dragend', (e: L.DragEndEvent) => {
        const { lat, lng } = e.target.getLatLng();
        emit('update-coordinates', checkpoint.id, lat, lng);
      });
    }

    if (props.interactive) {
      marker.on('click', () => {
        emit('marker-click', checkpoint.id);
        map?.panTo(marker.getLatLng());
      });
    }

    markers.set(checkpoint.id, marker);
  });

  if (props.checkpoints.length === 1) {
    const [checkpoint] = props.checkpoints;
    map?.setView(
        [checkpoint.latitude, checkpoint.longitude],
        Math.max(map?.getZoom() || 12, 14),
    );
  } else if (props.checkpoints.length > 1) {
    const bounds = L.latLngBounds(
        props.checkpoints.map(cp => [cp.latitude, cp.longitude] as L.LatLngExpression)
    );
    map?.fitBounds(bounds, { padding: [50, 50] });
  }
};

watch(() => [props.checkpoints, props.selectedCheckpointId], () => {
  updateMarkers();
}, { deep: true });

const { interactive, editable, showInstructions } = toRefs(props);
</script>

<style scoped src="./LeafletMapView.css"></style>
