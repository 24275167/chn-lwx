const api = `http://localhost:3000/api`

let isDetails = false;

const itemContent = (fundraiser) => `
    <div class="item">
        <h3>${fundraiser.CAPTION}</h3>
        <p>Organizer: ${fundraiser.ORGANIZER}</p>
        <p>Category: ${fundraiser.CATEGORY_NAME}</p>
        <p>Target Funding: $${fundraiser.TARGET_FUNDING}</p>
        <p>Current Funding: $${fundraiser.CURRENT_FUNDING}</p>
        <p>City: ${fundraiser.CITY}</p>
        ${fundraiser.FUNDRAISER_ID % 2 == 0
        ? `<img src="./logo.jpg" alt="">`
        : `<img src="./banner.jpg" alt="">`
    }
        ${isDetails ? '' :
        `<a href="/fundraiser.html?id=${fundraiser.FUNDRAISER_ID}">Go to Details</a>`
    }
        <a href="/donation.html?id=${fundraiser.FUNDRAISER_ID}">
            <button class='donate'>donate</button>
        </a>
    </div>
`;
const renderFundraisers = (data) => {
    const list = document.querySelector(".list");
    list.innerHTML = ""; // 清空已有内容

    if (data.length === 0) {
        list.innerHTML = "<span class='error'>Content is empty</span>";
        return;
    }
    for (const item of data) {
        
        list.innerHTML += itemContent(item);
    }
};
function getFundraisers() {
    fetch(api+"/fundraisers")
        .then((response) => response.json())
        .then((data) => {
            renderFundraisers(data);
        });
}

function searchFundraisers() {
    const organizer = document.getElementById("organizer").value;
    const city = document.getElementById("city").value;
    const category = document.getElementById("category").value;
    if (!organizer && !city && !category) {
        alert("Search content is empty");
        return;
    }
    fetch(api+`/search?organizer=${organizer}&city=${city}&category=${category}` )
        .then((response) => response.json())
        .then((data) => {
            renderFundraisers(data);
        });
}
function renderCategories(data) {
    const category = document.getElementById("category");
    for (const item of data) {
        const option = document.createElement("option");
        option.value = item.CATEGORY_ID;
        option.textContent = item.NAME;
        category.appendChild(option);
    }
}
function getCategories() {
    fetch(api+`/categories`)
        .then((response) => response.json())
        .then((data) => {
            renderCategories(data);
        });
}
let currentFundraiserData = {}

// 2.0
function renderDonation(donations) {
    const donationBody = document.querySelector('.donationBody')
    donationBody.innerHTML = ''; // 清空当前表格
    donations.forEach(donation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${donation.DONATION_ID}</td>
            <td>${donation.GIVER}</td>
            <td>${donation.AMOUNT}</td>
            <td>${donation.DATE}</td>
            ${currentFundraiserData.CAPTION && `<td>${currentFundraiserData.CAPTION}</td>`}
        `;
        donationBody.appendChild(row);
    });
}
function getDonationList() {
    fetch(api+`/donations`)
        .then((response) => response.json())
        .then((data) => {
            renderDonation(data);
        });
}
function getDonationListById(fundraiserId) {
    fetch(api+`/donation/${fundraiserId}`)
        .then((response) => response.json())
        .then((data) => {
            renderDonation(data);
        });
}
function details() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    document.querySelector(".title").innerHTML = `Fundraiser Details  ${id}`;
    isDetails = true;
    fetch(api+`/fundraiser/${id}`)
        .then((response) => response.json())
        .then((data) => {
            renderFundraisers([data]);
        });
    getDonationListById(id)
}
function donationPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    fetch(api+`/fundraiser/${id}`)
        .then((response) => response.json())
        .then((fundraiser) => {
            currentFundraiserData = fundraiser
            document.querySelector('.details').innerHTML = `
                <h3>${fundraiser.CAPTION}</h3>
                <p>Organizer: ${fundraiser.ORGANIZER}</p>
                <p>Category: ${fundraiser.CATEGORY_NAME}</p>
                <p>Target Funding: $${fundraiser.TARGET_FUNDING}</p>
                <p>Current Funding: $${fundraiser.CURRENT_FUNDING}</p>
                <p>City: ${fundraiser.CITY}</p>
            `
        });
}
// 捐赠
function createDonation() {
    const inputs = document.querySelectorAll('.input')
    const data = { FUNDRAISER_ID: currentFundraiserData.FUNDRAISER_ID }
    for (const input of inputs) {
        if (!input.value) {
            return alert(`please input ${input.name}!`)
        }
        if (input.name === 'AMOUNT' && input.value < 5) {
            return alert(`Minimum donation is AUD 5!`)
        }
        data[input.name] = input.value
    }
    fetch(api+'/donation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(() => {
            alert(`Thank you for your donation to ${currentFundraiserData.CAPTION}`)
            window.location.reload()
        })
}