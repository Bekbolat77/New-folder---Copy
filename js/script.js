// ========================================
// MODERN JAVASCRIPT REWRITE - 2025
// ========================================

class LibraryManager {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupApp());
    } else {
      this.setupApp();
    }
  }

  setupApp() {
    this.setupScrollEffects();
    this.setupDateTime();
    this.setupAnimatedCounters();
    this.setupDarkMode();
    this.setupBookSearch();
    this.setupEventHandlers();
    this.setupLazyLoading();
    this.loadUserBooks();
  }

  // ========================================
  // SCROLL EFFECTS
  // ========================================
  
  setupScrollEffects() {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  handleScroll() {
    const navbar = document.querySelector('.navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    
    // Navbar shadow
    if (window.scrollY > 10) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
    
    // Progress bar
    if (scrollProgress) {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      scrollProgress.style.width = `${scrollPercent}%`;
    }
  }

  // ========================================
  // DATE & TIME
  // ========================================
  
  setupDateTime() {
    const dateTimeElement = document.getElementById('currentDateTime');
    if (!dateTimeElement) return;

    const updateTime = () => {
      const now = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      dateTimeElement.innerHTML = `📅 ${now.toLocaleDateString('en-US', options)}`;
    };

    updateTime();
    this.dateTimeInterval = setInterval(updateTime, 1000);
  }

  // ========================================
  // ANIMATED COUNTERS
  // ========================================
  
  setupAnimatedCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const animateCounter = (element) => {
      const target = parseInt(element.dataset.count);
      const duration = 2500;
      const increment = target / (duration / 16); // 60fps
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          element.textContent = Math.ceil(current).toLocaleString();
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target.toLocaleString();
        }
      };

      updateCounter();
    };

    // Use Intersection Observer for better performance
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  // ========================================
  // DARK MODE
  // ========================================
  
  setupDarkMode() {
    const toggleButtons = document.querySelectorAll('#toggleDarkModeBtn, #modeToggle');
    
    // Load saved theme
    const savedTheme = localStorage.getItem('digitalReadsTheme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      const checkbox = document.getElementById('modeToggle');
      if (checkbox) checkbox.checked = true;
      this.updateDarkModeButton(true);
    }

    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => this.toggleDarkMode(e));
      if (button.type === 'checkbox') {
        button.addEventListener('change', (e) => this.toggleDarkMode(e));
      }
    });
  }

  toggleDarkMode(e) {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    localStorage.setItem('digitalReadsTheme', isDark ? 'dark' : 'light');
    this.updateDarkModeButton(isDark);
    this.showToast(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
  }

  updateDarkModeButton(isDark) {
    const button = document.getElementById('toggleDarkModeBtn');
    if (button) {
      button.textContent = isDark ? '☀️ Toggle Light Mode' : '🌙 Toggle Dark Mode';
    }
  }

  // ========================================
  // TOAST NOTIFICATIONS
  // ========================================
  
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
      background: 'var(--card-bg)',
      color: 'var(--text-color)',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-hover)',
      zIndex: '9999',
      animation: 'slideInRight 0.3s ease',
      borderLeft: '4px solid',
      borderImage: 'var(--gradient) 1'
    });
    
    // Add ARIA attributes for accessibility
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ========================================
  // BOOK SEARCH & AUTOCOMPLETE
  // ========================================
  
  setupBookSearch() {
    const searchInput = document.getElementById('searchBooks');
    const autocompleteList = document.getElementById('autocompleteList');
    
    if (!searchInput) return;

    // Debounce search input
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.performSearch(e.target.value), 300);
    });

    // Handle autocomplete clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('autocomplete-item')) {
        const title = e.target.dataset.title;
        searchInput.value = title;
        autocompleteList.innerHTML = '';
        this.filterBooks(title);
      } else if (!e.target.closest('#searchBooks, #autocompleteList')) {
        autocompleteList.innerHTML = '';
      }
    });

    // Keyboard navigation for autocomplete
    searchInput.addEventListener('keydown', (e) => this.handleAutocompleteKeys(e));
  }

  performSearch(searchTerm) {
    const bookItems = document.querySelectorAll('.book-item');
    const autocompleteList = document.getElementById('autocompleteList');
    
    if (!autocompleteList) return;
    
    autocompleteList.innerHTML = '';
    const term = searchTerm.toLowerCase().trim();

    if (term.length === 0) {
      bookItems.forEach(item => item.style.display = '');
      return;
    }

    const matches = [];
    bookItems.forEach(item => {
      const title = item.dataset.title?.toLowerCase() || '';
      const author = item.dataset.author?.toLowerCase() || '';
      
      if (title.includes(term) || author.includes(term)) {
        item.style.display = '';
        matches.push({
          title: item.dataset.title,
          author: item.dataset.author
        });
      } else {
        item.style.display = 'none';
      }
    });

    // Show autocomplete (max 5 items)
    if (matches.length > 0 && matches.length <= 5) {
      matches.forEach(match => {
        const button = document.createElement('button');
        button.className = 'list-group-item list-group-item-action autocomplete-item';
        button.dataset.title = match.title;
        button.innerHTML = `${match.title} <small class="text-muted">by ${match.author}</small>`;
        autocompleteList.appendChild(button);
      });
    }
  }

  handleAutocompleteKeys(e) {
    const items = document.querySelectorAll('.autocomplete-item');
    if (items.length === 0) return;

    const active = document.querySelector('.autocomplete-item.active');
    let index = Array.from(items).indexOf(active);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      index = (index + 1) % items.length;
      items.forEach(item => item.classList.remove('active'));
      items[index].classList.add('active');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      index = index <= 0 ? items.length - 1 : index - 1;
      items.forEach(item => item.classList.remove('active'));
      items[index].classList.add('active');
    } else if (e.key === 'Enter' && active) {
      e.preventDefault();
      active.click();
    }
  }

  filterBooks(title) {
    const bookItems = document.querySelectorAll('.book-item');
    bookItems.forEach(item => {
      item.style.display = item.dataset.title === title ? '' : 'none';
    });
  }

  // ========================================
  // EVENT HANDLERS (Delegation)
  // ========================================
  
  setupEventHandlers() {
    // Use event delegation for all dynamic elements
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // Read book button
      if (target.classList.contains('read-book-btn') || target.closest('.read-book-btn')) {
        e.preventDefault();
        this.handleReadBook(target.closest('.read-book-btn') || target);
      }

      // Remove book button
      if (target.classList.contains('remove-book')) {
        this.handleRemoveBook(target);
      }

      // Copy quote button
      if (target.classList.contains('copy-quote')) {
        this.handleCopyQuote(target);
      }

      // Subscribe button
      if (target.id === 'subscribeBtn') {
        this.handleSubscribe();
      }

      // Event registration buttons
      if (target.classList.contains('btn-primary')) {
        this.handleEventButton(target, e);
      }
    });

    // Form submissions
    this.setupFormHandlers();
  }

  handleReadBook(button) {
    const card = button.closest('.card');
    if (!card) return;

    const title = card.querySelector('.card-title')?.textContent.trim() || '';
    const authorEl = card.querySelector('.card-text.small');
    const author = authorEl ? authorEl.textContent.replace('by ', '').trim() : '';
    const image = card.querySelector('img')?.src || '';

    const book = {
      title,
      author,
      image,
      dateAdded: new Date().toISOString()
    };

    // Sanitize and save
    const sanitizedBook = this.sanitizeBookData(book);
    const myBooks = this.getFromStorage('myBooks') || [];
    
    const exists = myBooks.some(b => 
      b.title === sanitizedBook.title && b.author === sanitizedBook.author
    );

    if (!exists) {
      myBooks.push(sanitizedBook);
      this.saveToStorage('myBooks', myBooks);
      this.showToast(`✅ "${title}" added to My Books!`);
    } else {
      this.showToast(`📚 "${title}" is already in your library!`);
    }

    setTimeout(() => {
      this.showToast(`📖 Opening "${title}"...`);
    }, 1500);
  }

  handleRemoveBook(button) {
    const bookCard = button.closest('.col-md-4');
    if (!bookCard) return;

    bookCard.style.opacity = '0';
    bookCard.style.transition = 'opacity 0.3s';
    
    setTimeout(() => {
      bookCard.remove();
      
      const userBooks = document.getElementById('userBooks');
      if (userBooks && userBooks.children.length === 0) {
        userBooks.innerHTML = `
          <div class="col-12 text-center text-muted">
            <p>No books added yet. Start building your collection!</p>
          </div>
        `;
      }
    }, 300);
    
    this.showToast('🗑️ Book removed');
  }

  handleCopyQuote(button) {
    const quote = button.dataset.quote;
    if (!quote) return;

    navigator.clipboard.writeText(quote)
      .then(() => this.showToast('📋 Quote copied to clipboard!'))
      .catch(() => this.showToast('❌ Failed to copy quote'));
  }

  handleSubscribe() {
    const modalEl = document.getElementById('subscribeModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  handleEventButton(button, e) {
    const btnText = button.textContent.trim();
    
    if (/Register|Join|Sign Up|RSVP/.test(btnText)) {
      e.preventDefault();
      this.showToast('✅ Successfully registered for the event!');
    }
    
    if (/Read More|Read Article/.test(btnText)) {
      e.preventDefault();
      this.showToast('📰 Loading article...');
    }
  }

  // ========================================
  // FORM HANDLERS
  // ========================================
  
  setupFormHandlers() {
    // Add book form
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
      addBookForm.addEventListener('submit', (e) => this.handleAddBook(e));
    }

    // Registration form
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
      registrationForm.addEventListener('submit', (e) => this.handleRegistration(e));
    }

    // Subscribe form
    const subscribeForm = document.getElementById('subscribeForm');
    if (subscribeForm) {
      subscribeForm.addEventListener('submit', (e) => this.handleSubscribeForm(e));
    }
  }

  handleAddBook(e) {
    e.preventDefault();
    
    const form = e.target;
    const title = document.getElementById('bookTitle')?.value.trim() || '';
    const author = document.getElementById('bookAuthor')?.value.trim() || '';

    // Validation
    if (title.length < 2) {
      this.showToast('❌ Title must be at least 2 characters');
      return;
    }

    if (author.length < 2) {
      this.showToast('❌ Author name must be at least 2 characters');
      return;
    }

    // Check duplicates
    const myBooks = this.getFromStorage('myBooks') || [];
    if (myBooks.some(b => b.title.toLowerCase() === title.toLowerCase())) {
      this.showToast('⚠️ This book is already in your library');
      return;
    }

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const buttonText = submitButton?.querySelector('#addBookText');
    const spinner = submitButton?.querySelector('#addBookSpinner');
    
    if (buttonText) buttonText.classList.add('d-none');
    if (spinner) spinner.classList.remove('d-none');

    // Simulate API call
    setTimeout(() => {
      const userBooks = document.getElementById('userBooks');
      
      // Remove empty message
      const emptyMessage = userBooks?.querySelector('.col-12');
      if (emptyMessage) emptyMessage.remove();

      // Add book card
      if (userBooks) {
        const bookCard = this.createBookCard(title, author);
        userBooks.insertAdjacentHTML('beforeend', bookCard);
      }

      // Reset form
      form.reset();
      if (buttonText) buttonText.classList.remove('d-none');
      if (spinner) spinner.classList.add('d-none');

      this.showToast('✅ Book added successfully!');
    }, 1000);
  }

  createBookCard(title, author) {
    const escapedTitle = this.escapeHtml(title);
    const escapedAuthor = this.escapeHtml(author);
    
    return `
      <div class="col-md-4">
        <div class="card" style="animation-delay: 0s;">
          <div class="card-body">
            <h5 class="card-title">${escapedTitle}</h5>
            <p class="card-text text-muted">by ${escapedAuthor}</p>
            <button class="btn btn-sm btn-outline-danger remove-book">Remove</button>
          </div>
        </div>
      </div>
    `;
  }

  handleRegistration(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = document.getElementById('email')?.value || '';
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';

    // Clear previous validation
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailInput = document.getElementById('email');
    if (!emailRegex.test(email)) {
      emailInput?.classList.add('is-invalid');
      isValid = false;
    }

    // Password validation
    const passwordInput = document.getElementById('password');
    if (password.length < 6) {
      passwordInput?.classList.add('is-invalid');
      isValid = false;
    }

    // Confirm password
    const confirmInput = document.getElementById('confirmPassword');
    if (password !== confirmPassword) {
      confirmInput?.classList.add('is-invalid');
      const feedback = confirmInput?.nextElementSibling;
      if (feedback) feedback.textContent = 'Passwords must match';
      isValid = false;
    }

    if (!isValid) {
      this.showToast('❌ Please fix the errors in the form');
      return;
    }

    // Show loading state
    const registerText = document.getElementById('registerText');
    const registerSpinner = document.getElementById('registerSpinner');
    
    if (registerText) registerText.classList.add('d-none');
    if (registerSpinner) registerSpinner.classList.remove('d-none');

    // Simulate registration
    setTimeout(() => {
      if (registerText) registerText.classList.remove('d-none');
      if (registerSpinner) registerSpinner.classList.add('d-none');
      
      const successMsg = document.getElementById('registrationSuccess');
      if (successMsg) successMsg.classList.remove('d-none');
      
      form.reset();
      this.showToast('✅ Registration successful!');
    }, 2000);
  }

  handleSubscribeForm(e) {
    e.preventDefault();
    
    const email = document.getElementById('subscriberEmail')?.value || '';
    
    if (email) {
      this.showToast('✅ Successfully subscribed to newsletter!');
      
      const modalEl = document.getElementById('subscribeModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      }
      
      e.target.reset();
    }
  }

  // ========================================
  // LOCAL STORAGE HELPERS
  // ========================================
  
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        this.showToast('❌ Storage limit exceeded');
      } else {
        this.showToast('❌ Failed to save data');
      }
      return false;
    }
  }

  getFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to retrieve data:', e);
      return null;
    }
  }

  sanitizeBookData(book) {
    return {
      title: this.escapeHtml(book.title),
      author: this.escapeHtml(book.author),
      image: book.image,
      dateAdded: book.dateAdded
    };
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ========================================
  // LOAD USER BOOKS
  // ========================================
  
  loadUserBooks() {
    const userBooks = document.getElementById('userBooks');
    if (!userBooks) return;

    const myBooks = this.getFromStorage('myBooks') || [];
    
    if (myBooks.length === 0) return;

    // Clear empty message
    userBooks.innerHTML = '';

    myBooks.forEach(book => {
      const card = this.createBookCard(book.title, book.author);
      userBooks.insertAdjacentHTML('beforeend', card);
    });
  }

  // ========================================
  // LAZY LOADING
  // ========================================
  
  setupLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        if (!img.src && img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    } else {
      // Fallback: Use Intersection Observer
      this.setupLazyLoadingFallback();
    }
  }

  setupLazyLoadingFallback() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // ========================================
  // CLEANUP
  // ========================================
  
  destroy() {
    if (this.dateTimeInterval) {
      clearInterval(this.dateTimeInterval);
    }
  }
}

// Initialize the app
const libraryManager = new LibraryManager();

// Make showToast globally accessible for compatibility
window.showToast = (message) => libraryManager.showToast(message);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  libraryManager.destroy();
});
