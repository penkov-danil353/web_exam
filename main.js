const API_ADDRESS = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
const API_KEY = "24aeb12c-d8d7-4cfb-a0c1-1765f4b8da58";

let ROUTES_DATA = [];
let FILTERED_ROUTES_DATA = [];
let GUIDES_DATA = [];


function shortenText(text) {
    let firstPeriodIndex = text.indexOf('.');
    if (firstPeriodIndex !== -1) {
        firstSentence = text.substring(0, firstPeriodIndex + 1);
    } else {
        firstSentence = text;
    }
    let words = firstSentence.split(/\s+/);

    if (words.length > 10) {
        return words.slice(0, 10).join(' ') + '...';
    }

    return firstSentence;
}

function parseItems(inputString) {
    const numberedPattern = /\d+\./; // Нумерованный список (например, "1.")
    const commaOrDashPattern = /,|\s*–\s*/; // Запятая или дефис

    let items = []; // Массив для хранения результатов

    // Проверяем, содержит ли строка нумерованный список
    if (numberedPattern.test(inputString)) {
        // Разбиваем строку по нумерованному формату
        items = inputString.split(numberedPattern);
    } else {
        // Иначе разбиваем строку по запятой или дефису
        items = inputString.split(commaOrDashPattern);
    }

    // Фильтруем массив, удаляя пустые строки и обрезая пробелы
    return items.filter(item => item.trim() !== "").map(item => item.trim());
}


function extractMainObjects(routesData) {
    const allMainObjects = routesData.map(
        route => parseItems(route.mainObject)
    );
    const uniqueMainObjects = new Set(allMainObjects.flat());
    return uniqueMainObjects;
}

function filterByMainObject(event) {
    const selectedObject = event.target.value;
    FILTERED_ROUTES_DATA = selectedObject ?
        ROUTES_DATA.filter(route => route.mainObject.includes(selectedObject)) :
        [...ROUTES_DATA];
    changeRoutesPage(1);
}


function createDropdown(mainObjects) {
    const dropdown = document.getElementById('mainObjectDropdown');
    mainObjects.forEach(object => {
        const option = document.createElement('option');
        option.value = object;
        option.textContent = object;
        dropdown.appendChild(option);
    });
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `${message} <button type="button" class="btn-close" 
    data-bs-dismiss="alert" aria-label="Close"></button>`;

    document.getElementById('alert-container').appendChild(alert);

    setTimeout(() => alert.remove(), 5000);
}


function renderRoutesByPage(data, newPage) {
    let tableBody = document.getElementById("routes-table-body");
    tableBody.innerHTML = '';

    let start = (newPage - 1) * 10;
    let end = Math.min(start + 10, data.length);

    for (let i = start; i < end; i++) {
        let row = document.createElement('tr');

        // Создание ячейки для названия маршрута
        let nameCell = document.createElement('th');
        nameCell.scope = 'row';
        nameCell.textContent = data[i].name;
        row.appendChild(nameCell);

        // Ячейка с описанием
        let descriptionCell = document.createElement('td');
        let shortDescription = shortenText(data[i].description);
        let descriptionSpan = document.createElement('span');
        descriptionSpan.setAttribute('data-bs-toggle', 'tooltip');
        descriptionSpan.setAttribute('data-bs-placement', 'top');
        descriptionSpan.title = data[i].description;
        descriptionSpan.textContent = shortDescription;
        descriptionCell.appendChild(descriptionSpan);
        row.appendChild(descriptionCell);

        // Ячейка с главным объектом
        let mainObjectCell = document.createElement('td');
        let shortMainObject = shortenText(data[i].mainObject);
        let mainObjectSpan = document.createElement('span');
        mainObjectSpan.setAttribute('data-bs-toggle', 'tooltip');
        mainObjectSpan.setAttribute('data-bs-placement', 'top');
        mainObjectSpan.title = data[i].mainObject;
        mainObjectSpan.textContent = shortMainObject;
        mainObjectCell.appendChild(mainObjectSpan);
        row.appendChild(mainObjectCell);

        // Создание ячейки с кнопкой
        let buttonCell = document.createElement('td');
        let button = document.createElement('button');
        button.className = 'btn btn-success';
        button.textContent = 'Выбрать';
        button.dataset.routeId = data[i].id;
        button.dataset.routeName = data[i].name;
        button.addEventListener('click', getGuides);
        buttonCell.appendChild(button);
        row.appendChild(buttonCell);

        tableBody.appendChild(row);
    }

    // Активация tooltip
    const tooltipTriggerList = document
        .querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList]
        .map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}


function createPageItem(page, isActive = false, 
    isDisabled = false, text = page) {
    const li = document.createElement('li');
    li.className = `page-item ${isActive ? 'active' : ''} 
    ${isDisabled ? 'disabled' : ''}`;
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#routes-list';
    a.innerHTML = text;

    if (!isDisabled) {
        a.addEventListener('click', (e) => {
            //e.preventDefault();
            changeRoutesPage(page);
        });
    }

    li.appendChild(a);
    return li;
}

function renderRoutesPaginationElement(pageCount, currentPage) {
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
    pagination.appendChild(
        createPageItem(currentPage + 1, false, 
            currentPage === pageCount, '&raquo;')
    );
}

function changeRoutesPage(newPage) {
    renderRoutesByPage(FILTERED_ROUTES_DATA, newPage);
    const pageCount = Math.ceil(FILTERED_ROUTES_DATA.length / 10);
    renderRoutesPaginationElement(pageCount, newPage);
}


function searchRoutes(e) {
    const searchText = e.target.value.toLowerCase();
    FILTERED_ROUTES_DATA = searchText ? 
        ROUTES_DATA.filter(
            route => route.name.toLowerCase().includes(searchText))
        : ROUTES_DATA;
    changeRoutesPage(1);
}


function getRoutes() {
    url = new URL(API_ADDRESS + '/api/routes');
    url.searchParams.set('api_key', API_KEY);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) {
            alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
            showAlert(
                'Произошла ошибка при получении списка маршрутов', 'danger'
            );
        } else {
            ROUTES_DATA = xhr.response;
            FILTERED_ROUTES_DATA = [...ROUTES_DATA];
            const mainObjects = extractMainObjects(ROUTES_DATA);
            createDropdown(mainObjects);
            changeRoutesPage(1);
        }
    };
}


function pluralizeYears(n) {
    let res;
    let forms = ['год', 'года', 'лет'];
    let n_last2 = n % 100;
    let n_last1 = n % 10;

    if (n_last2 > 10 && n_last2 < 15) res = forms[2];
    else if (n_last1 == 1) res = forms[0];
    else if (n_last1 > 1 && n_last1 < 5) res = forms[1];
    else res = forms[2];

    return `${n} ${res}`;
}

function prepareForm() {
    var modalTriggerButton = 
        document.querySelector("[data-bs-target='#orderModal']");
    var routeId = modalTriggerButton.dataset.routeId;
    var routeName = modalTriggerButton.dataset.routeName;
    var guideId = modalTriggerButton.dataset.guideId;
    var guideName = modalTriggerButton.dataset.guideName;
    var pricePerHour = modalTriggerButton.dataset.pricePerHour;
    document.getElementById("guideName").value = guideName;
    document.getElementById("routeName").value = routeName;

    var modalElement = document.getElementById('orderModal');
    
    modalElement.dataset.routeId = routeId;
    modalElement.dataset.guideId = guideId;
    modalElement.dataset.pricePerHour = pricePerHour;
    document.getElementById("guideName").value = guideName;
    document.getElementById("routeName").value = routeName;

    // установить следующий день
    var dateInput = document.getElementById('dateInput');
    var today = new Date();
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    var dd = String(tomorrow.getDate()).padStart(2, '0');
    var mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    var yyyy = tomorrow.getFullYear();
    tomorrow = yyyy + '-' + mm + '-' + dd;
    dateInput.value = tomorrow;
}

function renderBuyButton(event) {
    const button = event.target;

    const buyButton = document.createElement('button');
    buyButton.type = 'button';
    buyButton.className = 'btn btn-success';
    buyButton.textContent = 'Оформить заявку';
    buyButton.dataset.routeId = button.dataset.routeId;
    buyButton.dataset.routeName = button.dataset.routeName;
    buyButton.dataset.guideId = button.dataset.guideId;
    buyButton.dataset.guideName = button.dataset.guideName;
    buyButton.dataset.pricePerHour = button.dataset.pricePerHour;
    buyButton.dataset.bsToggle = 'modal';
    buyButton.dataset.bsTarget = '#orderModal';
    buyButton.addEventListener('click', prepareForm);

    const container = document.getElementById("buyContainer");
    container.innerHTML = '';
    container.appendChild(buyButton);
    container.scrollIntoView({ behavior: 'smooth' });
}


function renderGuides(data, routeId, routeName) {
    let tableBody = document.getElementById("guides-table-body");
    tableBody.innerHTML = ''; // Очистить текущее содержимое таблицы

    data.forEach(guide => {
        let row = document.createElement('tr');

        // Создание ячейки с изображением
        let imageCell = document.createElement('td');
        let image = document.createElement('img');
        image.src = "img/guideIcon.png";
        image.className = "img";
        image.width = 50;
        imageCell.appendChild(image);
        row.appendChild(imageCell);

        // Добавление имени гида
        let nameCell = document.createElement('td');
        nameCell.textContent = guide.name;
        row.appendChild(nameCell);

        // Добавление языка гида
        let languageCell = document.createElement('td');
        languageCell.textContent = guide.language;
        row.appendChild(languageCell);

        // Добавление опыта работы
        let experienceCell = document.createElement('td');
        experienceCell.textContent = pluralizeYears(guide.workExperience);
        row.appendChild(experienceCell);

        // Добавление стоимости услуг
        let priceCell = document.createElement('td');
        priceCell.textContent = `${guide.pricePerHour}₽/час`;
        row.appendChild(priceCell);

        // Создание ячейки с кнопкой
        let buttonCell = document.createElement('td');
        let button = document.createElement('button');
        button.className = 'btn btn-success';
        button.textContent = 'Выбрать';
        button.dataset.routeId = routeId;
        button.dataset.routeName = routeName;
        button.dataset.guideId = guide.id;
        button.dataset.guideName = guide.name;
        button.dataset.pricePerHour = guide.pricePerHour;
        button.addEventListener('click', renderBuyButton);

        buttonCell.appendChild(button);
        row.appendChild(buttonCell);
        tableBody.appendChild(row);
    });

    let guidesList = document.getElementById('guides-list');
    if (guidesList.classList.contains('d-none')) {
        guidesList.classList.remove('d-none');
    }
    guidesList.scrollIntoView({ behavior: 'smooth' });
}

function clearTableHighlight() {
    const rows = document.querySelectorAll('#routes-table-body tr');
    rows.forEach(row => {
        row.classList.remove('bg-success'); // Удаляем класс у всех строк
    });
}


function getGuides(event) {
    const button = event.target;
    const routeId = button.dataset.routeId;
    const routeName = button.dataset.routeName;

    let text = `Доступные гиды по маршруту «${routeName}»`;
    document.getElementById("guides-text").innerHTML = text;

    url = new URL(API_ADDRESS + `/api/routes/${routeId}/guides`);
    url.searchParams.set('api_key', API_KEY);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) {
            //alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
            showAlert('Произошла ошибка при получении списка гидов', 'danger');
        } else {
            // Сброс выделения всех строк перед выделением новой
            clearTableHighlight();

            // Выделяем строку, на кнопку которой нажали
            const tableRow = button.parentNode.parentNode;
            tableRow.classList.add('table-success');

            GUIDES_DATA = xhr.response;
            renderGuides(xhr.response, routeId, routeName);
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

    document.getElementById('totalCost').value = `${Math.round(totalPrice)}₽`;
}

function createOrder(event) {
    const xhr = new XMLHttpRequest();
    const FD = new FormData();
    url = new URL(API_ADDRESS + '/api/orders');
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


    xhr.open("POST", url);
    xhr.responseType = 'json';
    xhr.send(FD);
    xhr.onload = function () {
        if (xhr.status != 200) {
            //alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
            showAlert('Произошла ошибка при создании заявки', 'danger');
        } else {
            console.log(xhr.response);
            bootstrap.Modal.getInstance(modalElement).hide();
            showAlert('Заявка успешно создана', 'success');
        }
    };

}

function filterGuides(data) {
    const selectedLanguage = document.getElementById('languageFilter').value;
    const experienceFrom = document.getElementById('experienceFrom').value;
    const experienceTo = document.getElementById('experienceTo').value;

    return data.filter(guide => {
        const languageMatch = 
            selectedLanguage ? guide.language === selectedLanguage : true;
        const experienceMatch = guide.workExperience >= (experienceFrom || 0) &&
            guide.workExperience <= (experienceTo || Infinity);
        return languageMatch && experienceMatch;
    });
}

function applyFilters() {
    // Вызовите здесь функцию getGuides или renderGuides с фильтрацией данных
    // Для примера предполагаем, что данные гидов хранятся в переменной guidesData
    renderGuides(filterGuides(GUIDES_DATA), currentRouteId, currentRouteName);
}

document.getElementById('languageFilter')
    .addEventListener('change', applyFilters);
document.getElementById('experienceFrom')
    .addEventListener('input', applyFilters);
document.getElementById('experienceTo')
    .addEventListener('input', applyFilters);


document.getElementById('mainObjectDropdown')
    .addEventListener('change', filterByMainObject);
document.getElementById('searchInput').addEventListener('input', searchRoutes);

document.getElementById('dateInput').addEventListener('change', calculatePrice);
document.getElementById('timeInput').addEventListener('change', calculatePrice);
document.getElementById('durationSelect')
    .addEventListener('change', calculatePrice);
document.getElementById('peopleInput')
    .addEventListener('change', calculatePrice);
document.getElementById('option1').addEventListener('change', calculatePrice);
document.getElementById('option2').addEventListener('change', calculatePrice);
document.getElementById('sendForm').addEventListener("click", createOrder);

window.onload = getRoutes;