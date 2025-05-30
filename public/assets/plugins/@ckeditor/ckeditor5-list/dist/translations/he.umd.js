/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'he' ]: { dictionary, getPluralForm } } = {"he":{"dictionary":{"Numbered List":"רשימה ממוספרת","Bulleted List":"רשימה מנוקדת","To-do List":"רשימת מטלות","Bulleted list styles toolbar":"סרגל כלים של סגנונות רשימה עם תבליטים","Numbered list styles toolbar":"סרגל כלים של סגנונות רשימה ממוספרת","Toggle the disc list style":"החלף מצב סגנון רשימת דיסקות","Toggle the circle list style":"החלף מצב סגנון רשימת מעגלים","Toggle the square list style":"החלף מצב סגנון רשימת ריבועים","Toggle the decimal list style":"החלף מצב סגנון רשימה עשרונית","Toggle the decimal with leading zero list style":"החלף מצב סגנון רשימה עשרונית עם אפס מוביל","Toggle the lower–roman list style":"החלף מצב סגנון רשימה עם ספרות רומיות קטנות","Toggle the upper–roman list style":"החלף מצב סגנון רשימה עם ספרות רומיות גדולות","Toggle the lower–latin list style":"החלף מצב סגנון רשימה עם אותיות לטיניות קטנות","Toggle the upper–latin list style":"החלף מצב סגנון רשימה עם אותיות לטיניות גדולות","Disc":"עיגול מלא","Circle":"עיגול","Square":"ריבוע","Decimal":"עשרונית","Decimal with leading zero":"עשרונית עם אפס מוביל","Lower–roman":"אותיות רומיות קטנות","Upper-roman":"אותיות רומיות גדולות","Lower-latin":"אותיות לטיניות קטנות","Upper-latin":"אותיות לטיניות גדולות","List properties":"אפשרויות רשימה","Start at":"התחל ב-","Invalid start index value.":"ערך אינדקס התחלה לא חוקי.","Start index must be greater than 0.":"אינדקס ההתחלה חייב להיות גדול מ-0.","Reversed order":"סדר הפוך","Keystrokes that can be used in a list":"מקשים בהם ניתן להשתמש ברשימה","Increase list item indent":"הגדלת הזחה של פריט רשימה","Decrease list item indent":"הקטנת הזחה של פריט רשימה","Entering a to-do list":"נכנס לרשימת מטלות","Leaving a to-do list":"יוצא מרשימת מטלות"},getPluralForm(n){return (n != 1);}}};
e[ 'he' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'he' ].dictionary = Object.assign( e[ 'he' ].dictionary, dictionary );
e[ 'he' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
