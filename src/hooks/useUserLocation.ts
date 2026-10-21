"use client";

import { useState, useCallback } from "react";

interface LocationState {
  coords: [number, number] | null;
  loading: boolean;
  error: string | null;
}

export function useUserLocation() {
  const [state, setState] = useState<LocationState>({
    coords: null,
    loading: false,
    error: null,
  });

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation not supported" }));
      return;
    }

    setState({ coords: null, loading: true, error: null });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: [pos.coords.latitude, pos.coords.longitude],
          loading: false,
          error: null,
        });
      },
      (err) => {
        setState({ coords: null, loading: false, error: err.message });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return { ...state, locate };
}
