const api = `http://localhost:3000/api/`
const request = {
    get: (url) => fetch(api + url, { method: 'GET' }).then(data=>data.json()),
    post: (url, data) => fetch(api + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(data=>data.json()),
    put: (url, data) => fetch(api + url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(data=>data.json()),
    delete: (url) => fetch(api + url, { method: 'DELETE' }).then(data=>data.json()),
};





let categories = []

const create = document.getElementById('create')
const drawerTitle = document.getElementById('drawerTitle')

const form = document.getElementById('form')
const inputs = form.querySelectorAll('.input')
const category = document.getElementById('category')
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay')
const drawerClose = document.getElementById('drawerClose');
const fundraiserBody = document.getElementById('fundraiserBody');
const drawerConfirm = document.getElementById('drawerConfirm');
function renderCategories(data) {
    for (const item of data) {
        const option = document.createElement('option')
        option.value = item.CATEGORY_ID
        option.textContent = item.NAME
        category.appendChild(option)
    }
}

const fetchFundraisers = async () => {
    const data = await request.get('fundraisers');
    renderTable(data);
};


const renderTable = (fundraisers) => {
    fundraiserBody.innerHTML = ''; 
    fundraisers.forEach(fundraiser => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fundraiser.FUNDRAISER_ID}</td>
            <td>${fundraiser.ORGANIZER}</td>
            <td>${fundraiser.CAPTION}</td>
            <td>${fundraiser.CATEGORY_NAME}</td>
            <td>${fundraiser.CITY}</td>
            <td>$${fundraiser.TARGET_FUNDING}</td>
            <td>$${fundraiser.CURRENT_FUNDING}</td>
            <td>
                <button class="update btn-primary" data-id="${fundraiser.FUNDRAISER_ID}">edit</button>
                <button class="delete" data-id="${fundraiser.FUNDRAISER_ID}">delete</button>
            </td>
        `;
        fundraiserBody.appendChild(row);
    });
    addEventListeners();
};

let isCreate = true
create.addEventListener('click', async function () {
    isCreate = true
    drawerTitle.innerHTML = "Create"
    overlay.classList.add('open')
    drawer.classList.add('open'); 
})


let updateCurrentId = null;
const openDrawerForUpdate = async (id) => {
    isCreate = false
    drawerTitle.innerHTML = "Update"
    updateCurrentId = id
    const data = await request.get(`fundraiser/${id}`); 
    data.ACTIVE = Boolean(data.ACTIVE)
    for (const item of inputs) {
        if (item.type !== 'checkbox') {
            item.value = data[item.name]
        } else {
            item.checked = data[item.name]
        }

    }
    overlay.classList.add('open')
    drawer.classList.add('open'); 
};

const deleteFundraiser = async (id) => {
    const confirmDelete = window.confirm('Confirm to delete this data?')
    if (confirmDelete) {
        const data = await request.delete(`fundraiser/${id}`);
        alert(data.message)
        fetchFundraisers(); 
    }
};

const addEventListeners = () => {
    const updateButtons = document.querySelectorAll('.update');
    const deleteButtons = document.querySelectorAll('.delete');
    updateButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            openDrawerForUpdate(id);
        });
    });
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            deleteFundraiser(id);
        });
    });
};

function cancel() {
    updateCurrentId = null
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    for (const item of inputs) {
        if (item.type !== 'checkbox') {
            item.value = ''
        } else {
            item.checked = false
        }
    }
}
drawerClose.addEventListener('click', cancel);

drawerConfirm.addEventListener('click', async () => {
    const data = {}
    for (const item of inputs) {
        if (item.type !== 'checkbox') {
            if (!item.value && item.name != 'CURRENT_FUNDING') {
                return alert(`${item.name} cannot be empty !`)
            }
            data[item.name] = item.value
        } else {
            data[item.name] = Number(item.checked)
        }
    }
    data['CURRENT_FUNDING'] = Number(data['CURRENT_FUNDING'])
    if (isCreate) {
        await request.post(`fundraiser`, data);
        alert('create success')
    } else {
        await request.put(`fundraiser/${updateCurrentId}`, data);
        alert('update success')
    }
    fetchFundraisers(); 
    cancel()
});








request.get('categories').then(data => {
    categories = data
    fetchFundraisers();
    renderCategories(data)
})
