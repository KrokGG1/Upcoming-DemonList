const OWNER = "KrokGG1";
const REPO = "Upcoming-DemonList";
const BRANCH = "main";
const FILE = "data.json";

let githubSha = null;

async function loadGithubData() {

    // обычная загрузка для всех пользователей
    const response = await fetch("./data.json");

    if (!response.ok) {
    const text = await response.text();

    console.log("Status:", response.status);
    console.log("Response:", text);

    alert(text);

    return;
}

    const data = await response.json();

    return data;
}

async function saveGithubData(data) {

    const token = adminMode ? localStorage.getItem("githubToken") : null;

    if (!token) {
        alert("You are not logged in.");
        return;
    }

    if (!githubSha) {

    const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}?ref=${BRANCH}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json"
            }
        }
    );

    const file = await response.json();

    githubSha = file.sha;

}

    const content = btoa(
        unescape(
            encodeURIComponent(
                JSON.stringify(data, null, 2)
            )
        )
    ); 
    console.log({
    file: FILE,
    branch: BRANCH,
    sha: githubSha
});
    const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json"
            },
            body: JSON.stringify({
                message: "Update data.json",
                content,
                sha: githubSha,
                branch: BRANCH
            })
        }
    );

if (!response.ok) {

    const err = await response.json();

console.log(err);
alert(JSON.stringify(err, null, 2));

return;
}

    const result = await response.json();

    githubSha = result.content.sha;

    console.log("Saved!");

}

async function loadSiteData() {

    const data = await loadGithubData();

    window.DATA = data;

    return data;

}

async function syncToGithub() {

    const data = await loadGithubData();

    if (typeof levels !== "undefined") {
        data.defaultLevels = levels;
    }

    if (typeof changes !== "undefined") {
        data.defaultChanges = changes;
    }

    if (typeof lists !== "undefined") {
        data.defaultLists = lists;
    }

   if (typeof listLevels !== "undefined" && id) {
    data.listLevels[id] = listLevels;
}

    await saveGithubData(data);

}

async function loadGithubAdminData() {

    const token = localStorage.getItem("githubToken");

    if (!token) {
        throw new Error("No github token");
    }

    const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}?ref=${BRANCH}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json"
            }
        }
    );

    if (!response.ok) {
        const err = await response.json();
        console.log(err);
        throw new Error(err.message);
    }

    const file = await response.json();

    githubSha = file.sha;

    return JSON.parse(
        decodeURIComponent(
            escape(
                atob(file.content.replace(/\n/g, ""))
            )
        )
    );
}
