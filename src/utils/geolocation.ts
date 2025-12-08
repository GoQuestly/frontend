export interface Coordinates {
    lat: number;
    lng: number;
}

const DEFAULT_COORDINATES: Coordinates = {
    lat: 49.9935,
    lng: 36.2304,
};

const getUserGeolocation = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                reject(error);
            },
            {
                timeout: 5000,
                maximumAge: 300000,
            }
        );
    });
};


const getLocationFromIP = async (): Promise<Coordinates> => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
            throw new Error('IP geolocation failed');
        }
        const data = await response.json();

        if (data.latitude && data.longitude) {
            return {
                lat: data.latitude,
                lng: data.longitude,
            };
        }
        throw new Error('Invalid IP geolocation data');
    } catch (error) {
        throw error;
    }
};

export const getUserLocation = async (): Promise<Coordinates> => {
    try {
        return await getUserGeolocation();
    } catch (geolocationError) {
        console.warn('Browser geolocation failed, trying IP-based location:', geolocationError);

        try {
            return await getLocationFromIP();
        } catch (ipError) {
            console.warn('IP geolocation failed, using default coordinates:', ipError);

            return DEFAULT_COORDINATES;
        }
    }
};

export const getDefaultCoordinates = (): Coordinates => {
    const cached = localStorage.getItem('userLocation');
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            const cacheTime = parsed.timestamp;
            const now = Date.now();

            if (now - cacheTime < 24 * 60 * 60 * 1000) {
                return { lat: parsed.lat, lng: parsed.lng };
            }
        } catch (e) {
        }
    }

    return DEFAULT_COORDINATES;
};

export const cacheUserLocation = (coordinates: Coordinates): void => {
    try {
        localStorage.setItem('userLocation', JSON.stringify({
            ...coordinates,
            timestamp: Date.now(),
        }));
    } catch (e) {
    }
};
