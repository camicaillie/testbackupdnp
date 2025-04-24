// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPdsMPg-pefgaeQrr-6nUSx6NXzt7xM1U",
  authDomain: "reviews-web-f12a8.firebaseapp.com",
  projectId: "reviews-web-f12a8",
  storageBucket: "reviews-web-f12a8.firebasestorage.app",
  messagingSenderId: "259448610852",
  appId: "1:259448610852:web:b050054918836fdd48b8b1"
};
  // For Firebase setup instructions, see comments below
  /*
   * To set up Firebase:
   * 1. Go to https://console.firebase.google.com/
   * 2. Create a new project or use an existing one
   * 3. Add a web app to your project
   * 4. Copy the configuration here
   * 5. Set up Firestore Database in the Firebase console
   */   

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const reviewsCollection = db.collection('reviews');

// DOM Elements
const reviewForm = document.getElementById('reviewForm');
const reviewsGrid = document.getElementById('reviewsGrid');
const ratingStars = document.querySelectorAll('.rating-star');
const ratingInput = document.getElementById('reviewRating');

// Star rating functionality
ratingStars.forEach(star => {
  // Handle hover effect
  star.addEventListener('mouseenter', () => {
    const hoverRating = parseInt(star.getAttribute('data-rating'));
    
    // Update visual state of stars on hover
    ratingStars.forEach(s => {
      const starRating = parseInt(s.getAttribute('data-rating'));
      if (starRating <= hoverRating) {
        s.classList.add('hover');
      } else {
        s.classList.remove('hover');
      }
    });
  });
  
  // Handle mouse leave
  star.addEventListener('mouseleave', () => {
    // Remove hover class from all stars
    ratingStars.forEach(s => s.classList.remove('hover'));
  });
  
  // Handle click
  star.addEventListener('click', () => {
    const rating = parseInt(star.getAttribute('data-rating'));
    ratingInput.value = rating;
    
    // Update visual state of stars
    ratingStars.forEach(s => {
      const starRating = parseInt(s.getAttribute('data-rating'));
      if (starRating <= rating) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  });
});

// When mouse leaves the star rating container, remove hover class and re-apply active class
document.querySelector('.star-rating').addEventListener('mouseleave', () => {
  const rating = parseInt(ratingInput.value);
  
  ratingStars.forEach(s => {
    s.classList.remove('hover');
    const starRating = parseInt(s.getAttribute('data-rating'));
    if (starRating <= rating) {
      s.classList.add('active');
    }
  });
});

// Submit review form
reviewForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('reviewName').value;
  const rating = parseInt(document.getElementById('reviewRating').value);
  const text = document.getElementById('reviewText').value;
  
  // Get selected product
  const productRadios = document.querySelectorAll('input[name="product"]');
  let selectedProduct = null;
  
  productRadios.forEach(radio => {
    if (radio.checked) {
      selectedProduct = radio.value;
    }
  });
  
  if (!name || !text || rating < 1 || !selectedProduct) {
    alert('Prosím vyplňte všechna pole, zvolte produkt a hodnocení.');
    return;
  }
  
  // Create new review object
  const newReview = {
    name,
    rating,
    text,
    product: selectedProduct,
    date: new Date(),
    // All reviews are shown immediately
    approved: true
  };
  
  try {
    // Add to Firebase
    await reviewsCollection.add(newReview);
    
    // Clear form
    reviewForm.reset();
    ratingStars.forEach(s => s.classList.remove('active'));
    ratingInput.value = 0;
    
    // Show success message
    alert('Děkujeme za vaši recenzi! Byla úspěšně přidána.');
    
  } catch (error) {
    console.error('Error adding review: ', error);
    alert('Omlouváme se, došlo k chybě při ukládání recenze. Zkuste to prosím později.');
  }
});

// Load approved reviews
async function loadReviews() {
  try {
    // Reference to the reviews list section
    const reviewsList = document.querySelector('.reviews-list');
    // Clear current content except for the add review button
    const addReviewButton = document.querySelector('.add-review-button');
    if (reviewsList) {
      reviewsList.innerHTML = '';
    }
    
    // Get all reviews for calculation
    const totalSnapshot = await reviewsCollection.get();
    let totalReviews = 0;
    let ratingSum = 0;
    const reviews = [];
    
    // Rating counters for the breakdown
    const ratingCounts = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    // Process all reviews and track ratings
    totalSnapshot.forEach(doc => {
      const review = doc.data();
      reviews.push(review);
      
      if (review && typeof review.rating === 'number' && !isNaN(review.rating)) {
        totalReviews++;
        ratingSum += review.rating;
        
        // Increment the counter for this rating
        const rating = Math.floor(review.rating);
        if (rating >= 1 && rating <= 5) {
          ratingCounts[rating]++;
        }
      }
    });
    
    // Calculate average rating
    const averageRating = totalReviews > 0 ? (ratingSum / totalReviews).toFixed(1) : '0.0';
    
    // Ensure the average rating is not NaN
    const displayRating = isNaN(parseFloat(averageRating)) ? '0.0' : averageRating;
    
    // Update UI with average rating
    const overallRatingElement = document.querySelector('.overall-rating-value');
    if (overallRatingElement) {
      overallRatingElement.textContent = displayRating;
    }
    
    // Update review count with proper formatting
    const reviewCountElement = document.getElementById('reviewCount');
    if (reviewCountElement) {
      reviewCountElement.textContent = totalReviews;
    }
    
    // Update star display
    const starDisplay = document.querySelector('.star-display');
    if (starDisplay) {
      starDisplay.innerHTML = '';
      const ratingValue = parseFloat(displayRating);
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.className = i <= Math.round(ratingValue) ? 'fas fa-star filled' : 'fas fa-star';
        starDisplay.appendChild(star);
      }
    }
    
    // Update rating breakdown bars
    for (let rating = 5; rating >= 1; rating--) {
      const percentage = totalReviews > 0 ? (ratingCounts[rating] / totalReviews) * 100 : 0;
      const barElement = document.querySelector(`.rating-row:nth-child(${6-rating}) .rating-bar`);
      if (barElement) {
        barElement.style.width = `${percentage}%`;
      }
      
      // Update count text
      const countElement = document.querySelector(`.rating-row:nth-child(${6-rating}) .rating-count-small`);
      if (countElement) {
        countElement.textContent = `${ratingCounts[rating] || 0} recenzí`;
      }
    }
    
    // Get all reviews for display
    const snapshot = await reviewsCollection
      .orderBy('date', 'desc')
      .get();
    
    if (snapshot.empty) {
      // Add a placeholder if no reviews yet
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'no-reviews-message';
      emptyMessage.innerHTML = `<p>Zatím zde nejsou žádné recenze. Buďte první, kdo napíše recenzi!</p>`;
      reviewsList.appendChild(emptyMessage);
    } else {
      // Get all reviews and sort by date
      const allReviews = [];
      snapshot.forEach(doc => {
        const review = doc.data();
        allReviews.push(review);
      });
      
      // Sort reviews by date (newest first)
      allReviews.sort((a, b) => b.date.toDate() - a.date.toDate());
      
      // Initially show only the first 3 reviews
      const initialReviewsCount = 3;
      const hasMoreReviews = allReviews.length > initialReviewsCount;
      
      // Add initial reviews to the list
      for (let i = 0; i < Math.min(initialReviewsCount, allReviews.length); i++) {
        const review = allReviews[i];
        const reviewCard = createReviewCard(review);
        reviewsList.appendChild(reviewCard);
      }
      
      // Add "Show more reviews" button if there are more than 3 reviews
      if (hasMoreReviews) {
        const showMoreBtn = document.createElement('div');
        showMoreBtn.className = 'show-more-reviews';
        showMoreBtn.innerHTML = '<i class="fas fa-angle-down"></i><span>Zobrazit více recenzí</span>';
        showMoreBtn.addEventListener('click', () => {
          // Remove the button first
          reviewsList.removeChild(showMoreBtn);
          
          // Add the rest of the reviews
          for (let i = initialReviewsCount; i < allReviews.length; i++) {
            const review = allReviews[i];
            const reviewCard = createReviewCard(review);
            reviewsList.appendChild(reviewCard);
          }
          
          // Re-add the "Add Review" button at the end
          if (addReviewButton && reviewsList.contains(addReviewButton)) {
            reviewsList.removeChild(addReviewButton);
          }
          reviewsList.appendChild(addReviewButton);
        });
        
        reviewsList.appendChild(showMoreBtn);
      }
    }
    
    // Add the button back
    reviewsList.appendChild(addReviewButton);
    
  } catch (error) {
    console.error('Error loading reviews: ', error);
    // Show detailed error for debugging
    const reviewsList = document.querySelector('.reviews-list');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
      <p>Omlouváme se, došlo k chybě při načítání recenzí: ${error.message}</p>
      <p>Kód chyby: ${error.code || 'undefined'}</p>
    `;
    reviewsList.appendChild(errorMessage);
  }
}

// Create a modern review card element
function createReviewCard(review) {
  const card = document.createElement('div');
  card.className = 'modern-review-card';
  
  // Format date and calculate relative time
  const date = review.date.toDate();
  const formattedDate = date.toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calculate time passed since review
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInMonths = Math.floor(diffInDays / 30);
  
  let timeAgo;
  if (diffInDays < 1) {
    timeAgo = 'dnes';
  } else if (diffInDays === 1) {
    timeAgo = 'včera';
  } else if (diffInDays < 30) {
    timeAgo = `před ${diffInDays} dny`;
  } else if (diffInMonths < 12) {
    timeAgo = `před ${diffInMonths} měsíci`;
  } else {
    timeAgo = `před ${Math.floor(diffInMonths / 12)} roky`;
  }
  
  // Get initials for the avatar
  const initials = review.name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase();
  
  // Determine if we have a product field to display
  const productInfo = review.product ? `<p class="review-product">Produkt: ${review.product}</p>` : '';
  
  // Populate card content with new design
  card.innerHTML = `
    <div class="review-header">
      <div class="reviewer-profile">
        <div class="reviewer-initial">${initials}</div>
        <div class="reviewer-info">
          <h4>${review.name}</h4>
          <p class="review-time">${timeAgo}</p>
        </div>
      </div>
      <div class="review-rating">
        <span class="rating-value">${review.rating}.0</span>
        <i class="fas fa-star filled"></i>
      </div>
    </div>
    <div class="review-content">
      ${productInfo}
      <p>${review.text}</p>
    </div>
  `;
  
  return card;
}

// Add event listeners for the modern review form
document.addEventListener('DOMContentLoaded', () => {
  // Load reviews
  loadReviews();
  
  // Add review button functionality (now handled by inline onclick)
  
  // Close review form functionality
  const reviewFormContainer = document.getElementById('reviewFormContainer');
  const reviewModalOverlay = document.getElementById('reviewModalOverlay');
  const closeReviewForm = document.getElementById('closeReviewForm');
  
  // Close form when clicking the X button
  if (closeReviewForm && reviewFormContainer) {
    closeReviewForm.addEventListener('click', () => {
      reviewFormContainer.style.display = 'none';
      reviewModalOverlay.style.display = 'none';
    });
  }
  
  // Close form when clicking outside the form (on the overlay)
  if (reviewModalOverlay) {
    reviewModalOverlay.addEventListener('click', (event) => {
      if (event.target === reviewModalOverlay) {
        reviewFormContainer.style.display = 'none';
        reviewModalOverlay.style.display = 'none';
      }
    });
  }
});
