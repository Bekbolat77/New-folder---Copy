// ========================================
// MY_BOOKS.JS - Modern ES6+ Rewrite
// User's Book Collection Manager
// ========================================

class MyBooksManager {
  constructor() {
    this.storageKey = 'myBooks';
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.loadMyBooks();
    this.setupEventListeners();
    this.setupBookStats();
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================

  setupEventListeners() {
    // Add book form submission
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
      addBookForm.addEventListener('submit', (e) => this.handleAddBook(e));
    }

    // Event delegation for dynamic buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-book') || e.target.closest('.remove-book')) {
        this.handleRemoveBook(e.target.closest('.remove-book') || e.target);
      }

      if (e.target.id === 'clearAllBooks') {
        this.handleClearAllBooks();
      }

      if (e.target.classList.contains('read-book-btn')) {
        this.handleContinueReading(e.target);
      }
    });

    // Search/filter functionality (if you want to add it)
    const searchInput = document.getElementById('searchMyBooks');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => this.filterBooks(e.target.value), 300);
      });
    }
  }

  // ========================================
  // ADD BOOK HANDLER
  // ========================================

  async handleAddBook(e) {
    e.preventDefault();

    const form = e.target;
    const titleInput = document.getElementById('bookTitle');
    const authorInput = document.getElementById('bookAuthor');
    
    const title = titleInput?.value.trim() || '';
    const author = authorInput?.value.trim() || '';

    // Validation
    if (!this.validateBookInput(title, author)) {
      return;
    }

    // Show loading state
    this.toggleFormLoading(true);

    // Simulate async operation (replace with actual API call if needed)
    await this.delay(1000);

const linkInput = document.getElementById('bookLink'); 
const link = linkInput?.value?.trim() || ''; 

const book = {
  id: this.generateBookId(),
  title: this.escapeHtml(title),
  author: this.escapeHtml(author),
  image: this.generatePlaceholderImage(title),
  link: link, 
  dateAdded: new Date().toISOString(),
  lastRead: null,
  readingProgress: 0,
  notes: []
};

    const myBooks = this.getBooksFromStorage();

    // Check for duplicates
    if (this.isDuplicateBook(myBooks, title, author)) {
      this.showToast('⚠️ This book is already in your library');
      this.toggleFormLoading(false);
      return;
    }

    // Add book
    myBooks.push(book);
    
    if (this.saveBooksToStorage(myBooks)) {
      this.loadMyBooks();
      form.reset();
      this.showToast('✅ Book added successfully!');
      
      // Scroll to the new book
      setTimeout(() => this.scrollToLatestBook(), 300);
    }

    this.toggleFormLoading(false);
  }

  // ========================================
  // REMOVE BOOK HANDLER
  // ========================================

  handleRemoveBook(button) {
    const title = button.dataset.title;
    const author = button.dataset.author;
    const bookId = button.dataset.id;

    if (!title || !author) return;

    // Add confirmation with book details
    const confirmMessage = `Remove "${title}" by ${author} from your library?`;
    
    if (!confirm(confirmMessage)) return;

    let myBooks = this.getBooksFromStorage();
    
    // Remove by ID if available, otherwise by title+author
    if (bookId) {
      myBooks = myBooks.filter(book => book.id !== bookId);
    } else {
      myBooks = myBooks.filter(book => 
        !(book.title === title && book.author === author)
      );
    }

    if (this.saveBooksToStorage(myBooks)) {
      // Animate removal
      const bookCard = button.closest('.col-md-4, .col-lg-3');
      if (bookCard) {
        bookCard.style.opacity = '0';
        bookCard.style.transform = 'scale(0.9)';
        bookCard.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
          this.loadMyBooks();
          this.showToast('🗑️ Book removed from library');
        }, 300);
      }
    }
  }

  // ========================================
  // CLEAR ALL BOOKS
  // ========================================

  handleClearAllBooks() {
    const myBooks = this.getBooksFromStorage();
    
    if (myBooks.length === 0) {
      this.showToast('📚 Your library is already empty');
      return;
    }

    const message = `Are you sure you want to remove all ${myBooks.length} book(s) from your library? This action cannot be undone.`;
    
    if (confirm(message)) {
      localStorage.removeItem(this.storageKey);
      this.loadMyBooks();
      this.showToast('🗑️ All books removed from library');
    }
  }

  // ========================================
  // CONTINUE READING HANDLER
  // ========================================

  handleContinueReading(button) {
    const card = button.closest('.card');
    if (!card) return;

    const title = card.querySelector('.card-title')?.textContent.trim();
    const bookId = button.dataset.id;

    if (bookId) {
      // Update last read timestamp
      const myBooks = this.getBooksFromStorage();
      const book = myBooks.find(b => b.id === bookId);
      
      if (book) {
        book.lastRead = new Date().toISOString();
        this.saveBooksToStorage(myBooks);
      }
    }

    this.showToast(`📖 Opening "${title}"...`);
    
    // Simulate opening reading view (replace with actual navigation)
    setTimeout(() => {
      // window.location.href = `/read/${bookId}`;
      this.showToast(`✨ Enjoy reading!`);
    }, 1000);
  }

  // ========================================
  // LOAD AND DISPLAY BOOKS
  // ========================================

  loadMyBooks() {
    const myBooks = this.getBooksFromStorage();
    const userBooksContainer = document.getElementById('userBooks');
    
    if (!userBooksContainer) return;

    // Update statistics
    this.updateBookStats(myBooks);

    // Clear container
    userBooksContainer.innerHTML = '';

    // Show empty state
    if (myBooks.length === 0) {
      this.showEmptyState(userBooksContainer);
      return;
    }

    // Sort books (most recent first)
    const sortedBooks = this.sortBooks(myBooks);

    // Create book cards
    const fragment = document.createDocumentFragment();
    
    sortedBooks.forEach((book, index) => {
      const bookElement = this.createBookCard(book, index);
      fragment.appendChild(bookElement);
    });

    userBooksContainer.appendChild(fragment);
  }

  // ========================================
  // CREATE BOOK CARD
  // ========================================

  createBookCard(book, index) {
  const col = document.createElement('div');
  col.className = 'col-md-4 col-lg-3';
  col.style.animationDelay = `${index * 0.1}s`;

  const dateAdded = new Date(book.dateAdded).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const progressBar = book.readingProgress > 0 ? `
    <div class="progress mb-2" style="height: 4px;">
      <div class="progress-bar" role="progressbar" style="width: ${book.readingProgress}%" 
           aria-valuenow="${book.readingProgress}" aria-valuem="0" aria-valuemax="100"></div>
    </div>
    <small class="text-muted">${book.readingProgress}% complete</small>
  ` : '';

  col.innerHTML = `
    <div class="card h-100 book-card" data-book-id="${book.id || ''}">
      <img src="${book.image}" class="card-img-top" alt="${book.title}" loading="lazy" />
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${book.title}</h5>
        <p class="card-text small text-muted mb-2">by ${book.author}</p>
        <div class="mt-auto">
          ${
  book.link
    ? `<button class="btn btn-sm btn-primary w-100 mb-2 read-book-btn" data-link="${book.link}">📖 Read Book</button>`
    : `<button class="btn btn-sm btn-secondary w-100 mb-2" disabled>📕 PDF not available</button>`
}
          <!-- ... other controls ... -->
        </div>
      </div>
    </div>`;
  return col;
}




  // ========================================
  // EMPTY STATE
  // ========================================

  showEmptyState(container) {
    container.innerHTML = `
      <div class="col-12 text-center text-muted py-5" id="emptyMessage">
        <div class="mb-4">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </div>
        <h4>Your Library is Empty</h4>
        <p class="mb-4">Start reading books to build your collection!</p>
        <a href="books.html" class="btn btn-primary">
          Browse Books
        </a>
      </div>
    `;
  }

  // ========================================
  // STATISTICS & ANALYTICS
  // ========================================

  updateBookStats(books) {
    const bookCountEl = document.getElementById('bookCount');
    if (bookCountEl) {
      bookCountEl.textContent = books.length;
    }

    const totalBooksEl = document.getElementById('totalBooks');
    if (totalBooksEl) {
      totalBooksEl.textContent = books.length;
    }

    // Calculate reading progress
    const booksInProgress = books.filter(b => b.readingProgress > 0 && b.readingProgress < 100).length;
    const booksCompleted = books.filter(b => b.readingProgress === 100).length;

    const inProgressEl = document.getElementById('booksInProgress');
    if (inProgressEl) {
      inProgressEl.textContent = booksInProgress;
    }

    const completedEl = document.getElementById('booksCompleted');
    if (completedEl) {
      completedEl.textContent = booksCompleted;
    }
  }

  setupBookStats() {
    const books = this.getBooksFromStorage();
    this.updateBookStats(books);
  }

  // ========================================
  // FILTERING & SORTING
  // ========================================

  filterBooks(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const bookCards = document.querySelectorAll('.book-card');

    bookCards.forEach(card => {
      const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
      const author = card.querySelector('.card-text')?.textContent.toLowerCase() || '';
      
      const matches = title.includes(term) || author.includes(term);
      const col = card.closest('.col-md-4, .col-lg-3');
      
      if (col) {
        col.style.display = matches ? '' : 'none';
      }
    });

    // Show "no results" message if needed
    const visibleCards = Array.from(bookCards).filter(card => {
      const col = card.closest('.col-md-4, .col-lg-3');
      return col && col.style.display !== 'none';
    });

    if (visibleCards.length === 0 && term.length > 0) {
      this.showNoResultsMessage();
    } else {
      this.removeNoResultsMessage();
    }
  }

  sortBooks(books, sortBy = 'dateAdded', order = 'desc') {
    return [...books].sort((a, b) => {
      let compareA = a[sortBy];
      let compareB = b[sortBy];

      if (sortBy === 'title' || sortBy === 'author') {
        compareA = compareA.toLowerCase();
        compareB = compareB.toLowerCase();
      }

      if (order === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
  }

  // ========================================
  // VALIDATION & HELPERS
  // ========================================

  validateBookInput(title, author) {
    if (!title || title.length < 2) {
      this.showToast('❌ Title must be at least 2 characters');
      return false;
    }

    if (!author || author.length < 2) {
      this.showToast('❌ Author name must be at least 2 characters');
      return false;
    }

    if (title.length > 100) {
      this.showToast('❌ Title is too long (max 100 characters)');
      return false;
    }

    if (author.length > 50) {
      this.showToast('❌ Author name is too long (max 50 characters)');
      return false;
    }

    return true;
  }

  isDuplicateBook(books, title, author) {
    return books.some(book => 
      book.title.toLowerCase() === title.toLowerCase() && 
      book.author.toLowerCase() === author.toLowerCase()
    );
  }

  generateBookId() {
    return `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generatePlaceholderImage(title) {
    const encodedTitle = encodeURIComponent(title.substring(0, 20));
    return `https://via.placeholder.com/400x260/667eea/ffffff?text=${encodedTitle}`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  scrollToLatestBook() {
    const userBooks = document.getElementById('userBooks');
    const firstBook = userBooks?.querySelector('.col-md-4, .col-lg-3');
    if (firstBook) {
      firstBook.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // ========================================
  // STORAGE OPERATIONS
  // ========================================

  getBooksFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load books:', e);
      this.showToast('❌ Error loading books');
      return [];
    }
  }

  saveBooksToStorage(books) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(books));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        this.showToast('❌ Storage limit exceeded. Please remove some books.');
      } else {
        this.showToast('❌ Failed to save books');
      }
      console.error('Storage error:', e);
      return false;
    }
  }

  // ========================================
  // UI HELPERS
  // ========================================

  toggleFormLoading(isLoading) {
    const addBookText = document.getElementById('addBookText');
    const addBookSpinner = document.getElementById('addBookSpinner');

    if (isLoading) {
      addBookText?.classList.add('d-none');
      addBookSpinner?.classList.remove('d-none');
    } else {
      addBookText?.classList.remove('d-none');
      addBookSpinner?.classList.add('d-none');
    }
  }

  showNoResultsMessage() {
    const userBooks = document.getElementById('userBooks');
    const existing = document.getElementById('noResultsMessage');
    
    if (existing || !userBooks) return;

    const message = document.createElement('div');
    message.id = 'noResultsMessage';
    message.className = 'col-12 text-center text-muted py-4';
    message.innerHTML = `
      <p>No books found matching your search.</p>
    `;
    userBooks.appendChild(message);
  }

  removeNoResultsMessage() {
    const message = document.getElementById('noResultsMessage');
    if (message) message.remove();
  }

  showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = message;

    Object.assign(toast.style, {
      position: 'fixed',
      top: '90px',
      right: '20px',
      background: 'var(--card-bg, #fff)',
      color: 'var(--text-color, #333)',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: '9999',
      animation: 'slideInRight 0.3s ease',
      borderLeft: '4px solid #667eea'
    });

    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// ========================================
// EXPORT & IMPORT FUNCTIONALITY
// ========================================

class BookExporter {
  static exportToJSON(books) {
    const dataStr = JSON.stringify(books, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `my-books-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }

  static importFromJSON(file, callback) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const books = JSON.parse(e.target.result);
        if (Array.isArray(books)) {
          callback(books);
        } else {
          throw new Error('Invalid format');
        }
      } catch (error) {
        alert('Failed to import books. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
  }
}

// ========================================
// INITIALIZE
// ========================================

const myBooksManager = new MyBooksManager();

// Make globally accessible
window.myBooksManager = myBooksManager;
window.BookExporter = BookExporter;

// Add CSS animation if not already present
if (!document.querySelector('#bookCardAnimation')) {
  const style = document.createElement('style');
  style.id = 'bookCardAnimation';
  style.textContent = `
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .book-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .book-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
  `;
  document.head.appendChild(style);
}
$(document).on('click', '.read-book-btn', function () {
  const link = $(this).data('link');
  if (link) {
    window.open(link, '_blank');
  } else {
    alert('No link found for this book!');
  }
});
