/* eslint-disable max-len */
const API_ADDRESS = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
const API_KEY = "24aeb12c-d8d7-4cfb-a0c1-1765f4b8da58";

let ACTIVE_PAGE = 1;
let ROUTES_DATA = [];


function shortenText(text) {
    let firstPeriodIndex = text.indexOf('.');
    let firstSentence = firstPeriodIndex !== -1 ? text.substring(0, firstPeriodIndex + 1) : text;
    let words = firstSentence.split(/\s+/);

    if (words.length > 10) {
        return words.slice(0, 10).join(' ') + '...';
    }
    
    return firstSentence;
}


function createPageItem(page, isActive = false, isDisabled = false, text = page) {
    return `
        <li class="page-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}">
            <a class="page-link" href="#routes-list" onclick="changePage(${page})">${text}</a>
        </li>`;
}

function renderRoutesPaginationElement(elemsCount) {
    maxPage = Math.ceil(elemsCount / 10);
    // Создание кнопки "Предыдущая"
    let prevPage = '';
    if (ACTIVE_PAGE === 1) {
        prevPage = createPageItem(1, false, true, '&laquo;');
    } else {
        prevPage = createPageItem(ACTIVE_PAGE - 1, false, false, '&laquo;');
    }

    // Создание кнопки "Следующая"
    let nextPage = '';
    if (ACTIVE_PAGE === maxPage) {
        nextPage = createPageItem(maxPage, false, true, '&raquo;');
    } else {
        nextPage = createPageItem(ACTIVE_PAGE + 1, false, false, '&raquo;');
    }

    // Генерация элементов страниц
    let pagesHTML = '';
    const start = Math.max(ACTIVE_PAGE - 2, 1);
    const end = Math.min(ACTIVE_PAGE + 2, maxPage);
    for (let i = start; i <= end; i++) {
        pagesHTML += createPageItem(i, i === ACTIVE_PAGE);
    }

    // Объединение всех элементов в один HTML
    const paginationHTML = `<ul class="pagination">${prevPage}${pagesHTML}${nextPage}</ul>`;

    document.getElementById('pagination').innerHTML = paginationHTML;
}

function renderRoutes(data) {
    let table = '';
    page = ACTIVE_PAGE - 1;
    let start = page * 10;
    let end = (start + 10 < data.length) ? start + 10 : data.length;

    for (let i = start; i < end; i++) {
        let shortDescription = shortenText(data[i].description);
        let shortMainObject = shortenText(data[i].mainObject);
        table +=
            `<tr>
            <th scope="row">${data[i].name}</th>
            <td><span data-bs-toggle="tooltip" data-bs-placement="top" title="${data[i].description}">${shortDescription}</span></td>
            <td><span data-bs-toggle="tooltip" data-bs-placement="top" title="${data[i].mainObject}">${shortMainObject}</span></td>
            <td><button>Выбрать</button></td>
        </tr>`;
    }
    document.getElementById("routes-table-body").innerHTML = table;

    // Активация tooltip
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function changeRoutesPage(newPage) {
    ACTIVE_PAGE = newPage;
    renderRoutes(ROUTES_DATA);
    renderRoutesPaginationElement(ROUTES_DATA.length);
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
        } else {
            ROUTES_DATA = xhr.response;
            changeRoutesPage(1);
        }
    };
}

window.onload = getRoutes;