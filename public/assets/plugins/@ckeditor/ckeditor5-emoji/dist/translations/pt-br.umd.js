/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pt-br' ]: { dictionary, getPluralForm } } = {"pt-br":{"dictionary":{"Emoji":"Emoji","Show all emoji...":"Exibir todos os emojis...","Find an emoji (min. 2 characters)":"Encontre um emoji (mín. de 2 caracteres)","No emojis were found matching \"%0\".":"Não foram encontrados emojis correspondentes a \"%0\".","Keep on typing to see the emoji.":"Continue digitando para ver o emoji.","The query must contain at least two characters.":"A consulta deve conter ao menos dois caracteres.","Smileys & Expressions":"Rostos e Expressões","Gestures & People":"Gestos e Pessoas","Animals & Nature":"Animais e Natureza","Food & Drinks":"Comidas e Bebidas","Travel & Places":"Viagem e Lugares","Activities":"Atividades","Objects":"Objetos","Symbols":"Símbolos","Flags":"Bandeiras","Select skin tone":"Selecione o tom de pele","Default skin tone":"Tom de pele padrão","Light skin tone":"Tom de pele claro","Medium Light skin tone":"Tom de pele médio-claro","Medium skin tone":"Tom de pele médio","Medium Dark skin tone":"Tom de pele médio-escuro","Dark skin tone":"Tom de pele escuro"},getPluralForm(n){return (n != 1);}}};
e[ 'pt-br' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pt-br' ].dictionary = Object.assign( e[ 'pt-br' ].dictionary, dictionary );
e[ 'pt-br' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
