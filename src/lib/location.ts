export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export async function getCurrentGPSLocation(): Promise<GPSLocation> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser or device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;
        const loc: GPSLocation = {
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          altitude: altitude ? Math.round(altitude) : null,
          speed: speed ? Math.round(speed * 3.6) : null, // convert m/s to km/h
          heading: heading ? Math.round(heading) : null,
          timestamp: position.timestamp,
        };

        // Attempt reverse geocoding via OpenStreetMap Nominatim API
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          if (response.ok) {
            const data = await response.json();
            loc.address = data.display_name;
            if (data.address) {
              loc.city = data.address.city || data.address.town || data.address.village || data.address.suburb;
              loc.state = data.address.state;
              loc.country = data.address.country;
            }
          }
        } catch (e) {
          console.warn('Reverse geocoding lookup silent fallback:', e);
        }

        resolve(loc);
      },
      (error) => {
        let msg = 'Failed to obtain live location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  });
}
