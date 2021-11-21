// show_homework_storage.js
// Show homeworks from browser


/* main */
(() => {
    setTextLanguage()
    injectAssignmentTable()
})()

function getLanguage() {
    return document.querySelector("#langList > option[selected]").textContent
}

function setTextLanguage() {
    LANGUAGE = getLanguage()
    if (LANGUAGE == '日本語') {
        ASSIGNMENTS_TXT = '課題'
        LECTURE_TXT = '講義名'
        ASSIGNMENT_TXT = '課題名'
        DEADLINE_TXT = '提出期限'
        ACTION_TXT = '操作'
        REMOVE_TXT = '削除'
        WELLDONE_TXT = 'おめでとう！'
    } else {
        ASSIGNMENTS_TXT = 'Assignments'
        LECTURE_TXT = 'Lecture'
        ASSIGNMENT_TXT = 'Assignment'
        DEADLINE_TXT = 'DEADLINE'
        ACTION_TXT = 'Action'
        REMOVE_TXT = 'Remove'
        WELLDONE_TXT = 'Well done!'
    }
}

function getAssignmentsFromStorage() {
    let assignments = []

    return assignments
}

function getIconURLFromID(hw_name) {
    if (hw_name.includes("REP")) {
        return "/lms/img/cs/icon2b.gif"
    }
    else if (hw_name.includes("ANK")) {
        return "/lms/img/cs/icon7b.gif"
    }
    else if (hw_name.includes("TES")) {
        return "/lms/img/cs/icon3b.gif"
    }
    else {
        return "/lms/img/cs/icon5b.gif"
    }
}

function injectAssignmentTable() {
    const DISPLAY_LIMIT_DAYS = 21
    const GAS_TASKAPI_URL = 'https://script.google.com/macros/s/AKfycbyjshv1r5iPwAEFKwP_70gWM52JWWKx9n-KMYje8fWByTpD18HGvDJ5yrn802j6A48BWw/exec'

    chrome.storage.sync.get(null, (data) => {
        assignments = Object.values(data)
        // Cannot sort items outside chrome.storage.sync.get
        assignments.sort((a, b) => new Date(a['due']) - new Date(b['due']))

        let bannerElem = document.createElement('div')
        bannerElem.id = 'title'
        bannerElem.innerHTML = `<h2>${ASSIGNMENTS_TXT}</h2>`

        let listBlockElem = document.createElement('div')
        listBlockElem.id = 'list_block'

        let tableElem = document.createElement('table')
        tableElem.border = '0'
        tableElem.cellPadding = '0'
        tableElem.cellSpacing = '0'
        tableElem.className = 'cs_table2'

        let tbody = document.createElement('tbody')
        let columns = document.createElement('tr')
        columns.innerHTML = `
        <th width="20%">${LECTURE_TXT}</th>
        <th width="37%">${ASSIGNMENT_TXT}</th>
        <th width="10%">${DEADLINE_TXT}</th>
        <th width="10%">${ACTION_TXT}</th>
      </tr>
        `

        tbody.appendChild(columns)

        for (const assignment of assignments) {
            let daysLeft = (new Date(assignment['due']) - new Date()) / 86400000
            if (daysLeft < DISPLAY_LIMIT_DAYS && assignment['isVisible']) {
                // subject, name, due, remove
                let record = document.createElement('tr')

                //subject
                let subjectColumn = document.createElement('td')

                let subjectElem = document.createElement('p')
                console.log(assignment)
                subjectElem.innerText = getLanguage() == 'English' ? assignment['subject_en'] : assignment['subject_ja']

                subjectColumn.appendChild(subjectElem)

                // name
                let nameColumn = document.createElement('td')

                let iconElem = document.createElement('img')
                iconElem.src = getIconURLFromID(assignment['id'])
                let nameElem = document.createElement('p')
                nameElem.innerText = assignment.name
                nameElem.prepend(iconElem)

                nameColumn.appendChild(nameElem)

                // due
                let dueColumn = document.createElement('td')
                dueColumn.align = 'center'

                let linkElem = document.createElement('a')
                // linkElem.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${getLanguage() == 'English' ? `${assignment['subject_en']} Assignment` : `${assignment['subject_ja']} 課題` }&details=${assignment['name'] + ' ' + assignment['id'].substring(0, 3)}&dates=${getNowYMDStr(new Date(assignment['due']))}/${getNowYMDStr(new Date(new Date(assignment['due']).getTime() + 86400000))}`
                linkElem.href = `${GAS_TASKAPI_URL}?language=${getLanguage()}&subject=${getLanguage() == '日本語' ? assignment['subject_ja'] : assignment['subject_en']}&name=${assignment['name']}&due=${assignment['due']}&id=${assignment['id']}`
                linkElem.target = '_blank'
                linkElem.rel = 'noopener nonreferrer'
                linkElem.innerText = new Date(assignment['due']).toLocaleDateString()

                dueColumn.appendChild(linkElem)


                // remove
                let removeColumn = document.createElement('td')
                removeColumn.align = 'center'

                let removeButton = document.createElement('button')
                removeButton.innerText = REMOVE_TXT
                removeButton.addEventListener('click', () => {
                    chrome.storage.sync.remove(assignment['id'], () => {
                        removeButton.parentElement.innerHTML = `<p>${WELLDONE_TXT}</p>`
                    })
                })
                removeColumn.appendChild(removeButton)


                record.appendChild(subjectColumn)
                record.appendChild(nameColumn)
                record.appendChild(dueColumn)
                record.appendChild(removeColumn)

                tbody.append(record)
            }
        }

        tableElem.appendChild(tbody)
        listBlockElem.appendChild(tableElem)
        listBlockElem.style = 'margin-bottom: 10px;'

        let mainElem = document.querySelector('div#main')
        mainElem.prepend(listBlockElem)
        mainElem.prepend(bannerElem)
    })
}

var target = document.querySelector('div#main')

function getNowYMDStr(date) {
    const Y = date.getFullYear()
    const M = ("00" + (date.getMonth() + 1)).slice(-2)
    const D = ("00" + date.getDate()).slice(-2)

    return Y + M + D
}