// show_homework_storage.js
// Show homeworks from browser


/* main */
(() => {
    setTextLanguage()
    var assignments = getAssignmentsFromStorage()
    console.log(assignments)
    injectAssignmentTable(assignments)
})()

function setTextLanguage() {
    LANGUAGE = document.querySelector("#langList > option[selected]").textContent
    if (LANGUAGE == '日本語') {
        ASSIGNMENTS_TXT = '課題'
        LECTURE_TXT = '講義名'
        ASSIGNMENT_TXT = '課題名'
        DEADLINE_TXT = '提出期限'
        ACTION_TXT = '操作'
        REMOVE_TXT = '削除'
    } else {
        ASSIGNMENTS_TXT = 'Assignments'
        LECTURE_TXT = 'Lecture'
        ASSIGNMENT_TXT = 'Assignment'
        DEADLINE_TXT = 'DEADLINE'
        ACTION_TXT = 'Action'
        REMOVE_TXT = 'Remove'
    }
}

function getAssignmentsFromStorage() {
    let assignments = []
    chrome.storage.sync.get(null, (data) => {
        for (assignment of Object.values(data)) {
            assignments.push(assignment)
        }
        // Cannot sort items outside chrome.storage.sync.get
        assignments.sort((a, b) => new Date(a['due']) - new Date(b['due']))
    })
    
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

function injectAssignmentTable(assignments) {
    const DISPLAY_LIMIT = 15
    let bannerElem = document.createElement('div')
    bannerElem.id = 'title'
    bannerElem.innerHTML = `
        <h2>${ASSIGNMENTS_TXT}
        </h2>
    `

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
    <th width="31%">${LECTURE_TXT}</th>
    <th width="37%">${ASSIGNMENT_TXT}</th>
    <th width="10%">${DEADLINE_TXT}</th>
    <th width="10%">${ACTION_TXT}</th>
  </tr>
    `

    tbody.appendChild(columns)
    
    for (const assignment of assignments) {
        let days_left = (new Date(assignment['due']) - new Date())/ 86400000
        if(days_left < DISPLAY_LIMIT) {
            let record = document.createElement('tr')
            
            let nameColumn = document.createElement('td')

            let img = document.createElement('img')
            img.src = getIconURLFromID(assignment['id'])
            let href = document.createElement('href')
            href.href = 'javascript:void(0)'
            href.onclick = `kyozaiTitleLink('${assignment['id']}','02')`
            href.innerText = assignment['name']
            
            nameColumn.appendChild(img)
            nameColumn.appendChild(href)
            

            let dueColumn = document.createElement('td')
            dueColumn.align = 'center'
            dueColumn.innerText = new Date(assignment['due']).toLocaleDateString()

            record.appendChild(nameColumn)
            record.appendChild(dueColumn)

            tbody.append(record)
        }
    }
    
    tableElem.appendChild(tbody)
    listBlockElem.appendChild(tableElem)
    listBlockElem.style = 'margin-bottom: 10px'
    
    let mainElem = document.querySelector('div#main')
    mainElem.prepend(listBlockElem)
    mainElem.prepend(bannerElem)
}

var target = document.querySelector('div#main')

function getNowYMDStr(date){
    const Y = date.getFullYear()
    const M = ("00" + (date.getMonth()+1)).slice(-2)
    const D = ("00" + date.getDate()).slice(-2)
  
    return Y + M + D
  }


function QueryData() {
    var content = ''
    chrome.storage.sync.get(null, (items) => {
        var sorted_items = Object.entries(items)
            .map((hw) => {return {hw:hw, due:hw[1][DUE]}})
            .sort((a, b) => new Date(a.due) - new Date(b.due))
            .map((obj) => obj.hw)
        sorted_items.forEach((item) => {
            var id = item[0]
            var subject = item[1][SUBJECT]
            var name = item[1][NAME]
            var due = new Date(item[1][DUE])
            var days_left = (due - new Date() ) / 86400000
            const icon = (hw_type) => {
                if (hw_type == "REP") {
                    return "https://lms.ynu.ac.jp/lms/img/cs/icon2b.gif"
                }
                else if (hw_type == "ANK") {
                    return "https://lms.ynu.ac.jp/lms/img/cs/icon7b.gif"
                }
                else if (hw_type == "TES") {
                    return "https://lms.ynu.ac.jp/lms/img/cs/icon3b.gif"
                }
                else {
                    return "https://lms.ynu.ac.jp/lms/img/cs/icon5b.gif"
                }
            }
            if (days_left < DISPLAY_LIMIT) {
                content += `
                <tr>
                <td rowspan="1">${subject}</td>
                <td><img src="${icon(id.substring(0, 3))}" alt="Report">${name}</td>
                <td align="center">
                    <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${subject + " " + ASSIGNMENT_TXT}&details=${name}&dates=${getNowYMDStr(due)}/${getNowYMDStr(new Date(due.getTime() + 86400000))}" target="_blank" rel="noopener noreferrer">
                        ${due.toLocaleDateString()}
                    </a>
                </td>
                <td align="center"><input type="button" name="doneButton" id="${id}" value="${REMOVE_TXT}">
                </tr>
                `
            }
        })
        target.innerHTML =
             banner + table_header + content + table_footer + target.innerHTML 
        var doneButtons = document.getElementsByName("doneButton")
        doneButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                chrome.storage.sync.remove([btn.id], () => {
                    btn.parentElement.innerHTML = '<p>Well Done!</p>'
                })
            })
            
        });
    })

}