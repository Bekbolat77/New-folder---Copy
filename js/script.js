$(document).ready(function () {
  
  // ========================================
  // NAVBAR & SCROLL EFFECTS
  // ========================================
  
  // Navbar shadow on scroll
  $(window).on('scroll', function () {
    if ($(window).scrollTop() > 10) {
      $('.navbar').addClass('scrolled');
    } else {
      $('.navbar').removeClass('scrolled');
    }
    
    // Scroll progress bar
    const scrollTop = $(window).scrollTop();
    const docHeight = $(document).height() - $(window).height();
    const scrollPercent = (scrollTop / docHeight) * 100;
    $('#scrollProgress').css('width', scrollPercent + '%');
  });

  $(document).on('click', '.read-book-btn', function(e) {
  e.preventDefault();
  const bookTitle = $(this).closest('.card').find('.card-title').text();
  showToast(`📖 Opening "${bookTitle}"...`);
  
  // Simulate opening book (you can redirect to a reading page)
  setTimeout(() => {
    showToast(`✨ Enjoy reading "${bookTitle}"!`);
  }, 1000);
});

// Subscribe button handler
$('#subscribeBtn').on('click', function() {
  const modal = new bootstrap.Modal(document.getElementById('subscribeModal'));
  modal.show();
});

// Subscribe form submission
$('#subscribeForm').on('submit', function(e) {
  e.preventDefault();
  const email = $('#subscriberEmail').val();
  
  if (email) {
    showToast('✅ Successfully subscribed to newsletter!');
    $('#subscribeModal').modal('hide');
    this.reset();
  }
});

// Event registration buttons
$(document).on('click', '.btn-primary', function(e) {
  const btnText = $(this).text().trim();
  
  if (btnText.includes('Register') || btnText.includes('Join') || btnText.includes('Sign Up') || btnText.includes('RSVP')) {
    e.preventDefault();
    showToast('✅ Successfully registered for the event!');
  }
  
  if (btnText.includes('Read More') || btnText.includes('Read Article')) {
    e.preventDefault();
    showToast('📰 Loading article...');
  }
});
  // ========================================
  // DATE & TIME DISPLAY
  // ========================================
  
  function updateDateTime() {
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
    const formatted = now.toLocaleDateString('en-US', options);
    $('#currentDateTime').html(`📅 ${formatted}`);
  }
  
  if ($('#currentDateTime').length) {
    updateDateTime();
    setInterval(updateDateTime, 1000);
  }

  
  // ========================================
  // ANIMATED COUNTERS
  // ========================================
  
  $('.counter').each(function () {
    const $this = $(this);
    const countTo = $this.data('count');
    
    $({ Counter: 0 }).animate(
      { Counter: countTo },
      {
        duration: 2500,
        easing: 'swing',
        step: function (now) {
          $this.text(Math.ceil(now).toLocaleString());
        }
      }
    );
  });

  
  // ========================================
  // DARK MODE TOGGLE
  // ========================================
  
  $('#toggleDarkModeBtn, #modeToggle').on('click change', function () {
    $('body').toggleClass('dark-mode');
    const isDark = $('body').hasClass('dark-mode');
    localStorage.setItem('digitalReadsTheme', isDark ? 'dark' : 'light');
    
    // Update button text
    if ($('#toggleDarkModeBtn').length) {
      $('#toggleDarkModeBtn').text(isDark ? '☀️ Toggle Light Mode' : '🌙 Toggle Dark Mode');
    }
    
    showToast(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
  });
  
  // Load saved theme
  if (localStorage.getItem('digitalReadsTheme') === 'dark') {
    $('body').addClass('dark-mode');
    $('#modeToggle').prop('checked', true);
    if ($('#toggleDarkModeBtn').length) {
      $('#toggleDarkModeBtn').text('☀️ Toggle Light Mode');
    }
  }

  
  // ========================================
  // COPY TO CLIPBOARD
  // ========================================
  
  $('.copy-quote').on('click', function () {
    const quote = $(this).data('quote');
    navigator.clipboard.writeText(quote).then(() => {
      showToast('📋 Quote copied to clipboard!');
    }).catch(() => {
      showToast('❌ Failed to copy quote');
    });
  });

  
  // ========================================
  // TOAST NOTIFICATIONS
  // ========================================
  
  function showToast(message) {
    // Remove existing toasts
    $('.custom-toast').remove();
    
    const toast = $(`
      <div class="custom-toast" style="
        position: fixed;
        top: 90px;
        right: 20px;
        background: var(--card-bg);
        color: var(--text-color);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow-hover);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid;
        border-image: var(--gradient) 1;
      ">${message}</div>
    `);
    
    $('body').append(toast);
    
    setTimeout(() => {
      toast.fadeOut(300, function() {
        $(this).remove();
      });
    }, 3000);
  }

  
  // ========================================
  // BOOK SEARCH & AUTOCOMPLETE
  // ========================================
  
  $('#searchBooks').on('input', function () {
    const searchTerm = $(this).val().toLowerCase();
    const $autocompleteList = $('#autocompleteList');
    
    // Clear autocomplete
    $autocompleteList.empty();
    
    if (searchTerm.length > 0) {
      const matches = [];
      
      $('.book-item').each(function () {
        const title = $(this).data('title').toLowerCase();
        const author = $(this).data('author').toLowerCase();
        
        if (title.includes(searchTerm) || author.includes(searchTerm)) {
          $(this).show();
          matches.push({
            title: $(this).data('title'),
            author: $(this).data('author')
          });
        } else {
          $(this).hide();
        }
      });
      
      // Show autocomplete suggestions
      if (matches.length > 0 && matches.length < 5) {
        matches.forEach(match => {
          $autocompleteList.append(`
            <button class="list-group-item list-group-item-action autocomplete-item" 
              data-title="${match.title}">
              ${match.title} <small class="text-muted">by ${match.author}</small>
            </button>
          `);
        });
      }
    } else {
      $('.book-item').show();
    }
  });
  
  // Autocomplete item click
  $(document).on('click', '.autocomplete-item', function () {
    const title = $(this).data('title');
    $('#searchBooks').val(title);
    $('#autocompleteList').empty();
    $('.book-item').hide();
    $(`.book-item[data-title="${title}"]`).show();
  });
  
  // Close autocomplete when clicking outside
  $(document).on('click', function (e) {
    if (!$(e.target).closest('#searchBooks, #autocompleteList').length) {
      $('#autocompleteList').empty();
    }
  });

  
  // ========================================
  // ADD BOOK FORM (My Books Page)
  // ========================================
  
  $('#addBookForm').on('submit', function (e) {
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
    
    // Simulate API call
    setTimeout(() => {
      // Hide empty message if exists
      $('#userBooks .col-12').remove();
      
      // Add book card
      const bookCard = $(`
        <div class="col-md-4">
          <div class="card" style="animation-delay: 0s;">
            <div class="card-body">
              <h5 class="card-title">${title}</h5>
              <p class="card-text text-muted">by ${author}</p>
              <button class="btn btn-sm btn-outline-danger remove-book">Remove</button>
            </div>
          </div>
        </div>
      `);
      
      $('#userBooks').append(bookCard);
      
      // Reset form
      this.reset();
      $('#addBookText').removeClass('d-none');
      $('#addBookSpinner').addClass('d-none');
      
      showToast('✅ Book added successfully!');
    }, 1000);
  });
  
  // Remove book
  $(document).on('click', '.remove-book', function () {
    $(this).closest('.col-md-4').fadeOut(300, function() {
      $(this).remove();
      
      // Show empty message if no books
      if ($('#userBooks').children().length === 0) {
        $('#userBooks').html(`
          <div class="col-12 text-center text-muted">
            <p>No books added yet. Start building your collection!</p>
          </div>
        `);
      }
    });
    showToast('🗑️ Book removed');
  });

  
  // ========================================
  // REGISTRATION FORM VALIDATION
  // ========================================
  
  $('#registrationForm').on('submit', function (e) {
    e.preventDefault();
    
    const form = this;
    const email = $('#email').val();
    const password = $('#password').val();
    const confirmPassword = $('#confirmPassword').val();
    
    // Clear previous validation
    $(form).removeClass('was-validated');
    $('.is-invalid').removeClass('is-invalid');
    
    let isValid = true;
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      $('#email').addClass('is-invalid');
      isValid = false;
    }
    
    // Password validation
    if (password.length < 6) {
      $('#password').addClass('is-invalid');
      isValid = false;
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
      $('#confirmPassword').addClass('is-invalid');
      $('#confirmPassword').siblings('.invalid-feedback').text('Passwords must match');
      isValid = false;
    }
    
    if (!isValid) {
      showToast('❌ Please fix the errors in the form');
      return;
    }
    
    // Show spinner
    $('#registerText').addClass('d-none');
    $('#registerSpinner').removeClass('d-none');
    
    // Simulate registration
    setTimeout(() => {
      $('#registerText').removeClass('d-none');
      $('#registerSpinner').addClass('d-none');
      $('#registrationSuccess').removeClass('d-none');
      form.reset();
      showToast('✅ Registration successful!');
    }, 2000);
  });

  
  // ========================================
  // LAZY LOADING IMAGES
  // ========================================
  
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.src = img.src;
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }

});

// ========================================
// READ BOOK FUNCTIONALITY - AUTO ADD TO MY BOOKS
// ========================================

$(document).on('click', '.read-book-btn', function(e) {
  e.preventDefault();
  
  // Get book details from the card
  const $card = $(this).closest('.card');
  const bookTitle = $card.find('.card-title').text().trim();
  const bookAuthor = $card.find('.card-text.small').text().replace('by ', '').trim();
  const bookImage = $card.find('img').attr('src');
  
  // Create book object
  const book = {
    title: bookTitle,
    author: bookAuthor,
    image: bookImage,
    dateAdded: new Date().toISOString()
  };
  
  // Get existing books from localStorage
  let myBooks = JSON.parse(localStorage.getItem('myBooks')) || [];
  
  // Check if book already exists
  const bookExists = myBooks.some(b => b.title === bookTitle && b.author === bookAuthor);
  
  if (!bookExists) {
    // Add book to array
    myBooks.push(book);
    
    // Save to localStorage
    localStorage.setItem('myBooks', JSON.stringify(myBooks));
    
    showToast(`✅ "${bookTitle}" added to My Books!`);
  } else {
    showToast(`📚 "${bookTitle}" is already in your library!`);
  }
  
  // Simulate opening reading mode
  setTimeout(() => {
    showToast(`📖 Opening "${bookTitle}"...`);
  }, 1500);
});
// Make sure this function exists in script.js
function showToast(message) {
  $('.custom-toast').remove();
  
  const toast = $(`
    <div class="custom-toast" style="
      position: fixed;
      top: 90px;
      right: 20px;
      background: var(--card-bg);
      color: var(--text-color);
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: var(--shadow-hover);
      z-index: 9999;
      animation: slideInRight 0.3s ease;
      border-left: 4px solid;
      border-image: var(--gradient) 1;
    ">${message}</div>
  `);
  
  $('body').append(toast);
  
  setTimeout(() => {
    toast.fadeOut(300, function() {
      $(this).remove();
    });
  }, 3000);
}

// Make it globally accessible
window.showToast = showToast;

