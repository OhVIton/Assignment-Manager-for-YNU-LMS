// fetch_homework.js
// Fetch homework to submit or resubmit

import Dexie from "dexie"

// Connect to DB
const dbName = "HomeworkDB"
var db = new Dexie(dbName)
db.version(1).stores({hw_store: "ID, subject, name, due"})
var homework_list = []

var LANGUAGE = document.querySelector("#langList > option[selected]").textContent
console.log(LANGUAGE)

// Select the specified subject's name from "[HOME] > subject_name_ja[subject_name_en][subject_id]"
var subject_name = document.querySelector("#cs_loginInfo_left ul li:not(#home)").textContent.match(/(\>\s)(.*)(\[.*\])/)[2] // subject_name_ja[subject_name_en]
var homework_date = document.querySelectorAll("tbody > tr > td.td03")

for (let i = 0; i < homework_date.length; i++) {
    var regex
    if (LANGUAGE == "English") {
        regex = /(Submission Due on|Resubmission deadline):(.*)/
    }
    else if (LANGUAGE == "日本語") {
        regex = /(提出期限|再提出期限):(.*)/
    }
    
    var is_due = homework_date[i].textContent.match(regex);
    if (is_due) {

        var due_date = is_due[2]
        var homework = new Map()
        var homework_id = homework_date[i].parentElement.querySelector("td.td01")
        var homework_name = homework_date[i].parentElement.querySelector("td.td01 > a")
        
        homework.set("ID", homework_id.id)
        homework.set("Subject", subject_name)
        homework.set("Name", homework_name.textContent)
        homework.set("Due", new Date(due_date))
        homework_list.push(homework)
    }
}

var banner = `
<div id=\"title\">
<h2>Homework for this lecture<span>
<img src=\"/lms/img/cs/yazi3.gif\">
</h2></div>
`


var table_header = `
<div id="list_block">
<table border="0" cellpadding="0" cellspacing="0" class="cs_table2">
  <tbody><tr>
    <th width="37%">Homework</th>
    <th width="10%">DEADLINE</th>
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
        content += `
        <tr>
            <td><img src="/lms/img/cs/icon2b.gif" alt="Report">${homework.get("Name")}</td>
            <td align="center">${homework.get("Due").toLocaleDateString()}</a></td>
        </tr>
        `

        db.hw_store.put({
            ID: homework.get("ID"),
            Name: homework.get("Name"),
            Subject: homework.get("Subject"),
            Due: homework.get("Due")
        })
    });

} else {
    console.log("There's no homework :)")
}

var target = document.querySelector('div#main')
target.innerHTML = banner + table_header + content + table_footer + target.innerHTML
