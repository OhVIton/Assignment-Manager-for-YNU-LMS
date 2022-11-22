// show_homework_storage.js
// Show homeworks from browser

import { Grid, h } from 'gridjs';
import { jaJP } from 'gridjs/l10n';

var LANGUAGE = getLanguage();
if (LANGUAGE == '日本語') {
  var ASSIGNMENTS_TXT = '課題';
  var LECTURE_TXT = '講義名';
  var ASSIGNMENT_TXT = '課題名';
  var DEADLINE_TXT = '提出期限';
  var ACTION_TXT = '操作';
  var REMOVE_TXT = '削除';
  var WELLDONE_TXT = 'おめでとう！';
  var GRIDJS_LANGUAGE = jaJP;
  GRIDJS_LANGUAGE['search'] = '検索 (講義名, 課題名, 期限)';
  GRIDJS_LANGUAGE['pagination']['results'] +=
    ' ' + 'Shift押しながら項目選択で複数条件ソート';
} else {
  var ASSIGNMENTS_TXT = 'Assignments';
  var LECTURE_TXT = 'Lecture';
  var ASSIGNMENT_TXT = 'Assignment';
  var DEADLINE_TXT = 'DEADLINE';
  var ACTION_TXT = 'Action';
  var REMOVE_TXT = 'Remove';
  var WELLDONE_TXT = 'Well done!';
  var GRIDJS_LANGUAGE = {};
}

/* main */
(() => {
  injectAssignmentTable();
})();

function getLanguage() {
  const LOGOUT_TEXT = document.querySelector(
    '#form-id > div > ul > li.logoutButtonFrame > a'
  ).textContent;
  return LOGOUT_TEXT.includes('Logout') ? 'English' : '日本語';
}

function getAssignmentsFromStorage() {
  let assignments = [];

  return assignments;
}

function getIconURLFromID(hw_name) {
  if (hw_name.includes('REP')) {
    //return "/lms/img/cs/icon2b.gif"
    return '/lms/img/pc/material_report_S.png';
  } else if (hw_name.includes('ANK')) {
    //return "/lms/img/cs/icon7b.gif"
    return '/lms/img/pc/material_questionnaire_S.png';
  } else if (hw_name.includes('TES')) {
    //return "/lms/img/cs/icon3b.gif"
    return '/lms/img/pc/material_exam_S.png';
  } else {
    //return "/lms/img/cs/icon5b.gif"
    return '/lms/img/pc/material_study-materials_S.png';
  }
}

function injectAssignmentTable() {
  const DISPLAY_LIMIT_DAYS = 31;
  const GAS_TASKAPI_URL =
    'https://script.google.com/macros/s/AKfycbxOkCMKIeXHZPxkVHZbQDlU6ezRRljwJdypjI9B4qA2l3oZqfgtxOzDr6jY1PoN9rTa6Q/exec';
  let inDleftCnt = 0;

  const lectureURIElems = Array.from(
    document.querySelectorAll('[onclick^=formSubmit]')
  );

  let recordPerPage = 6;
  chrome.storage.local.get('PREFERENCES', (data) => {
    console.log(data);
    const prefs = data['PREFERENCES'];
    if (prefs['id'] === 'PREFERENCES') {
      recordPerPage = prefs.recordPerPage;
    }
  });

  chrome.storage.sync.get(null, (data) => {
    const assignments = Object.values(data);
    // Cannot sort items outside chrome.storage.sync.get
    assignments.sort((a, b) => new Date(a['due']) - new Date(b['due']));

    let asm = [];
    for (const assignment of assignments) {
      if (assignment['id'] === 'PREFERENCES') {
        continue;
      }
      //separated evaluation of visibility and date left
      if (assignment['isVisible']) {
        var daysLeft;
        if (assignment['due']) {
          daysLeft = (new Date(assignment['due']) - new Date()) / 86400000;
          if (daysLeft >= DISPLAY_LIMIT_DAYS) continue;
        }
        inDleftCnt++;

        let subjectElem = document.createElement('p');
        if (
          lectureURIElems.filter((x) =>
            x.parentElement.textContent.includes(assignment['subject_en'])
          ).length
        ) {
          subjectElem = document.createElement('a');
          subjectElem.href = 'javascript:void(0)';
          subjectElem.setAttribute(
            'onclick',
            lectureURIElems
              .filter((x) =>
                x.parentElement.textContent.includes(assignment['subject_en'])
              )[0]
              .getAttribute('onclick')
          );
        }
        subjectElem.innerText =
          getLanguage() == 'English'
            ? assignment['subject_en']
            : assignment['subject_ja'];

        let linkElem = document.createElement('a');
        if (assignment['due']) {
          linkElem.href = `${GAS_TASKAPI_URL}?language=${getLanguage()}&subject=${
            getLanguage() === '日本語'
              ? assignment['subject_ja']
              : assignment['subject_en']
          }&name=${assignment['name']}&due=${new Date(
            new Date(assignment['due']).getTime() -
              new Date(assignment['due']).getTimezoneOffset() * 60 * 1000
          ).toJSON()}&id=${assignment['id']}`;
          linkElem.innerText = new Date(assignment['due']).toLocaleString(
            'ja-JP'
          );
          if (daysLeft < 0) {
            linkElem.style = 'color: gray';
          } else if (daysLeft < 1) {
            linkElem.style = 'color: red';
          } else if (daysLeft < 2) {
            linkElem.style = 'color: #F6AA00';
          } else if (daysLeft < 7) {
            linkElem.style = 'color: green';
          } else {
            linkElem.style = 'color: turqoise';
          }
        } else {
          linkElem.href = `${GAS_TASKAPI_URL}?language=${getLanguage()}&subject=${
            getLanguage() === '日本語'
              ? assignment['subject_ja']
              : assignment['subject_en']
          }&name=${assignment['name']}&due=&id=${assignment['id']}`;
          linkElem.innerText = '-';
        }
        linkElem.target = '_blank';
        linkElem.rel = 'noopener nonreferrer';

        let removeBtn = h(
          'button',
          {
            onClick: () => {
              chrome.storage.sync.remove(assignment['id'], () => {
                removeBtn.parentElement.innerHTML = `<p>${WELLDONE_TXT}</p>`;
              });
              window.location.reload();
            },
            style: {
              width: '100%',
              backgroundColor: 'white',
              color: '#2285b1',
              fontWeight: '700',
              border: '1px solid',
            },
          },
          REMOVE_TXT
        );
        asm.push([subjectElem, assignment['name'], linkElem, removeBtn]);
      }
    }

    let mainElem = document.querySelector('div.contentsColumn');
    const tableElem = document.createElement('div');
    new Grid({
      columns: [
        {
          name: LECTURE_TXT,
          width: '25%',
          sort: {
            compare: (a, b) => {
              const aText = a.props.content.replace(/(<([^>]+)>)/gi, '');
              const bText = b.props.content.replace(/(<([^>]+)>)/gi, '');
              if (aText > bText) {
                return 1;
              } else if (bText > aText) {
                return -1;
              } else {
                return 0;
              }
            },
          },
        },
        { name: ASSIGNMENT_TXT, width: '40%' },
        {
          name: DEADLINE_TXT,
          width: '20%',
          sort: {
            compare: (a, b) => {
              return 1;
            },
          },
        },
        {
          name: ACTION_TXT,
          width: '10%',
          sort: false,
        },
      ],
      style: {
        table: {
          width: '100%',
        },
      },
      search: {
        selector: (cell, rowIndex, cellIndex) => {
          if (cellIndex === 0 || cellIndex == 2) {
            return cell.props.content.replace(/(<([^>]+)>)/gi, '');
          } else {
            return cell;
          }
        },
      },
      data: asm,
      sort: true,
      pagination: { limit: recordPerPage, summary: true },
      language: GRIDJS_LANGUAGE,
    }).render(tableElem);
    mainElem.prepend(tableElem);
  });
}

var target = document.querySelector('div#main');

function getNowYMDStr(date) {
  const Y = date.getFullYear();
  const M = ('00' + (date.getMonth() + 1)).slice(-2);
  const D = ('00' + date.getDate()).slice(-2);

  return Y + M + D;
}
