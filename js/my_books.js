// my_books.js - Load and manage user's book collection

$(document).ready(function() {
  
  // Load books from localStorage on page load
  loadMyBooks();
  
  // Add book manually through form
  $('#addBookForm').on('submit', function(e) {
    e.preventDefault();
    
    const title = $('#bookTitle').val().trim();
    const author = $('#bookAuthor').val().trim();
    
    if (!title || !author) {
      showToast('❌ Please fill in all fields');
      return;
    }
    
    // Show spinner
    $('#addBookText').addClass('d-none');
    $('#addBookSpinner').removeClass('d-none');
    
    setTimeout(() => {
      const book = {
        title: title,
        author: author,
        image: 'https://via.placeholder.com/400x260/667eea/ffffff?text=' + encodeURIComponent(title),
        dateAdded: new Date().toISOString()
      };
      
      let myBooks = JSON.parse(localStorage.getItem('myBooks')) || [];
      
      // Check if book already exists
      const bookExists = myBooks.some(b => b.title === title && b.author === author);
      
      if (!bookExists) {
        myBooks.push(book);
        localStorage.setItem('myBooks', JSON.stringify(myBooks));
        loadMyBooks();
        showToast('✅ Book added successfully!');
      } else {
        showToast('⚠️ This book is already in your library');
      }
      
      // Reset form
      this.reset();
      $('#addBookText').removeClass('d-none');
      $('#addBookSpinner').addClass('d-none');
    }, 1000);
  });
  
  // Remove individual book
  $(document).on('click', '.remove-book', function() {
    const title = $(this).data('title');
    const author = $(this).data('author');
    
    let myBooks = JSON.parse(localStorage.getItem('myBooks')) || [];
    myBooks = myBooks.filter(book => !(book.title === title && book.author === author));
    localStorage.setItem('myBooks', JSON.stringify(myBooks));
    
    loadMyBooks();
    showToast('🗑️ Book removed from library');
  });
  
  // Clear all books
  $('#clearAllBooks').on('click', function() {
    if (confirm('Are you sure you want to remove all books from your library?')) {
      localStorage.removeItem('myBooks');
      loadMyBooks();
      showToast('🗑️ All books removed');
    }
  });
  
});

// Function to load and display books
function loadMyBooks() {
  const myBooks = JSON.parse(localStorage.getItem('myBooks')) || [];
  const $userBooks = $('#userBooks');
  const $emptyMessage = $('#emptyMessage');
  
  // Update book count
  $('#bookCount').text(myBooks.length);
  
  // Clear existing books
  $userBooks.empty();
  
  if (myBooks.length === 0) {
    $userBooks.html(`
      <div class="col-12 text-center text-muted" id="emptyMessage">
        <p>No books in your library yet. Start reading to build your collection!</p>
      </div>
    `);
    return;
  }
  
  // Display each book
  myBooks.forEach(book => {
    const bookCard = `
      <div class="col-md-4 col-lg-3">
        <div class="card h-100">
          <img src="${book.image}" class="card-img-top" alt="${book.title}" loading="lazy" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${book.title}</h5>
            <p class="card-text small text-muted">by ${book.author}</p>
            <div class="mt-auto">
              <button class="btn btn-sm btn-primary w-100 mb-2 read-book-btn">📖 Continue Reading</button>
              <button class="btn btn-sm btn-outline-danger w-100 remove-book" data-title="${book.title}" data-author="${book.author}">Remove</button>
            </div>
          </div>
        </div>
      </div>
    `;
    $userBooks.append(bookCard);
  });
}
