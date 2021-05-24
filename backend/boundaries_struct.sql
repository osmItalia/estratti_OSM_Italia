-- Name: boundaries; Type: TABLE; Schema: public; Owner: OSM; Tablespace: 
--

CREATE TABLE public.boundaries (
	id serial,
	date date,
	flag boolean DEFAULT FALSE,
	id_osm bigint,
	id_adm smallint,
	id_parent bigint,
	istat character varying(8) DEFAULT '000000',
	name character varying(128),
	short_name character(3),
	geojson text,
	poly text,
	geom public.geometry(MultiPolygon,3857),
	bbox public.geometry(Polygon,4326)
);

ALTER TABLE public.boundaries OWNER TO "osm";

CREATE UNIQUE INDEX boundaries_id_osm_idx ON boundaries (id_osm);

