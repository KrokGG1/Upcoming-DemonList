const main = document.getElementById("placement");
const btn1 = document.getElementById("upc-changes");
const list = document.getElementById("main-list");
const upch = document.getElementById("u-changes");

btn1.addEventListener("click", () => {
    list.classList.add("d-list");
    upch.classList.remove("d-list");
});

main.addEventListener("click", () => {
    list.classList.remove("d-list");
    upch.classList.add("d-list");
});