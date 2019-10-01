var buttons = ['Friday the 13th', 'Nightmare on Elm street', 'Scream', 'Texas Chainsaw Massacre', 'Childs play', 'Halloween', 'Hell raiser'];
const API_KEY = 'h5C4IYHKwH3EZ961cj0t1HgNtFOx1Eru';
const endpoint = 'https://api.giphy.com/v1/gifs/search?api_key=h5C4IYHKwH3EZ961cj0t1HgNtFOx1Eru';
let favorites = [];
let previousSearch = [];

function loadButtons() {
     var listButtons = JSON.parse(localStorage.getItem('buttons'));
    // console.log(listButtons);
    
    //  console.log(buttons);
    buttons = listButtons;
    console.log(buttons);
}

function renderButtons() {

    console.log(buttons); 

    $('.recent-search').empty();

    for (let i = 0; i < buttons.length; i++) {
        const buttonName = buttons[i];

        const button = `
         <div class="wrap-buttons">
         <button class="btn btn-search" data-name="${buttonName}">${buttonName}</button>
         <button data-name="${buttonName}" data-index="${i}" class="btn btn-delete fas fa-times"></button>
         </div>
     `;

        $('.recent-search').append(button);
    }

    localStorage.setItem('buttons', JSON.stringify(buttons));
}




function removeButton() {
    const buttonIndex = $(this).attr('data-index');

    buttons.splice(buttonIndex, 1);

    renderButtons();

    console.log('Button Index: ', buttonIndex);
}

function addButton(value) {
    buttons.push(value);

    renderButtons();
}



function createGiphyTemplate(giphy) {

    const timeAgo = moment(giphy.import_datetime).fromNow();
    const starIndex = favorites.indexOf(giphy.id);

    const isStar = starIndex !== -1 ? 'fas' : 'far';

    const images = giphy.images;
    const template = `
    <div class="giphy">
    <i class="${isStar} fa-star favorite" data-id="${giphy.id}" data-star="${isStar}">
    </i>
    <div class="giphy-image">
        <img 
        src="${images.original_still.url}" 
        data-still="${images.original_still.url}""
        data-animate="${images.original.url}" 
        data-state="still">
        <i class="fa fa-play img-play"></i>
    </div>
    <div class="giphy-info">
        <p>Rating: ${giphy.rating}</p>
        <p>Posted ${timeAgo}</p>
    </div>
  
    <div class="giphy-footer" data-link="${giphy.embed_url}"> 
        <p>Copy Link <i class="fa fa-link"></i></p>
    </div>
  </div>
    `;

    return template;
}


function renderGiphys(giphys) {

    $('.giphy-content').empty();

    for (let i = 0; i < giphys.length; i++) {
        const giphy = giphys[i];

        const giphyTemplate = createGiphyTemplate(giphy);

        $('.giphy-content').append(giphyTemplate);

    }
}


function fetchGiphy(value) {
    uncheckFavorite();
    const url = endpoint + '&q=' + value;

    $.ajax({ url })
        .then(function (response) {
            const giphys = response.data;
            previousSearch = giphys;

            renderGiphys(giphys);
            console.log('Giphy: ', giphys);
        })
        .catch(function (error) {
            console.log('Error: ', error);
        });

}

function searchGiphy(event) {
    event.preventDefault();

    const value = $('#search').val();
    if (buttons.includes(value)) {
        alert('You have already searched this segment want to try something different? ')
    } else {
        addButton(value);
        fetchGiphy(value);
    }

    $('#search').val('');
}

function imgCardClick() {
    const giphyCard = $(this);

    const img = giphyCard.find('img');
    const icon = giphyCard.find('i');

    const still = img.attr('data-still');
    const animate = img.attr('data-animate');
    const state = img.attr('data-state');

    if (state === 'still') {
        img.attr({
            src: animate,
            'data-state': 'animate'
        });

        icon.removeClass('img-play');

    } else {
        img.attr({
            src: still,
            'data-state': 'still'
        });

        icon.addClass('img-play');
    }

}

function clipToClipBoard(value) {
    const tempElement = $('<input>');
    $('body').append(tempElement);

    tempElement.val(value).select();
    document.execCommand('copy');
    tempElement.remove();
}

function copyLink() {

    const link = $(this).attr('data-link');
    const content = $(this).html();

    clipToClipBoard(link);

    $(this).html('Copied');

    setTimeout(() => $(this).html(content), 1000);

}

function searchGiphyByButton() {
    const buttonName = $(this).attr('data-name');
    const parent = $(this).parent();

    $('.btn').parent().removeClass('active');
    parent.addClass('active');

    fetchGiphy(buttonName);
}

function clearResult(event) {
    event.preventDefault();
    uncheckFavorite();

    $('.btn').parent().removeClass('active');
    $('.giphy-content').html('<p>cleared result</p>');
}

function generateRandomValue(arr) {

    if (arr.length > 0) {
        const index = Math.floor(Math.random() * arr.length);
        const value = arr[index];
        return value;
    }


    return 'Friday the 13th';
}

function disableSearchButton() {
    const value = $(this).val();

    if (value) {
        $('#submit-button').prop('disabled', false);
    } else {
        $('#submit-button').prop('disabled', true);

    }
}

function setFavorite() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadFavorite() {
    const stars = JSON.parse(localStorage.getItem('favorites'));

    if (Array.isArray(stars)) {
        favorites = stars;
    }
}

function addToFavorite(id) {
    favorites.push(id);
    setFavorite();
}

function removeFavorite(id) {
    favorites = favorites.filter((el) => el != id);
    setFavorite();
}

function handleFavorite() {
    const starState = $(this).attr('data-star');
    const id = $(this).attr('data-id');

    if (starState === 'far') {
        addToFavorite(id);

        $(this).removeClass('far').addClass('fas');
        $(this).attr('data-star', 'fas');
    } else {
        removeFavorite(id);
        $(this).removeClass('fas').addClass('far');
        $(this).attr('data-star', 'far');
    }

}

function renderFavoriteGiphy(giphy) {

    const giphyTemplate = createGiphyTemplate(giphy);
    $('.giphy-content').append(giphyTemplate);
}

function searchGiphyByFavorite() {
    const isFavoriteOnly = $(this).is(':checked');

    if (isFavoriteOnly) {
        $('.giphy-content').empty();

        for (let i = 0; i < favorites.length; i++) {
            const id = favorites[i];
            const url = `https://api.giphy.com/v1/gifs/${id}?api_key=h5C4IYHKwH3EZ961cj0t1HgNtFOx1Eru`;

            $.ajax({ url })
                .then((response) => {
                    renderFavoriteGiphy(response.data);
                    console.log('Response:', response);
                })
                .catch((error) => {
                    console.log('Error:', error);
                });
        }

    } else {
        renderGiphys(previousSearch);
    }

}

function uncheckFavorite() {
    $('#favorites-only').prop('checked', false);
}

function initApp() {

    const value = generateRandomValue(buttons);
    console.log(value);
    

    loadFavorite();   
    renderButtons();
    loadButtons();
    fetchGiphy(value);
}

initApp();

$(document).on('click', '.btn-delete', removeButton);
$(document).on('click', '.giphy-image', imgCardClick);
$(document).on('click', '.giphy-footer', copyLink);
$(document).on('click', '.btn-search', searchGiphyByButton);
$(document).on('click', '.favorite', handleFavorite);


$('#submit-button').on('click', searchGiphy);
$('#clear-result').on('click', clearResult);
$('#search').on('keyup', disableSearchButton);
$('#favorites-only').on('click', searchGiphyByFavorite);





