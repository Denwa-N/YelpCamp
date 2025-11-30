maptilersdk.config.apiKey = maptilerApiKey;
// 地図は日本語にしたいので日本語の設定を入れておく
maptilersdk.config.primaryLanguage = maptilersdk.Language.JAPANESE;

const map = new maptilersdk.Map({
    container: 'map', // container ID
    style: maptilersdk.MapStyle.BRIGHT, // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

new maptilersdk.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 }).setHTML(
            `<p>${campground.title}</p><p>${campground.location}</p>`
        )
    )
    .addTo(map);