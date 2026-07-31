let lists = [];

function init() {

    lists = JSON.parse(localStorage.getItem("lists"));

    if (!lists) {
        lists = structuredClone(DATA.defaultLists);
        localStorage.setItem("lists", JSON.stringify(lists));
    }

    renderLists();
    updateAdminButtons();
}

function renderLists() {

    const container = document.getElementById("listsContainer");

    container.innerHTML = "";

    lists.forEach((list, index) => {

        container.innerHTML += `
            <div class="pred-d">

                <a href="Lists.html?id=${list.file}" style="text-decoration:none; flex:1;">

                    <div class="pred-b">
                        <p class="pred">${list.name}</p>
                        <p class="descr">${list.description}</p>
                    </div>

                </a>

                ${adminMode ? `
                    <div class="buttons">
                        <button onclick="editList(${index})">✏️</button>
                        <button onclick="deleteList(${index})">🗑️</button>
                    </div>
                ` : ""}

            </div>
        `;

    });

}

function deleteList(index) {

    if (!confirm("Delete this list?")) return;

    localStorage.removeItem("levels_" + lists[index].file);

    lists.splice(index, 1);

    localStorage.setItem("lists", JSON.stringify(lists));

    renderLists();

}

let editingList = -1;

function editList(index) {

    editingList = index;

    document.getElementById("listName").value = lists[index].name;
    document.getElementById("listDesc").value = lists[index].description;

}

function addList() {

    const name = document.getElementById("listName").value.trim();
    const description = document.getElementById("listDesc").value.trim();

    if (name.trim() === "") return;

    if (editingList === -1) {

        const id = crypto.randomUUID();

        lists.push({
            name,
            description,
            file: id
        });

        localStorage.setItem(
            "levels_" + id,
            JSON.stringify([])
        );

    } else {

        lists[editingList].name = name;
        lists[editingList].description = description;

        editingList = -1;

    }

    localStorage.setItem("lists", JSON.stringify(lists));

    renderLists();

    document.getElementById("listName").value = "";
    document.getElementById("listDesc").value = "";

}