let
  nixpkgs = fetchTarball "https://github.com/NixOS/nixpkgs/tarball/nixos-23.11";
  pkgs = import nixpkgs { config = {}; overlays = []; };
  # libspatialite in lib-path to be able to execute '.load mod_spatialite'
  lib-path = with pkgs; lib.makeLibraryPath [
    libspatialite
  ];
in

pkgs.mkShellNoCC {
  LOCALE_ARCHIVE = "${pkgs.glibcLocales}/lib/locale/locale-archive";
  packages = with pkgs; [
    bash
    # envsubst
    gettext
    # make
    gnumake
    # nproc
    coreutils
    # curl
    curlMinimal
    # SSL certificates when using --pure
    cacert
    # ogr2ogr
    gdalMinimal
    sqlite
    osmium-tool
    # OsmAndCreator
    libarchive # bsdtar to unzip stdin
    jdk17 # cannot use _headless because of libawt_xawt.so
    # mapshaper and topojson
    nodePackages.npm
    nodejs-slim_21
    # garmin styles
    git
  ];
  shellHook = ''
    export LD_LIBRARY_PATH="${lib-path}"
  '';
}
