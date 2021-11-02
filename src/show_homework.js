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
    <!--<th width="10%"></th>-->
  </tr>
`

var table_footer = `
<script>
</script>
</tbody></table>
<div class="cs_flmenuvox clearfix">
</div>
</div>
`

var btn_function = `
    function remove_btn_clicked(event) {
        console.log(event.target.eventParam)
    };

    document.getElementsByName('remove_btn').forEach(btn => {
        btn.eventParam = btn.getAttribute('hw_id');
        btn.addEventListener('click', remove_btn_clicked);
    });
`


async function OpenDB() {
    const dbName = "HomeworkDB"
    var db = await new Dexie(dbName).open();
    return db
}

async function RemoveData(e) {
    console.log("pushed")
    var hw_id = e.target.value
    var db = await OpenDB()
    db.table('hw_store').delete(hw_id)
}
function getNowYMDStr(date){
    const Y = date.getFullYear()
    const M = ("00" + (date.getMonth()+1)).slice(-2)
    const D = ("00" + date.getDate()).slice(-2)
  
    return Y + M + D
  }


async function QueryData() {
    var db = await OpenDB();
    var hw_store = await db.table('hw_store').toArray()
    hw_store.sort((a,b) => (new Date(a.Due)) - new Date(b.Due))
    console.log(hw_store)
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
        <td align="center">
            <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${hw["Subject"] + " Assignment"}&details=${hw["Name"]}&dates=${getNowYMDStr(hw["Due"])}/${getNowYMDStr(new Date(hw["Due"].getTime() + 86400000))}" target="_blank" rel="noopener noreferrer">
                ${hw["Due"].toLocaleDateString()}
            </a>
        </td>
        <!--<td align="center"><button type="submit" name="remove_btn" hw_id=${hw["ID"]}>Remove</button>-->
        </tr>
        `
    });
    target.innerHTML =
         banner + table_header + content + table_footer + target.innerHTML 
    //document.createElement('script').innerHTML += btn_function
}

QueryData()



