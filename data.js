window.DATA = {};

fetch("data.json")
    .then(r => r.json())
    .then(json => {

        window.DATA = json;

        if (typeof init === "function") {
            init();
        }

    })
    .catch(console.error);