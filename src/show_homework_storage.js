// show_homework_storage.js
// Show homeworks from browser


/* main */
(() => {
    setTextLanguage()
    injectAssignmentTable()
})()

function getLanguage() {
    const LOGOUT_TEXT = document.querySelector("#form-id > div > ul > li.logoutButtonFrame > a").textContent
    return LOGOUT_TEXT.includes("Logout") ? "English" : "日本語"
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
        //return "/lms/img/cs/icon2b.gif"
        return "/lms/img/pc/material_report_S.png"
    }
    else if (hw_name.includes("ANK")) {
        //return "/lms/img/cs/icon7b.gif"
        return "/lms/img/pc/material_questionnaire_S.png"
    }
    else if (hw_name.includes("TES")) {
        //return "/lms/img/cs/icon3b.gif"
        return "/lms/img/pc/material_exam_S.png"
    }
    else {
        //return "/lms/img/cs/icon5b.gif"
        return "/lms/img/pc/material_study-materials_S.png"
    }
}

function injectAssignmentTable() {
    const DISPLAY_LIMIT_DAYS = 21
    const GAS_TASKAPI_URL = 'https://script.google.com/macros/s/AKfycbxOkCMKIeXHZPxkVHZbQDlU6ezRRljwJdypjI9B4qA2l3oZqfgtxOzDr6jY1PoN9rTa6Q/exec'
    let inDleftCnt = 0

    chrome.storage.sync.get(null, (data) => {
        assignments = Object.values(data)
        // Cannot sort items outside chrome.storage.sync.get
        assignments.sort((a, b) => new Date(a['due']) - new Date(b['due']))


        let listBlockElem = document.createElement('div')
        listBlockElem.id = 'list_block'
        listBlockElem.style = 'box-sizing: border-box; height: 100%; max-height: 15rem; overflow-y: auto'

        let tableElem = document.createElement('table')
        tableElem.className = 'cs_table2'

        let tbody = document.createElement('tbody')
        let columns = document.createElement('tr')
        columns.innerHTML = `
        <th width="20%">${LECTURE_TXT}</th>
        <th width="37%">${ASSIGNMENT_TXT}</th>
        <th width="12%">${DEADLINE_TXT}</th>
        <th width="10%">${ACTION_TXT}</th>
      </tr>
        `

        tbody.appendChild(columns)

        for (const assignment of assignments) {
            //separated evaluation of visibility and date left
            if (assignment['isVisible']) {
                let daysLeft;
                if (!assignment['due']) {
                    daysLeft = (new Date(assignment['due']) - new Date()) / 86400000
                    if (daysLeft >= DISPLAY_LIMIT_DAYS) continue
                }
                inDleftCnt++
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
                if (assignment['due']) {
                    linkElem.href = `${GAS_TASKAPI_URL}?language=${getLanguage()}&subject=${getLanguage() === '日本語' ? assignment['subject_ja'] : assignment['subject_en']}&name=${assignment['name']}&due=${new Date(new Date(assignment['due']).getTime() - new Date(assignment['due']).getTimezoneOffset() * 60 * 1000).toJSON()}&id=${assignment['id']}`
                    linkElem.innerText = new Date(assignment['due']).toLocaleString('ja-JP')
                    if (daysLeft < 0) {
                        linkElem.style = 'color: gray'
                    } else if (daysLeft < 1) {
                        linkElem.style = 'color: red'
                    } else if (daysLeft < 2) {
                        linkElem.style = 'color: #F6AA00'
                    }
                } else {
                    linkElem.href = `${GAS_TASKAPI_URL}?language=${getLanguage()}&subject=${getLanguage() === '日本語' ? assignment['subject_ja'] : assignment['subject_en']}&name=${assignment['name']}&due=&id=${assignment['id']}`
                    linkElem.innerText = '-'
                }
                linkElem.target = '_blank'
                linkElem.rel = 'noopener nonreferrer'
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
        listBlockElem.style.marginBottom = '2rem'

        let mainElem = document.querySelector('form#homeHomlForm')
        mainElem.prepend(listBlockElem)

        let bannerElem = document.createElement('div')
        bannerElem.innerText = ' ' + ASSIGNMENTS_TXT + ': ' + inDleftCnt + '  (+' + (assignments.length - inDleftCnt) + ')'
        bannerElem.style = 'font-weight: bold'
        bannerElem.className = 'cpLabel blue'
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