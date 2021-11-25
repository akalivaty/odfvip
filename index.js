// global variables
var map;
var polyline;
var markers = [];
var marker_Coordinates = [];
var infowindows = [];

// Initialize and add the map
function initMap() {

    // The location of the center of Taiwan
    const initCenter = { lat: 23.768065698804232, lng: 121.01028094595456 };
    // The map, centered at the center of Taiwan
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: initCenter,
        gestureHandling: "greedy",
    });

    polyline = new google.maps.Polyline({
        geodesic: true,
        strokeColor: '#e83f6f',
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });
    polyline.setMap(map);
}

function putUserData() {
    let username = checkInput();
    if (username != false) {
        clearMarkers();
        const url = 'https://script.google.com/macros/s/AKfycbxo-jq4E9zGVCn0HUAYEqDduHUG8ySaSizE-ZFEDwXahFOqkscKa5eVNwuSn4Ia1DynjA/exec';
        axios.get(url, {
            params: {
                method: 'read_all',
                sheetName: username
            }
        }).then(function (response) {
            let label_index = 0;
            response.data.forEach(element => {
                const latLng = new google.maps.LatLng(element.latitude, element.longitude);

                let marker = new google.maps.Marker({
                    position: latLng,
                    label: String(++label_index),
                    title: element.sentence,
                    animation: google.maps.Animation.DROP,
                    map: map,
                });
                markers.push(marker);

                let marker_coordinate = { lat: element.latitude, lng: element.longitude };
                marker_Coordinates.push(marker_coordinate);

                let infowindow = new google.maps.InfoWindow({
                    content: element.sentence,
                });
                infowindows.push(infowindow);

                marker.addListener('click', () => {
                    infowindow.open(map, marker);
                })

            });
        }).catch(function (error) {
            console.log(error);
        }).finally(function () {
            polyline = new google.maps.Polyline({
                path: marker_Coordinates,
                geodesic: true,
                strokeColor: '#e83f6f',
                strokeOpacity: 1.0,
                strokeWeight: 2,
            });
            polyline.setMap(map);
        })
    }
}

function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        if (markers[i]) {
            markers[i].setMap(null);
            markers[i] = null;
        }
    }
    polyline.setMap(null);

    markers = [];
    marker_Coordinates = []
    infowindows = [];
}

function checkInput() {
    let username = document.getElementById("user_name").value;
    if (username == "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: '請輸入使用者名稱'
        });
        return false;
    }
    else {
        return username;
    }
}

function setUser() {
    let username = checkInput();
    if (username != false) {
        const url = 'https://script.google.com/macros/s/AKfycbwiWXAQhHCY-udBIKASek5fCKLVV34STAJw8vObP4shgYrZvi3LRIaZUgG5JCy7Yb0H/exec';
        axios.get(url, { params: { method: "get_all_user" } })
            .then(response => {
                response.data.forEach(element => {
                    if (element.user == username) {
                        axios.get(url, { params: { method: "set_current_user", user: username } })
                            .then(response => {
                                if (response.data == "success") {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Good job!',
                                        text: '設定成功',
                                        showConfirmButton: false,
                                        timer: 1000
                                    });
                                }
                                else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Something wrong!',
                                        text: '請稍後再試'
                                    });
                                }
                            });
                        throw new Error("finished");
                    }
                });
            })
    }
}

function addNewUser() {
    let username = checkInput();
    let repeatUsername = false;
    if (username != false) {
        const url = 'https://script.google.com/macros/s/AKfycbwiWXAQhHCY-udBIKASek5fCKLVV34STAJw8vObP4shgYrZvi3LRIaZUgG5JCy7Yb0H/exec';
        axios.get(url, { params: { method: "get_all_user" } })
            .then(response => {
                response.data.forEach(element => {
                    if (element.user == username) {
                        repeatUsername = true;
                        let date = element.signup_time.split('T')[0];
                        let time = element.signup_time.split('T')[1].split('.')[0];
                        Swal.fire({
                            icon: 'warning',
                            title: 'Warning!',
                            text: `此使用者名稱已在 ${date} 的 ${time} 創立`
                        });
                        return;
                    }
                });
            }).then(() => {
                console.log(repeatUsername);
                if (repeatUsername == false) {
                    axios.get(url, { params: { method: "add_user", user: username } })
                        .then(response => {
                            if (response.data == "success") {
                                Swal.fire({
                                    // position: 'top-end',
                                    icon: 'success',
                                    title: 'Good job!',
                                    text: '註冊成功',
                                    showConfirmButton: false,
                                    timer: 1500
                                });
                            }
                            else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Something wrong!',
                                    text: '請稍後再試'
                                });
                            }
                        })
                }
            })
    }
}