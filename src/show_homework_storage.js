const SUBJECT = 0
const NAME = 1
const DUE = 2


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
    <th width="10%">Action</th>
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


// async function OpenDB() {
//     const dbName = "HomeworkDB"
//     var db = await new Dexie(dbName).open();
//     return db
// }

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
            <td rowspan="1">${subject}</td>
            <td><img src="${icon(id.substring(0, 3))}" alt="Report">${name}</td>
            <td align="center">
                <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${subject + " Assignment"}&details=${name}&dates=${getNowYMDStr(due)}/${getNowYMDStr(new Date(due.getTime() + 86400000))}" target="_blank" rel="noopener noreferrer">
                    ${due.toLocaleDateString()}
                </a>
            </td>
            <td align="center"><input type="button" name="doneButton" id="${id}" value="Remove">
            </tr>
            `
        })
        target.innerHTML =
             banner + table_header + content + table_footer + target.innerHTML 
        var doneButtons = document.getElementsByName("doneButton")
        doneButtons.forEach(btn => {
            console.log(btn)
            btn.addEventListener('click', () => {
                chrome.storage.sync.remove([btn.id], () => {
                    btn.parentElement.innerHTML = '<p>Well Done!</p>'
                })
            })
            
        });
    })

}

QueryData()



