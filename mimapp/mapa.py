import osmnx as ox
import folium
from shapely.geometry import Polygon

# 1. Configurar la ubicación (Santa Fe, Argentina)
place_name = "Santa Fe, Argentina"

# 2. Obtener el mapa base de calles de Santa Fe
# Esto replica la base del Google My Maps usando OpenStreetMap
graph = ox.graph_from_place(place_name, network_type='drive')
nodes, edges = ox.graph_to_gdfs(graph)

# 3. Simular los datos de la EPE (Cuadrante de corte)
# Supongamos que la EPE informa un corte entre 4 calles. 
# Debes obtener las coordenadas de esas esquinas.
# Ejemplo: Un cuadrante cerca del centro de Santa Fe
lat_puntos = [-31.635, -31.635, -31.645, -31.645] 
lon_puntos = [-60.700, -60.715, -60.715, -60.700]
poligono_corte = Polygon(zip(lon_puntos, lat_puntos))

# 4. Crear el mapa interactivo (como el My Maps)
m = folium.Map(location=[-31.6333, -60.7], zoom_start=13)

# 5. Dibujar el cuadrante de corte de la EPE
folium.Polygon(
    locations=[(lat, lon) for lat, lon in zip(lat_puntos, lon_puntos)],
    color='red',
    fill=True,
    fill_color='red',
    fill_opacity=0.4,
    popup="Zona de Corte Programado - EPE"
).add_to(m)

# 6. (Opcional) Cargar los barrios de Santa Fe desde OSM
barrios = ox.geometries_from_place(place_name, tags={'boundary': 'administrative', 'admin_level': '10'})
folium.GeoJson(barrios).add_to(m)

# Guardar el mapa
m.save("mapa_cortes_santa_fe.html")
print("El mapa ha sido generado como 'mapa_cortes_santa_fe.html'")