let LANGUAGE = getLanguage();
if (LANGUAGE == 'English') {
  var CLEAR_TXT = 'Clear all assignments';
  var CLEAR_OVERDUE_TXT = 'Clear all overdue assignments';
  var SUBJECT_TXT = 'Lecture';
  var ASSIGNMENT_FOR_THIS_LECTURE_TXT = 'Assignments';
  var ASSIGNMENT_TXT = 'Assignment';
  var DEADLINE_TXT = 'DEADLINE';
  var SHOW_TXT = '表示';
  var RECORD_IN_PAGE_TXT = ' assignemts per page';
  var ERROR_1_TO_100 = 'Values must be between 1 and 100';
} else {
  var CLEAR_TXT = '課題全消去';
  var CLEAR_OVERDUE_TXT = '提出期限を過ぎた課題を全消去';
  var SUBJECT_TXT = '講義';
  var ASSIGNMENT_FOR_THIS_LECTURE_TXT = '課題';
  var ASSIGNMENT_TXT = '課題名';
  var DEADLINE_TXT = '提出期限';
  var SHOW_TXT = '表示';
  var RECORD_IN_PAGE_TXT = '1ページに表示する課題数: ';
  var ERROR_1_TO_100 = '1 - 100 までの数値を入力してください';
}

(async () => {
  loadSetting();
  injectAssignmentTable();
})();

function getLanguage() {
  const language = navigator.language;
  return language == 'ja-JP' ? '日本語' : 'English';
}

function loadSetting() {
  chrome.storage.local.get('PREFERENCES', (data) => {
    const prefs = data['PREFERENCES'];
    if (!prefs) {
      chrome.storage.local.set({
        PREFERENCES: { id: 'PREFERENCES', recordPerPage: 6 },
      });
    }
  });
}
async function loadFromStorage() {
  let assignments = [];
  chrome.storage.sync.get(null, (data) => {
    for (const assignment of Object.values(data)) {
      assignments.push(assignment);
    }
  });
}

function injectAssignmentTable(assignments) {
  const DISPLAY_LIMIT_DAYS = 21;

  let bannerElem = document.createElement('div');
  let clearBtn = document.createElement('button');
  clearBtn.innerText = CLEAR_TXT;
  clearBtn.addEventListener('click', () => {
    chrome.storage.sync.clear();
    location.reload();
  });
  clearBtn.style.marginRight = '10px';
  bannerElem.appendChild(clearBtn);

  let clearOverdueBtn = document.createElement('button');
  clearOverdueBtn.innerText = CLEAR_OVERDUE_TXT;
  clearOverdueBtn.addEventListener('click', () => {
    chrome.storage.sync.get(null, (data) => {
      const assignments = Object.values(data);
      for (const assignment of assignments) {
        if (new Date(assignment.due).getTime < new Date().getTime()) {
          chrome.storage.sync.set(assignment.id, null);
          location.reload();
        }
      }
    });
  });
  clearOverdueBtn.style.marginRight = '10px';
  bannerElem.appendChild(clearOverdueBtn);

  let recordPerPageLabel = document.createElement('label');
  recordPerPageLabel.innerText = RECORD_IN_PAGE_TXT;
  let recordPerPageInput = document.createElement('input');
  chrome.storage.local.get('PREFERENCES', (data) => {
    const prefs = data['PREFERENCES'];
    if (prefs) {
      recordPerPageInput.value = prefs.recordPerPage;
    } else {
      recordPerPageInput.value = 6;
    }
  });
  recordPerPageInput.type = 'number';
  recordPerPageInput.min = 1;
  recordPerPageInput.max = 100;

  recordPerPageInput.addEventListener('input', () => {
    const value = parseInt(recordPerPageInput.value);
    console.log(value);
    if (1 <= value && value <= 100) {
      chrome.storage.local.set({
        PREFERENCES: {
          id: 'PREFERENCES',
          recordPerPage: recordPerPageInput.value,
        },
      });
    } else if (value) {
      alert(ERROR_1_TO_100);
    }
  });
  if (LANGUAGE === 'English') {
    bannerElem.appendChild(recordPerPageInput);
    bannerElem.appendChild(recordPerPageLabel);
  } else {
    bannerElem.appendChild(recordPerPageLabel);
    bannerElem.appendChild(recordPerPageInput);
  }

  let listBlockElem = document.createElement('div');
  listBlockElem.id = 'list_block';

  let tableElem = document.createElement('table');
  tableElem.border = '0';
  tableElem.cellPadding = '0';
  tableElem.cellSpacing = '0';
  tableElem.className = 'cs_table2';

  let tbody = document.createElement('tbody');
  let columns = document.createElement('tr');
  columns.innerHTML = `
        <th width="20%">${SUBJECT_TXT}</th>
        <th width="37%">${ASSIGNMENT_TXT}</th>
        <th width="10%">${DEADLINE_TXT}</th>
        <th width="12%">${SHOW_TXT}</th>
    `;

  tbody.appendChild(columns);

  chrome.storage.sync.get(null, (data) => {
    let assignments = Object.values(data);
    assignments.sort((a, b) => new Date(a['due']) - new Date(b['due']));

    for (const assignment of assignments) {
      let daysLeft = (new Date(assignment['due']) - new Date()) / 86400000;

      // subject, name, due, show
      let record = document.createElement('tr');

      //subject
      let subjectColumn = document.createElement('td');

      let subjectElem = document.createElement('p');
      subjectElem.innerText =
        getLanguage() == 'English'
          ? assignment['subject_en']
          : assignment['subject_ja'];

      subjectColumn.appendChild(subjectElem);

      // name
      let nameColumn = document.createElement('td');

      let nameElem = document.createElement('p');
      nameElem.innerText = assignment.name;

      nameColumn.appendChild(nameElem);

      // due
      let dueColumn = document.createElement('td');
      dueColumn.align = 'center';
      if (assignment.due)
        dueColumn.innerText = new Date(assignment.due).toLocaleString('ja-JP');
      else dueColumn.innerText = ' - ';

      // show
      let showColumn = document.createElement('td');
      showColumn.align = 'center';

      let showCheckbox = document.createElement('input');
      showCheckbox.checked = assignment['isVisible'];
      showCheckbox.type = 'checkbox';
      showCheckbox.addEventListener('change', () => {
        assignment['isVisible'] = showCheckbox.checked;
        var keypair = {};
        keypair[assignment['id']] = assignment;
        chrome.storage.sync.set(keypair);
      });
      showColumn.appendChild(showCheckbox);

      let removeButton = document.createElement('button');
      removeButton.innerText = '🗑';
      removeButton.addEventListener('click', () => {
        chrome.storage.sync.remove(assignment['id'], () => {
          removeButton.parentElement.innerHTML = `<p>'Removed'</p>`;
        });
      });
      showColumn.appendChild(removeButton);

      record.appendChild(subjectColumn);
      record.appendChild(nameColumn);
      record.appendChild(dueColumn);
      record.appendChild(showColumn);

      tbody.append(record);
    }
  });

  tableElem.appendChild(tbody);
  listBlockElem.appendChild(tableElem);
  listBlockElem.style =
    'margin-bottom: 10px; box-sizing: border-box; width: 600px; height: 300px; overflow-y: auto';

  document.body.appendChild(bannerElem);
  document.body.appendChild(listBlockElem);
}
