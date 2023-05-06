import { Notify } from 'notiflix/build/notiflix-notify-aio';
import 'notiflix/dist/notiflix-3.2.6.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const axios = require('axios').default;
const lightbox = new SimpleLightbox('.gallery a');

const BASE_URL = 'https://pixabay.com/api/';
const KEY = '36113205-7b8a826d9fd202ca4a1c9ed3f';

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');
let pageCounter;
let inputVal;
let smoothAmmount;

searchForm.addEventListener('submit', onSubmit);
loadMore.addEventListener('click', onLoadMore);

function onSubmit(evt) {
  evt.preventDefault();
  gallery.innerHTML = '';
  loadMore.hidden = true;
  pageCounter = 1;
  inputVal = '';

  const input = searchForm[0];
  input.value = input.value.trim();
  inputVal = input.value.split(' ').join('+');
  smoothAmmount = 50;
  getImage(inputVal);
}

function onLoadMore(evt) {
  evt.preventDefault();
  pageCounter += 1;
  smoothAmmount = -81;
  getImage(inputVal);
}

async function getImage(input) {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${KEY}&q=${input}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${pageCounter}`
    );

    const totalHits = response.data.totalHits;
    const arr = response.data.hits;

    if (pageCounter * 40 <= totalHits) {
      markup(arr);
      loadMore.hidden = false;
    }
    if (arr.length < 1) {
      Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    if (pageCounter === 1) {
      Notify.info(`Hooray! We found ${totalHits} totalHits images.`);
    }
    if (pageCounter * 40 >= totalHits) {
      loadMore.hidden = true;
      markup(arr);
      Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (err) {
    Notify.failure(err.message);
  }
}

function markup(arr) {
  let mark = '';
  arr.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      mark += `<div class="photo-card">
          <a href="${largeImageURL}" class="gallery__link "><img src="${webformatURL}" alt="${tags}" class="gallery__image" loading="lazy" data-source="${largeImageURL}"/></a>
          <div class="info">
            <p class="info-item">
              <b>Likes</b>
              ${likes}
            </p>
            <p class="info-item">
              <b>Views</b>
              ${views}
            </p>
            <p class="info-item">
              <b>Comments</b>
              ${comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>
              ${downloads}
            </p>
          </div>
        </div>`;
    }
  );

  gallery.insertAdjacentHTML('beforeend', mark);
  lightbox.refresh();
  smoothScroll(smoothAmmount);
}

function smoothScroll(ammount) {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  if (cardHeight * 2 + ammount > cardHeight * 2) {
    window.scrollBy({
      top: ammount,
      behavior: 'smooth',
    });
  } else {
    window.scrollBy({
      top: cardHeight * 2 + ammount,
      behavior: 'smooth',
    });
  }
}
