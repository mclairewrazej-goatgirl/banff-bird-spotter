import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
const EBIRD_API_KEY = import.meta.env.VITE_EBIRD_KEY
const LAT = 51.1822
const LNG = -115.5971

function App() {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const clusterMarkersRef = useRef([])
  const [observations, setObservations] = useState([])
  const [daysBack, setDaysBack] = useState(30)
  const [sortBy, setSortBy] = useState('recent')
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [loading, setLoading] = useState(true)
  const listRefs = useRef([])

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [LNG, LAT],
      zoom: 13
    })
    mapRef.current = map
    return () => map.remove()
  }, [])

  useEffect(() => {
    const fetchObs = async () => {
      setLoading(true)
      const response = await fetch(
        `/ebird/v2/data/obs/geo/recent?lat=${LAT}&lng=${LNG}&dist=5&back=${daysBack}`,
        { headers: { 'X-eBirdApiToken': EBIRD_API_KEY } }
      )
      const data = await response.json()
      const indexed = data.map((obs, i) => ({ ...obs, _idx: i }))
      setObservations(indexed)
      setSelectedIdx(null)
      setLoading(false)
    }
    fetchObs()
  }, [daysBack])

  useEffect(() => {
    if (!mapRef.current || observations.length === 0) return
    const map = mapRef.current

    const addMarkers = () => {
      markersRef.current.forEach(m => m && m.remove())
      clusterMarkersRef.current.forEach(m => m && m.remove())
      markersRef.current = []
      clusterMarkersRef.current = []

      // group by exact lat/lng
      const groups = {}
      observations.forEach(obs => {
        const key = `${obs.lat},${obs.lng}`
        if (!groups[key]) groups[key] = []
        groups[key].push(obs)
      })

      // one invisible marker per observation for selection
      observations.forEach(obs => {
        const el = document.createElement('div')
        el.style.cssText = `
          width: 14px; height: 14px; border-radius: 50%;
          background: #4A90D9; border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3); cursor: pointer;
          transition: background 0.15s, transform 0.15s;
        `

        const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
          <strong>${obs.comName}</strong><br/>
          <em>${obs.sciName}</em><br/>
          Count: ${obs.howMany ?? 'not recorded'}<br/>
          Date: ${obs.obsDt}<br/>
          Location: ${obs.locName}
        `)

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([obs.lng, obs.lat])
          .setPopup(popup)
          .addTo(map)

        el.addEventListener('click', () => setSelectedIdx(obs._idx))
        markersRef.current[obs._idx] = marker
      })

      // one cluster badge per unique location with count > 1
      Object.entries(groups).forEach(([key, group]) => {
        if (group.size <= 1) return
        const [lat, lng] = key.split(',').map(Number)

        const el = document.createElement('div')
        el.style.cssText = `
          background: #2c5f2e; color: white; border-radius: 50%;
          width: 18px; height: 18px; font-size: 10px; font-weight: bold;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid white; pointer-events: none;
          transform: translate(8px, -18px);
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        `
        el.textContent = group.length

        const badge = new mapboxgl.Marker({ element: el, anchor: 'bottom-left' })
          .setLngLat([lng, lat])
          .addTo(map)

        clusterMarkersRef.current.push(badge)
      })
    }

    if (map.isStyleLoaded()) addMarkers()
    else map.on('load', addMarkers)
  }, [observations])

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((marker, idx) => {
      if (!marker) return
      const el = marker.getElement()
      if (idx === selectedIdx) {
        el.style.background = '#E8A838'
        el.style.transform = 'scale(1.8)'
        el.style.zIndex = '10'
        if (!marker.getPopup().isOpen()) marker.togglePopup()
      } else {
        el.style.background = '#4A90D9'
        el.style.transform = 'scale(1)'
        el.style.zIndex = '1'
        if (marker.getPopup().isOpen()) marker.togglePopup()
      }
    })

    if (selectedIdx !== null && observations[selectedIdx]) {
      const obs = observations[selectedIdx]
      mapRef.current.flyTo({ center: [obs.lng, obs.lat], zoom: 14, duration: 800 })
      listRefs.current[selectedIdx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedIdx])

  const sorted = [...observations].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.obsDt) - new Date(a.obsDt)
    if (sortBy === 'alpha') return a.comName.localeCompare(b.comName)
    return 0
  })

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{
        width: '300px', minWidth: '300px', height: '100%',
        display: 'flex', flexDirection: 'column',
        background: '#f8f9fa', borderRight: '1px solid #ddd', zIndex: 10
      }}>
        <div style={{ padding: '16px', background: '#2c5f2e', color: 'white' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>🏔️ Banff Bird Spotter</h1>
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.85 }}>Recent observations near Vermilion Lakes</p>
        </div>

        <div style={{ padding: '12px', borderBottom: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Time range:</label>
            <select
              value={daysBack}
              onChange={e => setDaysBack(Number(e.target.value))}
              style={{ flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.8rem' }}
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Sort by:</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.8rem' }}
            >
              <option value="recent">Most recent</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
            {loading ? 'Loading...' : `${observations.length} observations found`}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sorted.map(obs => (
            <div
              key={obs._idx}
              ref={el => listRefs.current[obs._idx] = el}
              onClick={() => setSelectedIdx(obs._idx)}
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                background: selectedIdx === obs._idx ? '#e8f4ea' : 'white',
                borderLeft: selectedIdx === obs._idx ? '4px solid #2c5f2e' : '4px solid transparent',
                transition: 'background 0.15s'
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#222' }}>{obs.comName}</div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>{obs.sciName}</div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                {obs.howMany ? `${obs.howMany} bird${obs.howMany > 1 ? 's' : ''}` : 'Count not recorded'} · {obs.obsDt.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#999', marginTop: '2px' }}>{obs.locName}</div>
            </div>
          ))}
        </div>
      </div>

      <div ref={mapContainer} style={{ flex: 1, height: '100%' }} />
    </div>
  )
}

export default App