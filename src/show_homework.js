import Dexie from "dexie"

var target = document.querySelector('div#main')
var banner = `
<div id=\"title\">
<h2>Assignments<span>
<img src=\"/lms/img/cs/yazi3.gif\">
</h2></div>
`

var table_header = `
<div id="list_block">
<table border="0" cellpadding="0" cellspacing="0" class="cs_table2">
  <tbody><tr>
    <th width="31%">Lecture</th>
    <th width="37%">Assignment</th>
    <th width="10%">DEADLINE</th>
  </tr>
`

var table_footer = `
</tbody></table>
<div class="cs_flmenuvox clearfix">
</div>
</div>
`

async function QueryData() {
    const dbName = "HomeworkDB"
    var db = await new Dexie(dbName).open();
    var hw_store = await db.table('hw_store').toArray()
    var content = ''
    hw_store.forEach(await function(hw) {
        const icon = (hw_type) => {
            if(hw_type == "REP") {
                return "https://lms.ynu.ac.jp/lms/img/cs/icon2b.gif"
            }
            else if(hw_type == "ANK") {
                return "https://lms.ynu.ac.jp/lms/img/cs/icon7b.gif"
            }
            else {
                return "https://lms.ynu.ac.jp/lms/img/cs/icon5b.gif"
            }
        }
        content += `
        <tr>
        <td rowspan="1">${hw["Subject"]}</td>
            <td><img src="${icon(hw["ID"].substring(0, 3))}" alt="Report">${hw["Name"]}</td>
            <td align="center">${hw["Due"].toLocaleDateString()}</a></td>
        </tr>
        `
    });
    target.innerHTML =
         banner + table_header + content + table_footer + target.innerHTML
}

QueryData()

