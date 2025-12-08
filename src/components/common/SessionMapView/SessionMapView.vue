<template>
  <div class="session-map-container">
    <div ref="mapRef" class="session-map"></div>
    <div v-if="showLegend" class="map-legend">
      <div class="legend-item">
        <div class="legend-marker checkpoint-marker"></div>
        <span>{{ $t('quests.sessions.managePage.map.checkpoints') }}</span>
      </div>
      <div class="legend-item">
        <div class="legend-marker participant-marker"></div>
        <span>{{ $t('quests.sessions.managePage.map.participants') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, withDefaults } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDefaultCoordinates } from '@/utils/geolocation';
import type { ParticipantLocation } from '@/types/session';

interface Checkpoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

interface Props {
  checkpoints?: Checkpoint[];
  participants?: ParticipantLocation[];
  showCheckpoints?: boolean;
  showPaths?: boolean;
  showLegend?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const props = withDefaults(defineProps<Props>(), {
  checkpoints: () => [],
  participants: () => [],
  showCheckpoints: true,
  showPaths: false,
  showLegend: true,
  center: () => getDefaultCoordinates(),
  zoom: 12,
});

const mapRef = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let checkpointMarkers: Map<string, L.Marker> = new Map();
let participantMarkers: Map<number, L.Marker> = new Map();
let pathPolyline: L.Polyline | null = null;
let isInitialBoundsSet = false;
let markerAnimations: Map<number, number> = new Map();

const COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#22c55e',
  '#ef4444',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

const getColorForParticipant = (index: number): string => {
  return COLORS[index % COLORS.length];
};

const getInitialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Функція для плавного переміщення маркера
const animateMarkerMove = (
  marker: L.Marker,
  participantId: number,
  newLatLng: L.LatLng,
  duration: number = 1000
) => {
  const existingAnimationId = markerAnimations.get(participantId);
  if (existingAnimationId) {
    cancelAnimationFrame(existingAnimationId);
  }

  const startLatLng = marker.getLatLng();
  const startLat = startLatLng.lat;
  const startLng = startLatLng.lng;
  const endLat = newLatLng.lat;
  const endLng = newLatLng.lng;

  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeProgress = 1 - Math.pow(1 - progress, 3);

    const currentLat = startLat + (endLat - startLat) * easeProgress;
    const currentLng = startLng + (endLng - startLng) * easeProgress;

    marker.setLatLng([currentLat, currentLng]);

    if (progress < 1) {
      const animationId = requestAnimationFrame(animate);
      markerAnimations.set(participantId, animationId);
    } else {
      markerAnimations.delete(participantId);
    }
  };

  const animationId = requestAnimationFrame(animate);
  markerAnimations.set(participantId, animationId);
};

onMounted(() => {
  initMap();
});

const initMap = () => {
  if (!mapRef.value) return;

  const defaultCoords = getDefaultCoordinates();
  const mapCenter = props.center
    ? [props.center.lat, props.center.lng] as L.LatLngExpression
    : [defaultCoords.lat, defaultCoords.lng] as L.LatLngExpression;

  map = L.map(mapRef.value, {
    dragging: true,
    touchZoom: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
    zoomControl: true,
  }).setView(mapCenter, props.zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  updateMap();
};

const createCheckpointIcon = (order: number): L.DivIcon => {
  return L.divIcon({
    className: 'custom-checkpoint-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: #30b79d;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${order}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const createParticipantIcon = (initials: string, color: string, photoUrl?: string | null, isActive: boolean = true): L.DivIcon => {
  const hasValidPhoto = photoUrl && photoUrl.trim().length > 0;

  const onlineIndicator = isActive ? `<div style="
    position: absolute;
    bottom: 0;
    right: 0;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #22c55e;
    border: 2px solid white;
    z-index: 10;
  "></div>` : '';

  const avatarContent = hasValidPhoto
    ? `<img src="${photoUrl}" alt="${initials}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.parentElement.style.backgroundColor='${color}'; this.parentElement.innerHTML='<span style=\\'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;\\' >${initials}</span>';" />`
    : initials;

  const backgroundColor = hasValidPhoto ? 'transparent' : color;

  return L.divIcon({
    className: 'custom-participant-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px;">
        <div style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: ${backgroundColor};
          border: 4px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 15px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.4);
          position: relative;
          overflow: hidden;
        ">
          ${avatarContent}
        </div>
        ${onlineIndicator}
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

const updateCheckpoints = () => {
  if (!map || !props.showCheckpoints) {
    checkpointMarkers.forEach(marker => map?.removeLayer(marker));
    checkpointMarkers.clear();
    return;
  }

  const existingIds = new Set(checkpointMarkers.keys());
  const currentIds = new Set(props.checkpoints?.map(cp => cp.id) || []);

  existingIds.forEach(id => {
    if (!currentIds.has(id)) {
      const marker = checkpointMarkers.get(id);
      if (marker) {
        map?.removeLayer(marker);
        checkpointMarkers.delete(id);
      }
    }
  });

  props.checkpoints?.forEach((checkpoint) => {
    let marker = checkpointMarkers.get(checkpoint.id);

    if (marker) {
      marker.setLatLng([checkpoint.latitude, checkpoint.longitude]);
      marker.setIcon(createCheckpointIcon(checkpoint.order));
    } else {
      marker = L.marker(
        [checkpoint.latitude, checkpoint.longitude],
        {
          icon: createCheckpointIcon(checkpoint.order),
          title: checkpoint.name,
        }
      ).addTo(map!);

      const popupContent = `
        <div style="font-family: inherit;">
          <strong>${checkpoint.name}</strong><br/>
          <span style="font-size: 0.85em; color: #666;">
            ${checkpoint.latitude.toFixed(4)}, ${checkpoint.longitude.toFixed(4)}
          </span>
        </div>
      `;
      marker.bindPopup(popupContent);

      checkpointMarkers.set(checkpoint.id, marker);
    }
  });

  updatePath();
};

const updatePath = () => {
  if (pathPolyline) {
    map?.removeLayer(pathPolyline);
    pathPolyline = null;
  }

  if (!map || !props.showPaths || !props.checkpoints || props.checkpoints.length < 2) {
    return;
  }

  const points = props.checkpoints
    .sort((a, b) => a.order - b.order)
    .map(cp => [cp.latitude, cp.longitude] as L.LatLngExpression);

  pathPolyline = L.polyline(points, {
    color: '#30b79d',
    weight: 3,
    opacity: 0.7,
    dashArray: '10, 10',
  }).addTo(map);
};

const updateParticipants = () => {
  if (!map) return;

  const existingIds = new Set(participantMarkers.keys());
  const currentIds = new Set(props.participants?.map(p => p.participantId) || []);

  existingIds.forEach(id => {
    if (!currentIds.has(id)) {
      const marker = participantMarkers.get(id);
      if (marker) {
        map?.removeLayer(marker);
        participantMarkers.delete(id);
      }
    }
  });

  props.participants?.forEach((participant, index) => {
    const { participantId, latitude, longitude, userName, timestamp, photoUrl, isActive } = participant;
    let marker = participantMarkers.get(participantId);

    const initials = getInitialsFromName(userName);
    const color = getColorForParticipant(index);
    const hasValidPhoto = photoUrl && photoUrl.trim().length > 0;

    if (marker) {
      const newLatLng = L.latLng(latitude, longitude);
      animateMarkerMove(marker, participantId, newLatLng);

      marker.setIcon(createParticipantIcon(initials, color, photoUrl, isActive));

      const avatarHtml = hasValidPhoto
        ? `<img src="${photoUrl}" alt="${userName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
        : initials;

      const avatarBg = hasValidPhoto ? 'transparent' : color;

      const popupContent = `
        <div style="font-family: inherit;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background-color: ${avatarBg};
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: 13px;
              overflow: hidden;
            ">
              ${avatarHtml}
            </div>
            <strong>${userName}</strong>
          </div>
          <div style="font-size: 0.85em; color: #666;">
            <div>${latitude.toFixed(6)}, ${longitude.toFixed(6)}</div>
            <div style="margin-top: 4px; color: #999;">
              Updated: ${new Date(timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      `;
      marker.getPopup()?.setContent(popupContent);
    } else {
      marker = L.marker(
        [latitude, longitude],
        {
          icon: createParticipantIcon(initials, color, photoUrl, isActive),
          title: userName,
          zIndexOffset: 1000,
        }
      ).addTo(map!);

      const avatarHtml = hasValidPhoto
        ? `<img src="${photoUrl}" alt="${userName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
        : initials;

      const avatarBg = hasValidPhoto ? 'transparent' : color;

      const popupContent = `
        <div style="font-family: inherit;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background-color: ${avatarBg};
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: 13px;
              overflow: hidden;
            ">
              ${avatarHtml}
            </div>
            <strong>${userName}</strong>
          </div>
          <div style="font-size: 0.85em; color: #666;">
            <div>${latitude.toFixed(6)}, ${longitude.toFixed(6)}</div>
            <div style="margin-top: 4px; color: #999;">
              Updated: ${new Date(timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);

      participantMarkers.set(participantId, marker);
    }
  });

  adjustMapBounds();
};

const adjustMapBounds = () => {
  if (!map || isInitialBoundsSet) return;

  const allPoints: L.LatLngExpression[] = [];

  if (props.showCheckpoints && props.checkpoints) {
    props.checkpoints.forEach(cp => {
      allPoints.push([cp.latitude, cp.longitude]);
    });
  }

  props.participants?.forEach(participant => {
    allPoints.push([participant.latitude, participant.longitude]);
  });

  if (allPoints.length > 0) {
    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    isInitialBoundsSet = true;
  }
};

const updateMap = () => {
  updateCheckpoints();
  updateParticipants();
};

watch(() => props.checkpoints, () => {
  updateCheckpoints();
}, { deep: true });

watch(() => props.participants, () => {
  updateParticipants();
}, { deep: true });

watch(() => props.showCheckpoints, () => {
  updateCheckpoints();
});

watch(() => props.showPaths, () => {
  updatePath();
});

onBeforeUnmount(() => {
  markerAnimations.forEach((animationId) => {
    cancelAnimationFrame(animationId);
  });
  markerAnimations.clear();

  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.session-map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.session-map {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.map-legend {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
}

.legend-marker {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.checkpoint-marker {
  background-color: #30b79d;
}

.participant-marker {
  background-color: #3b82f6;
}
</style>
