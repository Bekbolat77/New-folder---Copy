// books.js - Book catalog with detail panel

// books.js - Book catalog with detail panel

$(document).ready(function() {

  // 1️⃣ BOOK CLICK HANDLER
  $('.book-item').on('click', function() {
    $('.book-card').removeClass('selected');
    $(this).find('.book-card').addClass('selected');
    
    const bookData = {
      title: $(this).data('title'),
      author: $(this).data('author'),
      year: $(this).data('year'),
      pages: $(this).data('pages'),
      genre: $(this).data('genre'),
      rating: $(this).data('rating'),
      description: $(this).data('description'),
      image: $(this).data('image'),
      link: $(this).data('pdf') || $(this).data('link') || ''
    };
    
    displayBookDetails(bookData);
  });

  // 2️⃣ GOOGLE BOOKS API INTEGRATION 
  $('#searchBooks').on('input', async function () {
    const query = $(this).val().trim();
    if (query.length < 3) return;

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      $('#booksList').empty();

      if (!data.items || data.items.length === 0) {
        $('#booksList').html('<p class="text-muted">No books found.</p>');
        return;
      }

      data.items.forEach(item => {
        const info = item.volumeInfo;
        const title = info.title || 'No title';
        const author = info.authors ? info.authors.join(', ') : 'Unknown';
        const image = info.imageLinks?.thumbnail || 'images/default_book.png';
        const description = info.description || 'No description available';
        const link = info.previewLink || '';

        const card = `
          <div class="col-md-6 col-lg-4 book-item" 
               data-title="${title}"
               data-author="${author}"
               data-description="${description}"
               data-image="${image}"
               data-link="${link}">
            <div class="card book-card h-100">
              <img src="${image}" class="card-img-top" alt="${title}">
              <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text small text-muted">by ${author}</p>
                <button class="btn btn-sm btn-primary read-book-btn" data-link="${link}">📖 Read</button>
              </div>
            </div>
          </div>`;
        $('#booksList').append(card);
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      $('#booksList').html('<p class="text-danger">Error loading books.</p>');
    }
  });

  // 3️⃣ AUTO-OPEN BOOK FROM LINK
  const params = new URLSearchParams(window.location.search);
  const bookParam = params.get('book');
  if (bookParam) {
    const decoded = decodeURIComponent(bookParam);
    const $match = $(`.book-item[data-title="${decoded}"]`);
    if ($match.length) {
      $match.click();
      $('html, body').animate({
        scrollTop: $('#bookDetailsPanel').offset().top - 100
      }, 500);
    }
  }
});


  // 🟢 Auto-open book from ?book= query
  const params = new URLSearchParams(window.location.search);
  const bookParam = params.get('book');
  if (bookParam) {
    const decoded = decodeURIComponent(bookParam);
    const $match = $(`.book-item[data-title="${decoded}"]`);
    if ($match.length) {
      $match.click();
      $('html, body').animate({
        scrollTop: $('#bookDetailsPanel').offset().top - 100
      }, 500);
    }
  }


// ===========================
// READ BOOK BUTTON HANDLER
// ===========================
$(document).on('click', '.read-book-btn', function(e) {
  e.preventDefault();
  const pdf = $(this).data('link') || $(this).data('pdf');
  if (pdf) {
    window.open(pdf, '_blank'); // open PDF in new tab
  } else {
    showToast('❌ PDF not available for this book.');
  }
});

// ===========================
// ADD TO MY BOOKS HANDLER
// ===========================
$(document).on('click', '.add-to-my-books-btn', function(e) {
  e.preventDefault();

  const $btn = $(this);
  const title = $btn.data('title');
  const author = $btn.data('author');
  const image = $btn.data('image') || '';
  const link = $btn.data('link') || ''; 

  const book = { 
    title, 
    author, 
    image, 
    link,   
    dateAdded: new Date().toISOString() 
  };

  let myBooks = JSON.parse(localStorage.getItem('myBooks')) || [];
  const bookExists = myBooks.some(b => b.title === book.title && b.author === book.author);

  if (!bookExists) {
    myBooks.push(book);
    localStorage.setItem('myBooks', JSON.stringify(myBooks));
    showToast('✅ Book added to My Books!');
  } else {
    showToast('📚 Book is already in your library!');
  }
});


function displayBookDetails(book) {
  const fullStars = Math.floor(book.rating);
  const halfStar = book.rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  let stars = '★'.repeat(fullStars);
  if (halfStar) stars += '½';
  stars += '☆'.repeat(emptyStars);

  const detailsHTML = `
    <div class="text-center">
      <img src="${book.image}" alt="${book.title}" />
    </div>
    
    <h2>${book.title}</h2>
    <p class="author">by ${book.author}</p>
    
    <div class="rating-stars">${stars} ${book.rating}/5</div>
    
    <div class="book-meta">
      <div class="book-meta-item">
        <strong>${book.year}</strong>
        <span>Published</span>
      </div>
      <div class="book-meta-item">
        <strong>${book.pages}</strong>
        <span>Pages</span>
      </div>
    </div>
    
    <div class="mb-3">
      ${book.genre.split(',').map(g => `<span class="badge bg-primary me-1">${g.trim()}</span>`).join('')}
    </div>
    
    <h4>Description</h4>
    <p class="text-muted">${book.description}</p>
    
    
  ${
    book.link
      ? `<button class="btn btn-primary flex-fill read-book-btn" data-link="${book.link}">📖 Read Book</button>`
      : `<button class="btn btn-secondary flex-fill" disabled>📕 PDF not available</button>`
  }
  <button class="btn btn-outline-success flex-fill add-to-my-books-btn"
    data-title="${book.title}"
    data-author="${book.author}"
    data-image="${book.image}"
    data-link="${book.link}">
    ➕ Add
  </button>
</div>
    </div>
    <div class="mt-3">
      <button 
  class="btn btn-outline-secondary w-100 share-book-btn"
  data-title="${encodeURIComponent(book.title)}">
  🔗 Share Book
</button>
    </div>
  `;

  $('#bookDetailsPanel').html(detailsHTML);

  if ($(window).width() < 992) {
    $('html, body').animate({
      scrollTop: $('#bookDetailsPanel').offset().top - 100
    }, 500);
  }
// ===========================
// SHARE BOOK BUTTON HANDLER
// ===========================
$(document).on('click', '.share-book-btn', function () {
  const encodedTitle = $(this).data('title');
  const title = decodeURIComponent(encodedTitle);

  const url = `${window.location.origin}${window.location.pathname}?book=${encodeURIComponent(title)}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => showToast('📤 Share link copied!'))
      .catch(() => {
        prompt('Copy this link:', url);
      });
  } else {
    prompt('Copy this link:', url);
  }
});
}
