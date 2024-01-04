const API_ADDRESS = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
const API_KEY = "24aeb12c-d8d7-4cfb-a0c1-1765f4b8da58";


function render_routes(data, page = 1) {
    let table = '';
    page = page - 1;
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
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstr