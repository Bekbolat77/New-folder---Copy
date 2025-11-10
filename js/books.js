// books.js - Book catalog with detail panel

$(document).ready(function() {
  
  // Click on book card to show details
  $('.book-item').on('click', function() {
    // Remove selected state from all cards
    $('.book-card').removeClass('selected');
    
    // Add selected state to clicked card
    $(this).find('.book-card').addClass('selected');
    
    // Get book data
    const bookData = {
      title: $(this).data('title'),
      author: $(this).data('author'),
      year: $(this).data('year'),
      pages: $(this).data('pages'),
      genre: $(this).data('genre'),
      rating: $(this).data('rating'),
      description: $(this).data('description'),
      image: $(this).data('image')
    };
    
    // Display book details
    displayBookDetails(bookData);
  });
  
});

function displayBookDetails(book) {
  // Generate star rating
  const fullStars = Math.floor(book.rating);
  const halfStar = book.rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  
  let stars = '★'.repeat(fullStars);
  if (halfStar) stars += '½';
  stars += '☆'.repeat(emptyStars);
  
  // Generate HTML for book details
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
    
    <div class="book-actions">
      <button class="btn btn-primary read-book-btn" data-title="${book.title}" data-author="${book.author}">
        📖 Read Book
      </button>
      <button class="btn btn-outline-primary" onclick="showToast('✅ Added to wishlist!')">
        ❤️ Wishlist
      </button>
    </div>
    
    <div class="mt-3">
      <button class="btn btn-outline-secondary w-100" onclick="showToast('📤 Share link copied!')">
        🔗 Share Book
      </button>
    </div>
  `;
  
  // Update the details panel
  $('#bookDetailsPanel').html(detailsHTML);
  
  // Smooth scroll to details panel on mobile
  if ($(window).width() < 992) {
    $('html, body').animate({
      scrollTop: $('#bookDetailsPanel').offset().top - 100
    }, 500);
  }
}
