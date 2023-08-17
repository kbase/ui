import { useEffect, useId, useMemo, useRef, useState } from 'react';
import '../../../node_modules/leaflet/dist/leaflet.css';
import L from 'leaflet';

export const useLeaflet = (
  init: (Leaflet: typeof L, leafletMap: L.Map) => void
) => {
  const id = useId();
  const [leafletMap, setLeafletMap] = useState<L.Map>();

  // Map init
  // Using a ref here so that our init function can safely change, without
  // triggering the following useEffect.
  const initFunc = useRef(init);
  initFunc.current = init;
  useEffect(() => {
    if (leafletMap) initFunc.current(L, leafletMap);
  }, [leafletMap]);

  return useMemo(
    () => ({ leafletMap, setLeafletMap, id, L }),
    [id, leafletMap]
  );
};

// Controls Leaflet Map container and initialization
export const LeafletMap = ({
  map,
  height,
}: {
  map: ReturnType<typeof useLeaflet>;
  height: string | number;
}) => {
  const mapRef = useRef(null);
  useEffect(() => {
    if (
      mapRef &&
      (!map.leafletMap || map.leafletMap?.getContainer().id !== map.id)
    ) {
      try {
        map.setLeafletMap(L.map(map.id));
      } catch (e: unknown) {
        if (
          !(
            typeof e === 'object' &&
            (e as Error)?.message === 'Map container is already initialized.'
          )
        ) {
          throw e;
        }
      }
    }
  }, [mapRef, map]);
  return <div id={map.id} ref={mapRef} style={{ height: height }} />;
};
