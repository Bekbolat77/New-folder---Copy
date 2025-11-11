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
    this.updateNavbarAuth();
    this.loadEventButtonStates();
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
      button.textContent = isDark ? '☀️' : '🌙';
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

//Add book


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

      if (target.classList.contains('event-register-btn')) {
        this.handleEventRegistration(target);
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
  // AUTHENTICATION METHODS
  // ========================================

  updateNavbarAuth() {
    const currentUser = this.getFromStorage('digitalReadsUser');
    const authItem = document.getElementById('authItem');
    
    if (!authItem) return;
    
    if (currentUser) {
      authItem.innerHTML = `
        <div class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            👤 ${currentUser.fullName}
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li><a class="dropdown-item" href="profile.html">My Profile</a></li>
            <li><a class="dropdown-item" href="my_books.html">My Books</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" id="navLogoutBtn">Log Out</a></li>
          </ul>
        </div>
      `;
      
      setTimeout(() => {
        document.getElementById('navLogoutBtn')?.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleLogout();
        });
      }, 100);
    } else {
      authItem.innerHTML = `<a class="nav-link" href="profile.html">Sign In</a>`;
    }
  }

  handleLogout() {
    localStorage.removeItem('digitalReadsUser');
    this.showToast('👋 Logged out successfully.');
    this.updateNavbarAuth();
    
    if (!window.location.href.includes('index.html')) {
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  }

  // ========================================
  // EVENT REGISTRATION METHODS
  // ========================================

  handleEventRegistration(button) {
    const currentUser = this.getFromStorage('digitalReadsUser');
    
    if (!currentUser) {
      this.showToast('🔐 Please log in to register for events');
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 1500);
      return;
    }
    
    const eventId = button.dataset.eventId;
    const eventTitle = button.dataset.eventTitle;
    const originalText = button.textContent;
    
    let userEvents = this.getFromStorage('userEvents') || {};
    const userId = currentUser.email;
    
    if (!userEvents[userId]) {
      userEvents[userId] = [];
    }
    
    const isAlreadyRegistered = userEvents[userId].some(event => event.id === eventId);
    
    if (isAlreadyRegistered) {
      this.showToast(`ℹ️ You're already registered for: ${eventTitle}`);
      button.textContent = '✓ ' + this.getRegisteredText(originalText);
      button.classList.remove('btn-primary');
      button.classList.add('btn-success');
      button.disabled = true;
      return;
    }
    
    const eventData = {
      id: eventId,
      title: eventTitle,
      originalButtonText: originalText,
      registeredAt: new Date().toISOString(),
      status: 'registered'
    };
    
    userEvents[userId].push(eventData);
    this.saveToStorage('userEvents', userEvents);
    
    button.textContent = '✓ ' + this.getRegisteredText(originalText);
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');
    button.disabled = true;
    
    this.showToast(`✅ Successfully registered for: ${eventTitle}`);
    this.saveUserEventRegistration(eventData);
  }

  getRegisteredText(originalText) {
    const textMap = {
      'Register Now': 'Registered',
      'Join Discussion': 'Joined',
      'Sign Up': 'Signed Up', 
      'Accept Challenge': 'Challenge Accepted',
      'RSVP': 'RSVP Confirmed',
      'View Schedule': 'Schedule Saved'
    };
    return textMap[originalText] || 'Registered';
  }

  saveUserEventRegistration(eventData) {
    let myEvents = this.getFromStorage('myEvents') || [];
    const exists = myEvents.some(event => event.id === eventData.id);
    if (!exists) {
      myEvents.push(eventData);
      this.saveToStorage('myEvents', myEvents);
    }
  }

  loadEventButtonStates() {
    const currentUser = this.getFromStorage('digitalReadsUser');
    if (!currentUser) return;
    
    const userEvents = this.getFromStorage('userEvents') || {};
    const userEventIds = userEvents[currentUser.email]?.map(event => event.id) || [];
    
    document.querySelectorAll('.event-register-btn').forEach(button => {
      const eventId = button.dataset.eventId;
      if (userEventIds.includes(eventId)) {
        const originalText = button.textContent;
        button.textContent = '✓ ' + this.getRegisteredText(originalText);
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');
        button.disabled = true;
      }
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


// Language Selection

  

// 🌐 Language Translations Dictionary
// 1. Your translation dictionary
const translations = {
  KAZ: {
    heroTitle: "Digital Reads-ға қош келдіңіз",
    heroLead: "Заманауи білім мен әдебиет әлеміне жол",
    booksAvailableLabel: "Кітаптар саны",
    eventsHostedLabel: "Өткізілген мерекелер",
    activeMembersLabel: "Белсенді жазылушылар",
    featuredBooksTitle: "Таңдаулы кітаптар",
    aboutTitle: "Digital Reads туралы",
    aboutLead: "Оқырмандарға әлемдік білімге сандық қолжетімділікті қамтамасыз ету",
    missionTitle: "Біздің Миссиямыз",
    missionText: "Digital Reads - оқу сүйіспеншілігін ынталандыратын инновациялық онлайн кітапхана. Біз әркімге білімді қолжетімді етеміз.",
    visionTitle: "Біздің Көзқарасымыз",
    blogTitle: "Блог және Сарапшылар ойлары",
    blogLead: "Сарапшылар пікірі, оқу кеңестері және әдеби талдау",
    badge1: "Оқу кеңестері",
    blog1Title: "Сандық кітапханалардың болашағы",
    blog1Meta: "Сара Джонсон • 5 мин оқу",
    blog1Text: "Технологиялар кітаптарды табу, оқу және бөлісу тәсілін қалай өзгертетінін зерттеу.",
    blog1Button: "Мақаланы оқу",
    badge2: "Кітап пікірлері",
    blog2Title: "2025 жылғы 10 маңызды кітап",
    blog2Meta: "Майкл Чен • 8 мин оқу",
    blog2Text: "Жылдың маңызды әдебиеттерінің арнайы таңдауы.",
    blog2Button: "Мақаланы оқу",
    badge3: "Жазу өнері",
    blog3Title: "Тиімді оқу кеңестері",
    blog3Meta: "Эмма Уотсон • 6 мин оқу",
    blog3Text: "Оқуды ойдағыдай түсіну мен естеп сақтау қабілетін арттыру үшін кеңестер.",
    blog3Button: "Мақаланы оқу",
    badge4: "Әдеби талдау",
    blog4Title: "Классикалық әдебиетті түсіну",
    blog4Meta: "Дэвид Ким • 10 мин оқу",
    blog4Text: "Классикалық әдебиетті мәңгілік және заманауи ететін тақырыптар мен тәсілдерді талдау.",
    blog4Button: "Мақаланы оқу",
     catalogTitle: "Кітаптар Каталогы",
    searchBooks: "🔍 Кітаптарды атауы немесе авторы арқылы іздеу...",
    featuredBooksTitle: "Таңдаулы кітаптар",
    badge1: "Классика",
    title1: "Көшпенділер",
    author1: "Илияс Есенберлин",
    readBtn1: "📖 Кітапты оқу",
    badge2: "Дистопия",
    title2: "React үйрену",
    author2: "Алекс Бэнкс және Ив Порселло",
    readBtn2: "📖 Кітапты оқу",
    badge3: "Классика",
    title3: "Питон бастаушыларға",
    author3: "Ерик Маттес",
    readBtn3: "📖 Кітапты оқу",
    badge4: "Романтика",
    title4: "Тәкаппарлық пен кескін",
    author4: "Джейн Остин",
    readBtn4: "📖 Кітапты оқу",
    badge5: "Өсу шағы",
    title5: "Шалғайдағы күзетші",
    author5: "Дж. Д. Сэлинджер",
    readBtn5: "📖 Кітапты оқу",
    badge6: "Фэнтези",
    title6: "Хоббит",
    author6: "Дж. Р.Р. Толкин",
    readBtn6: "📖 Кітапты оқу",
    detailsInstruction: "Кітаптың толық ақпаратын көру үшін таңдаңыз",
    visionText: "Әлемнің жетекші цифрлық кітапханасы болу – миллиондаған оқырмандарды және білім ізденушілер қауымдастығын ұсыну.",
    faqTitle: "Жиі қойылатын сұрақтар",
     eventsTitle: "Алда өтетін іс-шаралар",
    eventsLead: "Қауымдастық іс-шараларына қосылыңыз және оқырмандармен танысыңыз",
    eventBadge1: "Автор кездесу",
    eventTitle1: "Автормен кездесу: Цифрлық оқырман",
    eventDate1: "📅 15 қараша 2025 • 🕕 18:00 EST",
    eventText1: "Танымал автор Джейн Доумен интерактивті сессия, цифрлық оқу әдеттері мен жаңа \"Connected Pages\" романы туралы.",
    eventBtn1: "Тіркелу",
    eventBadge2: "Кітап клубы",
    eventTitle2: "Қараша айының виртуалды кітап клубы",
    eventDate2: "📅 25 қараша 2025 • 🕖 19:00 EST",
    eventText2: "Мақсаттарыңызды қойып, оқу барысын бақылап, жетістіктерге жетіңіз!",
    eventBtn2: "Талқылауға қосылу",
    eventBadge3: "Шеберлік сағаты",
    eventTitle3: "Шығармашылық жазу сабағы",
    eventDate3: "📅 5 желтоқсан 2025 • 🕔 17:00 EST",
    eventText3: "Әңгіме айту және кейіпкер жасау негіздерін үйреніңіз.",
    eventBtn3: "Тіркелу",
    eventBadge4: "Қауымдастық іс-шарасы",
    eventTitle4: "Жыл қорытындысы оқу сынағы",
    eventDate4: "📅 1-31 желтоқсан 2025 • Күні бойы",
    eventText4: "Жыл сайынғы оқу сынағына қатысыңыз!",
    eventBtn4: "Қатысу",
    eventBadge5: "Өнер және әдебиет",
    eventTitle5: "Мұқаба дизайны көрмесі",
    eventDate5: "📅 10 желтоқсан 2025 • 🕕 18:30 EST",
    eventText5: "Кәсіби кітап мұқаба дизайнерлерінен шығармашылық үдеріс туралы біліңіз.",
    eventBtn5: "Тіркелу",
    eventBadge6: "Жаһандық оқу",
    eventTitle6: "Әлем әдебиеті фестивалі",
    eventDate6: "📅 15-17 желтоқсан 2025 • Түрлі уақыттарда",
    eventText6: "Үш күндік ғаламдық әдебиет фестивалі, авторлар мен оқырмандар қатысады.",
    eventBtn6: "Кестені көру"
  },
  RUS: {
    heroTitle: "Добро пожаловать в Digital Reads",
    heroLead: "Ваш современный портал к знаниям и литературным приключениям",
    booksAvailableLabel: "Доступно книг",
    eventsHostedLabel: "Проведено событий",
    activeMembersLabel: "Активные участники",
     catalogTitle: "Каталог книг",
    searchBooks: "🔍 Поиск по названию или автору...",
    featuredBooksTitle: "Избранные книги",
    badge1: "Классика",
    title1: "Кочевники",
    author1: "Илияс Есенберлин",
    readBtn1: "📖 Читать книгу",
    badge2: "Антиутопия",
    title2: "React изучение",
    author2: "Алекс Бэнкс и Ив Порселло",
    readBtn2: "📖 Читать книгу",
    badge3: "Классика",
    title3: "Питон для начинающих",
    author3: "Ерик Маттес",
    readBtn3: "📖 Читать книгу",
    badge4: "Романтика",
    title4: "Гордость и предубеждение",
    author4: "Джейн Остин",
    readBtn4: "📖 Читать книгу",
    badge5: "Современный роман",
    title5: "Над пропастью во ржи",
    author5: "Дж. Д. Сэлинджер",
    readBtn5: "📖 Читать книгу",
    badge6: "Фэнтези",
    title6: "Хоббит",
    author6: "Дж. Р.Р. Толкин",
    readBtn6: "📖 Читать книгу",
    detailsInstruction: "Нажмите на книгу для подробной информации",
    featuredBooksTitle: "Избранные книги",
      blogTitle: "Блог и читательские инсайты",
    blogLead: "Мнение экспертов, советы по чтению и анализ литературы",
    badge1: "Советы по чтению",
    blog1Title: "Будущее цифровых библиотек",
    blog1Meta: "Сара Джонсон • 5 мин чтения",
    blog1Text: "Изучаем, как технологии меняют способы поиска, чтения и обмена книгами.",
    blog1Button: "Читать статью",
    badge2: "Обзоры книг",
    blog2Title: "10 обязательных книг 2025 года",
    blog2Meta: "Майкл Чен • 8 мин чтения",
    blog2Text: "Подборка самых значимых книг года.",
    blog2Button: "Читать статью",
    badge3: "Искусство письма",
    blog3Title: "Советы для эффективного чтения",
    blog3Meta: "Эмма Уотсон • 6 мин чтения",
    blog3Text: "Практические советы для лучшего понимания и запоминания прочитанного.",
    blog3Button: "Читать статью",
    badge4: "Литературный анализ",
    blog4Title: "Понимание классической литературы",
    blog4Meta: "Дэвид Ким • 10 мин чтения",
    blog4Text: "Анализ вечных тем и методов классической литературы.",
    blog4Button: "Читать статью",
    aboutTitle: "О Digital Reads",
    aboutLead: "Даем читателям доступ к знаниям во всем мире",
    missionTitle: "Наша Миссия",
    missionText: "Digital Reads — инновационная онлайн-библиотека, призванная развивать любовь к чтению. Мы стремимся сделать знания доступными для каждого.",
    visionTitle: "Наше Видение",
    visionText: "Стать ведущей цифровой библиотекой мира, объединяющей миллионы читателей и мыслищих людей.",
    faqTitle: "Часто задаваемые вопросы"
  },
  ENG: {
    heroTitle: "Welcome to Digital Reads",
    heroLead: "Your modern gateway to endless knowledge and literary adventures",
    booksAvailableLabel: "Books Available",
    eventsHostedLabel: "Events Hosted",
    activeMembersLabel: "Active Members",
    featuredBooksTitle: "Featured Books",
     blogTitle: "Blog & Reading Insights",
    blogLead: "Expert opinions, reading tips, and literary analysis",
    badge1: "Reading Tips",
    catalogTitle: "Book Catalog",
    searchBooks: "🔍 Search books by title or author...",
    featuredBooksTitle: "Featured Books",
    badge1: "Classic",
    title1: "The nomads",
    author1: " Ilyas Yesenberlin",
    readBtn1: "📖 Read Book",
    badge2: "Dystopian",
    title2: "Learning React",
    author2: "by Alex Banks & Eve Porcello",
    readBtn2: "📖 Read Book",
    badge3: "Classic",
    title3: "Python Crash Course",
    author3: "by Eric Matthes",
    readBtn3: "📖 Read Book",
    badge4: "Romance",
    title4: "Pride and Prejudice",
    author4: "by Jane Austen",
    readBtn4: "📖 Read Book",
    badge5: "Coming-of-age",
    title5: "The Catcher in the Rye",
    author5: "by J.D. Salinger",
    readBtn5: "📖 Read Book",
    badge6: "Fantasy",
    title6: "The Hobbit",
    author6: "by J.R.R. Tolkien",
    readBtn6: "📖 Read Book",
    detailsInstruction: "Click on a book to see details",
    blog1Title: "The Future of Digital Libraries",
    blog1Meta: "By Sarah Johnson • 5 min read",
    blog1Text: "Exploring how technology is transforming the way we discover, read, and share books in the digital age. From AI recommendations to virtual book clubs.",
    blog1Button: "Read Article",
    badge2: "Book Reviews",
    blog2Title: "10 Must-Read Books of 2025",
    blog2Meta: "By Michael Chen • 8 min read",
    blog2Text: "Our curated selection of the year's most impactful reads, spanning fiction, non-fiction, and everything in between.",
    blog2Button: "Read Article",
    badge3: "Writing Craft",
    blog3Title: "Tips for Effective Reading",
    blog3Meta: "By Emma Watson • 6 min read",
    blog3Text: "Practical advice to improve your reading comprehension, retention, and overall enjoyment whether you're reading for pleasure or learning.",
    blog3Button: "Read Article",
    badge4: "Literary Analysis",
    blog4Title: "Understanding Classic Literature",
    blog4Meta: "By David Kim • 10 min read",
    blog4Text: "A deep dive into the enduring themes and techniques that make classic literature timeless and relevant to modern readers.",
    blog4Button: "Read Article",
    aboutTitle: "About Digital Reads",
    aboutLead: "Empowering readers worldwide with digital access to knowledge",
    missionTitle: "Our Mission",
    missionText: "Digital Reads is an innovative online library platform designed to foster a love for reading through interactive features, community discussions, and curated book collections. We believe in making knowledge accessible to everyone, everywhere.",
    visionTitle: "Our Vision",
    visionText: "To become the world's leading digital library platform, connecting millions of readers with the books they love while building a vibrant community of learners and thinkers.",
    faqTitle: "Frequently Asked Questions",
     eventsTitle: "[translate:Предстоящие события]",
    eventsLead: "[translate:Присоединяйтесь к нашим мероприятиям и знакомьтесь с читателями]",
    eventBadge1: "[translate:Встреча с автором]",
    eventTitle1: "[translate:Встреча с автором: Цифровой читатель]",
    eventDate1: "[translate:📅 15 ноября 2025 • 🕕 18:00 EST]",
    eventText1: "[translate:Интерактивная сессия с бестселлером Джейн Доу о цифровых чтениях и её новом романе \"Connected Pages\".]",
    eventBtn1: "[translate:Зарегистрироваться]",
    eventBadge2: "[translate:Книжный клуб]",
    eventTitle2: "[translate:Виртуальный книжный клуб: Ноябрь]",
    eventDate2: "[translate:📅 25 ноября 2025 • 🕖 19:00 EST]",
    eventText2: "[translate:Обсудите книгу \"The Art of Reading\" вместе с критиком!] ",
    eventBtn2: "[translate:Присоединиться]",
    eventBadge3: "[translate:Мастер-класс]",
    eventTitle3: "[translate:Мастер-класс по творческому письму]",
    eventDate3: "[translate:📅 5 декабря 2025 • 🕔 17:00 EST]",
    eventText3: "[translate:Изучите основы повествования и создания персонажей.]",
    eventBtn3: "[translate:Записаться]",
    eventBadge4: "[translate:Общественное мероприятие]",
    eventTitle4: "[translate:Годовой читательский челлендж]",
    eventDate4: "[translate:📅 1-31 декабря 2025 • Весь день]",
    eventText4: "[translate:Участвуйте в ежегодном марафоне чтения! Ставьте цели, следите за прогрессом.]",
    eventBtn4: "[translate:Принять вызов]",
    eventBadge5: "[translate:Искусство и литература]",
    eventTitle5: "[translate:Конкурс обложек книг]",
    eventDate5: "[translate:📅 10 декабря 2025 • 🕕 18:30 EST]",
    eventText5: "[translate:Профессиональные дизайнеры расскажут о своем творчестве.]",
    eventBtn5: "[translate:Зарегистрироваться]",
    eventBadge6: "[translate:Глобальное чтение]",
    eventTitle6: "[translate:Фестиваль мировой литературы]",
    eventDate6: "[translate:📅 15-17 декабря 2025 • Разное время]",
    eventText6: "[translate:Трехдневный фестиваль мировой литературы с участием авторов, переводчиков и читателей.]",
    eventBtn6: "[translate:Расписание]",
    eventsTitle: "Upcoming Events",
    eventsLead: "Join our community events and connect with fellow readers",
    eventBadge1: "🎤 Author Talk",
    eventTitle1: "Author Talk: The Digital Reader",
    eventDate1: "📅 November 15, 2025 • 🕕 6:00 PM EST",
    eventText1: "An interactive session with bestselling author Jane Doe discussing the evolution of digital reading habits and her latest novel \"Connected Pages\".",
    eventBtn1: "Register Now",
    eventBadge2: "📖 Book Club",
    eventTitle2: "Virtual Book Club: November Edition",
    eventDate2: "📅 November 25, 2025 • 🕖 7:00 PM EST",
    eventText2: "Join our monthly discussion of \"The Art of Reading\" by renowned literary critic Marcus Williams. All members welcome!",
    eventBtn2: "Join Discussion",
    eventBadge3: "🎓 Workshop",
    eventTitle3: "Creative Writing Workshop",
    eventDate3: "📅 December 5, 2025 • 🕔 5:00 PM EST",
    eventText3: "Learn the fundamentals of storytelling and character development with award-winning author Thomas Reed in this hands-on workshop.",
    eventBtn3: "Sign Up",
    eventBadge4: "🎉 Community Event",
    eventTitle4: "Year-End Reading Challenge",
    eventDate4: "📅 December 1-31, 2025 • All Day",
    eventText4: "Participate in our annual reading challenge! Set your goals, track your progress, and win exciting prizes for completing milestones.",
    eventBtn4: "Accept Challenge",
    eventBadge5: "🎨 Art & Literature",
    eventTitle5: "Book Cover Design Showcase",
    eventDate5: "📅 December 10, 2025 • 🕕 6:30 PM EST",
    eventText5: "Explore the intersection of visual art and literature with professional book cover designers sharing their creative process.",
    eventBtn5: "RSVP",
    eventBadge6: "🌍 Global Reading",
    eventTitle6: "World Literature Festival",
    eventDate6: "📅 December 15-17, 2025 • Various Times",
    eventText6: "A three-day celebration of global literature featuring authors, translators, and readers from around the world.",
    eventBtn6: "View Schedule"
  }
};

// 🌍 Apply all translations automatically
function applyTranslations(lang) {
  const langObj = translations[lang];
  if (!langObj) return;

  // Loop through all keys in the selected language object
  for (const key in langObj) {
    const value = langObj[key];

    // If an element has the same ID as the key
    const el = document.getElementById(key);
    if (el) {
      el.textContent = value;
      continue;
    }

    // If it's a placeholder field (like search inputs)
    const inputEl = document.querySelector(`[data-translate="${key}"]`);
    if (inputEl && inputEl.tagName === "INPUT") {
      inputEl.placeholder = value;
    }
  }
}

// 🌐 Set and save selected language
function setLanguage(lang) {
  localStorage.setItem('digitalReadsLang', lang);
  $('#langDropdown').html('🌐 ' + lang);
  applyTranslations(lang);

  if (typeof showToast === 'function') {
    showToast('🌐 Language changed to: ' + lang);
  }
}

// 🚀 Initialize on page load
$(document).ready(function () {
  // 1️⃣ Detect saved language or default to English
  const savedLang = localStorage.getItem('digitalReadsLang') || 'ENG';
  setLanguage(savedLang);

  // 2️⃣ Listen for dropdown language change
  $('.lang-select').on('click', function (e) {
    e.preventDefault();
    setLanguage($(this).data('lang'));
  });
});

// Book "Add to My Books" handler
// This should be in your books catalog JS (where the add-to-my-books button logic is handled)
$(document).on('click', '.add-to-my-books-btn', function() {
  const $btn = $(this);
  const title = $btn.data('title');
  const author = $btn.data('author');
  const link = $btn.data('link');   // ADD THIS LINE
  const image = $btn.data('image');
  let myBooks = JSON.parse(localStorage.getItem('myBooks')) || [];
  const exists = myBooks.some(b => b.title === title && b.author === author);
  if (!exists) {
    myBooks.push({title, author, link, image, dateAdded: new Date().toISOString()}); // INCLUDE LINK HERE
    localStorage.setItem('myBooks', JSON.stringify(myBooks));
    showToast('✅ Book added to My Books!');
  } else {
    showToast('📚 Book is already in your library!');
  }
});
// ========================================
// LIVE CHAT FUNCTIONALITY
// ========================================

$(document).ready(function() {
  // Initialize chat only if we're on the talk page
  if ($('#chatMessages').length) {
    initLiveChat();
  }
});

function initLiveChat() {
  // Get or create user name
  let userName = localStorage.getItem('chatUserName') || 'Guest_' + Math.floor(Math.random() * 10000);
  if (!localStorage.getItem('chatUserName')) {
    userName = prompt('Enter your name to join the chat:') || userName;
    localStorage.setItem('chatUserName', userName);
  }

  // Load messages from localStorage
  loadChatMessages();

  // Character counter
  $('#chatMessageInput').on('input', function() {
    const length = $(this).val().length;
    $('#charCount').text(length);
    
    // Update button state
    if (length > 0) {
      $('#sendChatBtn').prop('disabled', false);
    } else {
      $('#sendChatBtn').prop('disabled', true);
    }
  });

  // Auto-resize textarea
  function autoResizeTextarea() {
    const textarea = $('#chatMessageInput')[0];
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }
  
  $('#chatMessageInput').on('input', autoResizeTextarea);
  
  // Initial resize
  setTimeout(autoResizeTextarea, 100);

  // Send message on form submit
  $('#chatForm').on('submit', function(e) {
    e.preventDefault();
    sendMessage();
  });

  // Send message on Enter (but allow Shift+Enter for new line)
  $('#chatMessageInput').on('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Simulate random messages occasionally (for demo purposes)
  setInterval(function() {
    // Very low chance to receive a message from another user (0.5% chance every 10 seconds)
    if (Math.random() < 0.005) {
      receiveRandomMessage();
    }
  }, 10000);
}

function sendMessage() {
  const messageInput = $('#chatMessageInput');
  const messageText = messageInput.val().trim();

  if (!messageText) {
    return;
  }

  const userName = localStorage.getItem('chatUserName') || 'Guest';
  const message = {
    text: messageText,
    author: userName,
    timestamp: new Date().toISOString(),
    type: 'sent'
  };

  // Add message to chat
  addMessageToChat(message);

  // Save to localStorage
  saveMessageToStorage(message);

  // Clear input and reset height
  messageInput.val('');
  // Reset textarea height to min-height (120px from CSS)
  messageInput.css('height', '120px');
  $('#charCount').text('0');
  $('#sendChatBtn').prop('disabled', true);

  // Scroll to bottom
  scrollChatToBottom();

  // Show toast
  if (typeof showToast === 'function') {
    showToast('💬 Message sent!');
  }
}

function receiveRandomMessage() {
  const botNames = ['BookLover42', 'ReaderPro', 'NovelEnthusiast', 'PageTurner', 'LiteraryFan'];
  const botMessages = [
    'Has anyone read the latest bestseller?',
    'I just finished an amazing book!',
    'Looking for book recommendations...',
    'What are you all reading this week?',
    'Great discussion going on here!',
    'Any fantasy book suggestions?',
    'Classic literature is timeless!',
    'Just joined the chat, hello everyone!'
  ];

  const message = {
    text: botMessages[Math.floor(Math.random() * botMessages.length)],
    author: botNames[Math.floor(Math.random() * botNames.length)],
    timestamp: new Date().toISOString(),
    type: 'received'
  };

  addMessageToChat(message);
  saveMessageToStorage(message);
  scrollChatToBottom();
}

function addMessageToChat(message) {
  const chatMessages = $('#chatMessages');
  
  // Remove empty state if exists
  chatMessages.find('.chat-empty-state').remove();

  const time = new Date(message.timestamp);
  const timeString = time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Get current user name
  const currentUserName = localStorage.getItem('chatUserName') || '';
  const isOwnMessage = message.author === currentUserName;

  // Only show report button for messages from other users
  const reportButtonHtml = !isOwnMessage ? `
    <button class="btn-report-message" type="button" data-bs-toggle="modal" data-bs-target="#reportModal" data-reported-user="${escapeHtml(message.author)}" title="Report user for inappropriate action">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
      </svg>
    </button>
  ` : '';

  const messageHtml = `
    <div class="chat-message ${message.type}" data-author="${escapeHtml(message.author)}" data-timestamp="${message.timestamp}">
      <div class="chat-message-info">
        <span class="chat-message-author">${escapeHtml(message.author)}</span>
        <span class="chat-message-time">${timeString}</span>
        ${reportButtonHtml}
      </div>
      <div class="chat-message-bubble">
        <div class="chat-message-text">${escapeHtml(message.text)}</div>
      </div>
    </div>
  `;

  chatMessages.append(messageHtml);
}

function loadChatMessages() {
  const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
  const chatMessages = $('#chatMessages');

  if (messages.length === 0) {
    // Show empty state initially
    chatMessages.html(`
      <div class="chat-empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p>No messages yet. Start the conversation!</p>
      </div>
    `);
    
    // Add welcome message after a short delay
    setTimeout(function() {
      const welcomeMessage = {
        text: 'Welcome to the live chat! Start a conversation with fellow book lovers. 📚',
        author: 'Digital Reads Bot',
        timestamp: new Date().toISOString(),
        type: 'received'
      };
      addMessageToChat(welcomeMessage);
      saveMessageToStorage(welcomeMessage);
      scrollChatToBottom();
    }, 1000);
    return;
  }

  messages.forEach(message => {
    addMessageToChat(message);
  });

  scrollChatToBottom();
}

function saveMessageToStorage(message) {
  let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
  messages.push(message);
  
  // Keep only last 100 messages to prevent storage issues
  if (messages.length > 100) {
    messages = messages.slice(-100);
  }
  
  localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function scrollChatToBottom() {
  const chatMessages = $('#chatMessages');
  chatMessages.scrollTop(chatMessages[0].scrollHeight);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ========================================
// REPORT USER FUNCTIONALITY
// ========================================

$(document).ready(function() {
  // Handle report button click - populate modal with user name
  $(document).on('click', '.btn-report-message', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const reportedUser = $(this).data('reported-user');
    const currentUser = localStorage.getItem('chatUserName') || '';
    
    // Prevent users from reporting themselves
    if (reportedUser === currentUser) {
      showToast('❌ You cannot report yourself');
      return;
    }
    
    $('#reportedUserName').text(reportedUser);
    $('#reportForm')[0].reset();
    $('#reportModal').data('reported-user', reportedUser);
  });

  // Handle report form submission
  $('#submitReportBtn').on('click', function() {
    const reportedUser = $('#reportModal').data('reported-user');
    const currentUser = localStorage.getItem('chatUserName') || '';
    const reason = $('#reportReason').val();
    const description = $('#reportDescription').val().trim();

    // Double-check: prevent self-reporting
    if (reportedUser === currentUser) {
      showToast('❌ You cannot report yourself');
      $('#reportModal').modal('hide');
      return;
    }

    if (!reason) {
      showToast('❌ Please select a reason for reporting');
      $('#reportReason').focus();
      return;
    }

    // Create report object
    const report = {
      reportedUser: reportedUser,
      reason: reason,
      description: description,
      timestamp: new Date().toISOString(),
      reporter: currentUser || 'Anonymous'
    };

    // Save report to localStorage
    let reports = JSON.parse(localStorage.getItem('userReports')) || [];
    reports.push(report);
    localStorage.setItem('userReports', JSON.stringify(reports));

    // Close modal
    $('#reportModal').modal('hide');
    
    // Show success message
    showToast('✅ Report submitted successfully. Thank you for helping keep our community safe!');
    
    // Reset form
    $('#reportForm')[0].reset();
  });

  // Reset form when modal is closed
  $('#reportModal').on('hidden.bs.modal', function() {
    $('#reportForm')[0].reset();
    $('#reportedUserName').text('');
    $('#reportModal').removeData('reported-user');
  });
});
