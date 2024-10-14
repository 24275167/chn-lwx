const api = `http://localhost:3000/api/`
const ajax = (method = 'GET', url, data = null) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, api + url, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.onload = () => {
            if (xhr.status == 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(`Error: ${xhr.status} - ${xhr.statusText}`));
            }
        };
        xhr.onerror = () => reject(new Error('Network Error'));
        if (data) {
            xhr.send(JSON.stringify(data));
        } else {
            xhr.send();
        }
    });
};

const request = {
    get: (url) => ajax('GET', url),
    post: (url, data) => ajax('POST', url, data),
    put: (url, data) => ajax('PUT', url, data),
    delete: (url) => ajax('DELETE', url),
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
// 填充Categories
function renderCategories(data) {
    for (const item of data) {
        const option = document.createElement('option')
        option.value = item.CATEGORY_ID
        option.textContent = item.NAME
        category.appendChild(option)
    }
}
// 获取Fundraisers列表
const fetchFundraisers = async () => {
    const data = await request.get('fundraisers'); // 替换为实际 API
    renderTable(data);
};

// 填充Fundraisers表格
const renderTable = (fundraisers) => {
    fundraiserBody.innerHTML = ''; // 清空当前表格
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
    drawer.classList.add('open'); // 显示抽屉
})

// 打开
let updateCurrentId = null;
const openDrawerForUpdate = async (id) => {
    isCreate = false
    drawerTitle.innerHTML = "Update"
    updateCurrentId = id
    const data = await request.get(`fundraiser/${id}`); // 替换为实际 API
    data.ACTIVE = Boolean(data.ACTIVE)
    for (const item of inputs) {
        if (item.type !== 'checkbox') {
            item.value = data[item.name]
        }else{
            item.checked = data[item.name]
        }
        
    }
    overlay.classList.add('open')
    drawer.classList.add('open'); // 显示抽屉
};
// 删除Fundraisers
const deleteFundraiser = async (id) => {
    const confirmDelete = window.confirm('Confirm to delete this data?')
    if (confirmDelete) {
        const data = await request.delete(`fundraiser/${id}`);
        alert(data.message)
        fetchFundraisers(); // 刷新列表
    }
};
// 添加事件
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
// 取消
function cancel() {
    updateCurrentId = null
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    for (const item of inputs) {
        if (item.type !== 'checkbox') {
            item.value = ''
        }else{
            item.checked = false
        }
    }
}
drawerClose.addEventListener('click', cancel);

// 保存新的Fundraisers
drawerConfirm.addEventListener('click', async () => {
    const data = {}
    for (const item of inputs) {
        if (item.type !== 'checkbox') {
            if (!item.value && item.name != 'CURRENT_FUNDING') {
                return alert(`${item.name} cannot be empty !`)
            }
            data[item.name] =  item.value
        }else{
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
    fetchFundraisers(); // 刷新列表
    cancel()
});








request.get('categories').then(data => {
    categories = data
    // 初始化获取Fundraisers列表
    fetchFundraisers();
    renderCategories(data)
})