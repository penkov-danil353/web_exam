const API_ADDRESS = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
const API_KEY = "24aeb12c-d8d7-4cfb-a0c1-1765f4b8da58";

let ORDERS_DATA = [];
let ROUTES_DATA = [];


function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `${message} <button type="button" class="btn-close" 
    data-bs-dismiss="alert" aria-label="Close"></button>`;

    document.getElementById('alert-container').appendChild(alert);

    setTimeout(() => alert.remove(), 5000);
}


function deleteOrder() {
    const deleteModal = document.getElementById('deleteModal');
    url = new URL(API_ADDRESS + `/api/orders/${deleteModal.dataset.orderId}`);
    url.searchParams.set('api_key', API_KEY);
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) {
            showAlert(
                'Произошла ошибка при удалении заявки', 'danger'
            );
        } else {
            bootstrap.Modal.getInstance(deleteModal).hide();
            showAlert('Заявка успешно удалена', 'success');
            getOrders();
        }
    };
}


function getRoutes(callback) {
    url = new URL(API_ADDRESS + '/api/routes');
    url.searchParams.set('api_key', API_KEY);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) {
            showAlert(
                'Произошла ошибка при получении списка маршрутов', 'danger'
            );
        } else {
            xhr.response.forEach(route => {
                ROUTES_DATA[route.id] = route.name;
            });
            callback();
        }
    };
}


function getGuideInfo(guideId, callback) {
    url = new URL(API_ADDRESS + `/api/guides/${guideId}`);
    url.searchParams.set('api_key', API_KEY);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) {
            showAlert(
                'Произошла критическая ошибка при получении имени гида, ' +
                 'продолжение работы невозможно', 'danger'
            );
        } else {
            callback(xhr.response);
        }
    };
}

function openModalWithData(rowElement) {
    // Получение данных из data-атрибутов
    let table = document.getElementById("orderModal");
    const orderId = rowElement.dataset.orderId;
    const routeId = rowElement.dataset.routeId;
    const guideId = rowElement.dataset.guideId;
    const date = rowElement.dataset.date;
    const time = rowElement.dataset.time;
    const duration = rowElement.dataset.duration;
    const persons = rowElement.dataset.persons;
    const price = rowElement.dataset.price;
    const optionFirst = rowElement.dataset.optionFirst === 'true';
    const optionSecond = rowElement.dataset.optionSecond === 'true';

    // Заполнение данных модального окна
    document.getElementById('routeName').value = ROUTES_DATA[routeId];
    document.getElementById('dateInput').value = date;
    document.getElementById('timeInput').value = time;
    document.getElementById('durationSelect').value = duration;
    document.getElementById('peopleInput').value = persons;
    document.getElementById('option1').checked = optionFirst;
    document.getElementById('option2').checked = optionSecond;
    document.getElementById('totalCost').value = `${price}р`;

    table.dataset.orderId = orderId;
    table.dataset.routeId = routeId;
    table.dataset.guideId = guideId;

    // Получение имени гида и обновление поля
    getGuideInfo(guideId, function(response) {
        document.getElementById('guideName').value = response.name;
        table.dataset.pricePerHour = response.pricePerHour;
    });
}


function renderOrdersByPage(data, newPage) {
    let tableBody = document.getElementById("routes-table-body");
    tableBody.innerHTML = '';

    let start = (newPage - 1) * 5;
    let end = Math.min(start + 5, data.length);

    for (let i = start; i < end; i++) {
        let order = data[i];
        let row = document.createElement('tr');

        // Установка data-атрибутов для строки
        row.dataset.orderId = order.id;
        row.dataset.routeId = order.route_id;
        row.dataset.guideId = order.guide_id;
        row.dataset.date = order.date;
        row.dataset.time = order.time;
        row.dataset.persons = order.persons;
        row.dataset.duration = order.duration;
        row.dataset.price = order.price;
        row.dataset.optionFirst = order.optionFirst;
        row.dataset.optionSecond = order.optionSecond;

        // Номер заказа
        let idCell = document.createElement('td');
        idCell.textContent = i + 1;
        row.appendChild(idCell);

        // Название маршрута
        let routeNameCell = document.createElement('td');
        let routeName = ROUTES_DATA[order.route_id] || 'Неизвестный маршрут';
        routeNameCell.textContent = routeName;
        row.appendChild(routeNameCell);

        // Дата
        let dateCell = document.createElement('td');
        dateCell.textContent = order.date;
        row.appendChild(dateCell);

        // Стоимость
        let priceCell = document.createElement('td');
        priceCell.textContent = order.price;
        row.appendChild(priceCell);

        // Ячейка для кнопок
        let buttonCell = document.createElement('td');
        buttonCell.innerHTML = `
            <button type="button" class="btn btn-outline-primary btn-sm"
                onclick="openModalWithData(this.closest('tr'))"
                data-bs-toggle="modal" data-bs-target="#orderModal">
                <span class="bi bi-eye-fill"></span>
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm">
                <span class="bi bi-pencil-fill"></span>
            </button>
            <button type="button" class="btn btn-outline-danger btn-sm" 
                    onclick="openDeleteModal(${order.id})"
                    data-bs-toggle="modal" data-bs-target="#deleteModal">
                <span class="bi bi-trash-fill"></span>
            </button>
        `;
        row.appendChild(buttonCell);

        tableBody.appendChild(row);
    }
}


function changeOrdersPage(newPage) {
    renderOrdersByPage(ORDERS_DATA, newPage);
    const pageCount = Math.ceil(ORDERS_DATA.length / 5);
    renderOrdersPaginationElement(pageCount, newPage);
}

function createPageItem(page, isActive = false,
    isDisabled = false, text = page) {
    const li = document.createElement('li');
    li.className =
        `page-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`;
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#routes-list';
    a.innerHTML = text;

    if (!isDisabled) {
        a.addEventListener('click', (e) => {
            //e.preventDefault();
            changeOrdersPage(page);
        });
    }

    li.appendChild(a);
    return li;
}

function renderOrdersPaginationElement(pageCount, currentPage) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // Кнопка "Предыдущая"
    pagination.appendChild(
        createPageItem(currentPage - 1, false, currentPage === 1, '&laquo;')
    );

    // Генерация элементов страниц
    const from = Math.max(currentPage - 2, 1);
    const to = Math.min(currentPage + 2, pageCount);
    for (let i = from; i <= to; i++) {
        pagination.appendChild(createPageItem(i, i === currentPage));
    }

    // Кнопка "Следующая"
    pagination.appendChild(createPageItem(
        currentPage + 1, false, currentPage === pageCount, '&raquo;')
    );
}


function getOrders(event) {
    url = new URL(API_ADDRESS + `/api/orders`);
    url.searchParams.set('api_key', API_KEY);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) {
            showAlert('Произошла ошибка при получении списка заявок', 'danger');
        } else {
            ORDERS_DATA = xhr.response;
            console.log(xhr.response);
            changeOrdersPage(1);

        }
    };
}


function isBetween(lower, number, upper) {
    return number >= lower && number <= upper;
}

function isDayOff(date) {
    if (date.length != 10) return 0;
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        url = new URL('http://isdayoff.ru/' + date);
        url.searchParams.set('cc', 'ru');
        xhr.open('GET', url, true);

        xhr.onload = function () {
            resolve(Boolean(xhr.responseText));
        };

        xhr.onerror = function () {
            reject(new Error(`Ошибка ${xhr.status}: ${xhr.statusText}`));
        };

        xhr.send();
    });
}


async function calculatePrice() {
    let modalElement = document.getElementById('orderModal');
    let pricePerHour = modalElement.dataset.pricePerHour;

    let duration = parseInt(
        document.getElementById('durationSelect').value, 10
    );
    let peopleCount = parseInt(
        document.getElementById('peopleInput').value, 10
    );
    let dateValue = document.getElementById('dateInput').value;
    let timeValue = document.getElementById('timeInput').value;
    let dateTime = new Date(dateValue + 'T' + timeValue);

    let option1 = document.getElementById('option1').checked;
    let option2 = document.getElementById('option2').checked;

    //let dayOfWeek = dateTime.getDay(); // воскресенье - это 0. почему.
    let hour = dateTime.getHours();

    let isThisDayOff = await isDayOff(dateValue);
    let dayOffMultiplayer = isThisDayOff ? 1.5 : 1;
    //let dayOffMultiplayer = (dayOfWeek == 0 || dayOfWeek == 6) ? 1.5 : 1;

    let option1Multiplayer = option1 ? 0.75 : 1;
    if (option2) {
        if (isThisDayOff) option2Multiplayer = 1.25;
        else option2Multiplayer = 1.30;
    } else {
        option2Multiplayer = 1;
    }

    let isItMorning = (isBetween(9, hour, 13)) ? 400 : 0;
    let isItEvening = (isBetween(20, hour, 23)) ? 1000 : 0;
    if (isBetween(10, peopleCount, 20)) numberOfVisitors = 1500;
    else if (isBetween(5, peopleCount, 9)) numberOfVisitors = 1000;
    else if (isBetween(1, peopleCount, 4)) numberOfVisitors = 0;

    let totalPrice = (pricePerHour * duration * dayOffMultiplayer) 
        + isItMorning + isItEvening + numberOfVisitors;
    totalPrice = totalPrice * option1Multiplayer * option2Multiplayer;

    console.log(totalPrice);
    document.getElementById('totalCost').value = `${Math.round(totalPrice)}₽`;
}

function changeOrder(event) {
    const xhr = new XMLHttpRequest();
    const FD = new FormData();
    let orderId = document.getElementById('orderModal').dataset.orderId;
    console.log(event);
    url = new URL(API_ADDRESS + `/api/orders/${orderId}`);
    url.searchParams.set('api_key', API_KEY);

    let modalElement = document.getElementById('orderModal');
    FD.append("guide_id", modalElement.dataset.guideId);
    FD.append("route_id", modalElement.dataset.routeId);
    FD.append("date", document.getElementById('dateInput').value);
    FD.append("time", document.getElementById('timeInput').value);
    FD.append("duration", parseInt(
        document.getElementById('durationSelect').value, 10)
    );
    FD.append("persons", parseInt(
        document.getElementById('peopleInput').value, 10)
    );
    FD.append("price", parseInt(
        document.getElementById('totalCost').value, 10)
    );
    FD.append("time", document.getElementById('timeInput').value);
    FD.append("optionFirst", Number(
        document.getElementById('option1').checked)
    );
    FD.append("optionSecond", Number(
        document.getElementById('option1').checked)
    );


    xhr.open("PUT", url);
    xhr.responseType = 'json';
    xhr.send(FD);
    xhr.onload = function () {
        if (xhr.status != 200) {
            showAlert('Произошла ошибка при изменении заявки', 'danger');
        } else {
            console.log(xhr.response);
            bootstrap.Modal.getInstance(modalElement).hide();
            showAlert('Заявка успешно изменена', 'success');
        }
    };

}


function openDeleteModal(orderId) {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.dataset.orderId = orderId;
}

document.getElementById('deleteModal').querySelector('.btn-primary')
    .addEventListener('click', deleteOrder);


document.getElementById('dateInput').addEventListener('change', calculatePrice);
document.getElementById('timeInput').addEventListener('change', calculatePrice);
document.getElementById('durationSelect')
    .addEventListener('change', calculatePrice);
document.getElementById('peopleInput')
    .addEventListener('change', calculatePrice);
document.getElementById('option1').addEventListener('change', calculatePrice);
document.getElementById('option2').addEventListener('change', calculatePrice);

document.getElementById('sendForm').addEventListener("click", changeOrder);

window.onload = function () {
    getRoutes(getOrders);
};