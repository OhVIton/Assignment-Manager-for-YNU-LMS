(async () => {
    setTextLanguage()
    injectAssignmentTable()

})()


function setTextLanguage() {
    let LANGUAGE = getLanguage()
    if (LANGUAGE == 'English') {
        CLEAR_TXT = 'Clear all assignments'
        SUBJECT_TXT = 'Lecture'
        ASSIGNMENT_FOR_THIS_LECTURE_TXT = 'Assignments'
        ASSIGNMENT_TXT = 'Assignment'
        DEADLINE_TXT = 'DEADLINE'
        SHOW_TXT = '表示'
    } else {
        CLEAR_TXT = '課題全消去'
        SUBJECT_TXT = '講義'
        ASSIGNMENT_FOR_THIS_LECTURE_TXT = '課題'
        ASSIGNMENT_TXT = '課題名'
        DEADLINE_TXT = '提出期限'
        SHOW_TXT = '表示'
    }
}

function getLanguage() {
    const language = navigator.language
    return language == 'ja-JP' ? '日本語' : 'English'
}


async function loadFromStorage() {
    let assignments = []
    chrome.storage.sync.get(null, (data) => {
        for (const assignment of Object.values(data)) {
            assignments.push(assignment)
        }
    })
}

function injectAssignmentTable(assignments) {
    const DISPLAY_LIMIT_DAYS = 21

    
    let bannerElem = document.createElement('div')
    let clearBtn = document.createElement('button')
    clearBtn.innerText = CLEAR_TXT
    clearBtn.addEventListener('click', () => {
        chrome.storage.sync.clear()
        location.reload()
    })
    bannerElem.appendChild(clearBtn)
    
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
        <th width="20%">${SUBJECT_TXT}</th>
        <th width="37%">${ASSIGNMENT_TXT}</th>
        <th width="10%">${DEADLINE_TXT}</th>
        <th width="12%">${SHOW_TXT}</th>
    `

    tbody.appendChild(columns)


    chrome.storage.sync.get(null, (data) => {
        let assignments = Object.values(data)
        assignments.sort((a, b) => new Date(a['due']) - new Date(b['due']))

        for (const assignment of assignments) {
            let daysLeft = (new Date(assignment['due']) - new Date()) / 86400000

            // subject, name, due, show
            let record = document.createElement('tr')
            
            //subject
            let subjectColumn = document.createElement('td')

            let subjectElem = document.createElement('p')
            console.log(assignment)
            subjectElem.innerText = getLanguage() == 'English' ? assignment['subject_en'] : assignment['subject_ja']

            subjectColumn.appendChild(subjectElem)

            // name
            let nameColumn = document.createElement('td')

            let nameElem = document.createElement('p')
            nameElem.innerText = assignment.name

            nameColumn.appendChild(nameElem)

            // due
            let dueColumn = document.createElement('td')
            dueColumn.align = 'center'
            if (assignment.due)
                dueColumn.innerText = new Date(assignment.due).toLocaleString('ja-JP')
            else
                dueColumn.innerText = ' - '

            // show
            let showColumn = document.createElement('td')
            showColumn.align = 'center'
            
            let showCheckbox = document.createElement('input')
            showCheckbox.checked = assignment['isVisible']
            showCheckbox.type = 'checkbox'
            showCheckbox.addEventListener('change', () => {
                assignment['isVisible'] = showCheckbox.checked
                var keypair = {}
                keypair[assignment['id']] = assignment
                chrome.storage.sync.set(keypair)
            })
            showColumn.appendChild(showCheckbox)

            let removeButton = document.createElement('button')
            removeButton.innerText = '🗑'
            removeButton.addEventListener('click', () => {
                chrome.storage.sync.remove(assignment['id'], () => {
                    removeButton.parentElement.innerHTML = `<p>'Removed'</p>`
            })})
            showColumn.appendChild(removeButton)


            record.appendChild(subjectColumn)
            record.appendChild(nameColumn)
            record.appendChild(dueColumn)
            record.appendChild(showColumn)

            tbody.append(record)
        }
    })

    tableElem.appendChild(tbody)
    listBlockElem.appendChild(tableElem)
    listBlockElem.style = 'margin-bottom: 10px; box-sizing: border-box; width: 600px; height: 300px; overflow-y: auto'
    
    document.body.appendChild(bannerElem)
    document.body.appendChild(listBlockElem)
}