// fetch_homework_storage.js
// Fetch homework to submit or resubmit

var homework_list = []

// Select the specified subject's name from "[HOME] > subject_name_ja[subject_name_en][subject_id]"
//var subject_name = document.querySelector("#cs_loginInfo_left ul li:not(#home)").textContent.match(/(\>\s)(.*)(\[.*\])/)[2] // subject_name_ja[subject_name_en]

var LANGUAGE = document.querySelector("#langList > option[selected]").textContent
var subject_name = ''
var subject_texts = document.querySelector("#cs_loginInfo_left ul li:not(#home)").textContent.match(/(\>\s)(.*)(\[)(.*)(\])(\[.*\])/)

if (LANGUAGE == 'English')
    subject_name = subject_texts[4]
else if (LANGUAGE == '日本語')
    subject_name = subject_texts[2]

var ASSIGNMENT_FOR_THIS_LECTURE_TXT
var ASSIGNMENT_TXT
var DEADLINE_TXT

if(LANGUAGE == 'English') {
    ASSIGNMENT_FOR_THIS_LECTURE_TXT = 'Assignment for ' + subject_name
    ASSIGNMENT_TXT = 'Assignment'
    DEADLINE_TXT = 'DEADLINE'
} else {
    ASSIGNMENT_FOR_THIS_LECTURE_TXT = subject_name + `の課題一覧`
    ASSIGNMENT_TXT = '課題名'
    DEADLINE_TXT = '提出期限'
}



var homework_date = document.querySelectorAll("tbody > tr > td.td03")

for (let i = 0; i < homework_date.length; i++) {
    var regex
    var available_txt
    if (LANGUAGE == "English") {
        regex = /(Submission Due on|Resubmission deadline|Response Due on|Activity Due on):(.*)/
        available_txt = 'Available'
    }
    else if (LANGUAGE == "日本語") {
        regex = /(提出期限|再提出期限|回答期限|未実施):(.*)/
        available_txt = '公開中'
    }

    var is_due = homework_date[i].textContent.match(regex);
    var is_available = homework_date[i].parentElement.querySelector("td.td02").textContent.trim() == available_txt
    if (is_due && is_available) {

        var due_date = is_due[2]
        var homework = new Map()
        var homework_id = homework_date[i].parentElement.querySelector("td.td01").id
        var homework_name = homework_date[i].parentElement.querySelector("td.td01").textContent.trim()

        homework.set("ID", homework_id)
        homework.set("Subject", subject_name)
        homework.set("Name", homework_name)
        homework.set("Due", new Date(due_date))
        homework_list.push(homework)
    }
}

var banner = `
<div id=\"title\">
<h2>${ASSIGNMENT_FOR_THIS_LECTURE_TXT}<span>
<img src=\"/lms/img/cs/yazi3.gif\">
</h2></div>
`


var table_header = `
<div id="list_block">
<table border="0" cellpadding="0" cellspacing="0" class="cs_table2">
  <tbody><tr>
    <th width="37%">${ASSIGNMENT_TXT}</th>
    <th width="10%">${DEADLINE_TXT}</th>
  </tr>
`

var table_footer = `
</tbody></table>
<div class="cs_flmenuvox clearfix">
</div>

</div>
`

var content = ''
if (homework_list.length) {
    console.log(homework_list)
    homework_list.forEach(homework => {
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
        content += `
        <tr>
            <td><img src="${icon(homework.get("ID").substring(0, 3))}" alt="Report">
            <a href="javascript:void(0)" onclick="kyozaiTitleLink('${homework.get("ID")}','02')">${homework.get("Name")}</a>
            </td>
            <td align="center">${homework.get("Due").toLocaleDateString()}</a></td>
        </tr>
        `
        var keypair = {}
        keypair[homework.get('ID')] = [homework.get("Subject"), homework.get("Name"), homework.get("Due").toJSON()]
        chrome.storage.sync.set(keypair)
    })
}

var target = document.querySelector('div#main')
target.innerHTML = banner + table_header + content + table_footer + target.innerHTML
