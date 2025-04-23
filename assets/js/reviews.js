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
  
  if (!name || !text || rating < 1) {
    alert('Prosím vyplňte všechna pole a zvolte hodnocení.');
    return;
  }
  
  // Create new review object
  const newReview = {
    name,
    rating,
    text,
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
    // Remove skeleton loaders
    reviewsGrid.innerHTML = '';
    
    // Get all reviews, sorted by date (no approval filter)
    const snapshot = await reviewsCollection
      .orderBy('date', 'desc')
      .limit(6)
      .get();
    
    if (snapshot.empty) {
      // Add a placeholder if no reviews yet
      reviewsGrid.innerHTML = `
        <div class="no-reviews-message">
          <p>Zatím zde nejsou žádné recenze. Buďte první, kdo napíše recenzi!</p>
        </div>
      `;
      return;
    }
    
    // Add each review to the grid
    snapshot.forEach(doc => {
      const review = doc.data();
      const reviewCard = createReviewCard(review);
      reviewsGrid.appendChild(reviewCard);
    });
    
  } catch (error) {
    console.error('Error loading reviews: ', error);
    // Show detailed error for debugging
    reviewsGrid.innerHTML = `
      <div class="error-message">
        <p>Omlouváme se, došlo k chybě při načítání recenzí: ${error.message}</p>
        <p>Kód chyby: ${error.code || 'undefined'}</p>
      </div>
    `;
  }
}

// Create a review card element
function createReviewCard(review) {
  const card = document.createElement('div');
  card.className = 'review-card';
  
  // Generate stars based on rating
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= review.rating) {
      stars += '<i class="fas fa-star"></i>';
    } else if (i - 0.5 <= review.rating) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }
  
  // Format date
  const date = review.date.toDate();
  const formattedDate = date.toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Populate card content
  card.innerHTML = `
    <div class="review-rating">${stars}</div>
    <p class="review-text">${review.text}</p>
    <h4 class="review-author">${review.name}</h4>
    <p class="review-date">${formattedDate}</p>
  `;
  
  return card;
}

// Load reviews when the page is ready
document.addEventListener('DOMContentLoaded', loadReviews);
