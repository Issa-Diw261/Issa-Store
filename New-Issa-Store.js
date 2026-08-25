// ============ 1. تهيئة FIREBASE ============
const firebaseConfig = {
  apiKey: "AIzaSyB8EdcXzXo9P_XlLJIIgCgwgfuT55K4DA4",
  authDomain: "issa-store-95457.firebaseapp.com",
  projectId: "issa-store-95457",
  storageBucket: "issa-store-95457.firebasestorage.app",
  messagingSenderId: "704815624988",
  appId: "1:704815624988:web:b13ac9bcfd838dddfc40d9",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ============ 2. تهيئة EMAILJS ============
const EMAILJS_PUBLIC_KEY = "rD_YVxfijyu8AMQPZ";
const EMAILJS_SERVICE_ID = "service_5jxzcki";
const EMAILJS_TEMPLATE_ID = "template_4qop18i";

if (window.emailjs) {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } catch (e) {
    console.error("EmailJS init failed", e);
  }
}

// ============ 3. قائمة الهاتف المنسدلة ============
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navItems = document.querySelectorAll(".nav-item");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    const icon = menuToggle.querySelector("i");
    if (icon) {
      icon.className = navLinks.classList.contains("open")
        ? "fa-solid fa-xmark"
        : "fa-solid fa-bars";
    }
  });

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navLinks.classList.remove("open");
      const icon = menuToggle.querySelector("i");
      if (icon) icon.className = "fa-solid fa-bars";
    });
  });
}

// ============ 4. تفعيل الحركة عند التمرير ============
const sections = document.querySelectorAll(".why, .how-to-order");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
      else entry.target.classList.remove("in-view");
    });
  },
  { threshold: 0.2 },
);
sections.forEach((section) => observer.observe(section));

// ============ 5. البحث الحي ============
const searchInput = document.getElementById("serviceSearch");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll(".cards .card");
    cards.forEach((card) => {
      const title = card.querySelector("h2").textContent.toLowerCase();
      const desc = card.querySelector("p").textContent.toLowerCase();
      card.style.display =
        title.includes(term) || desc.includes(term) ? "block" : "none";
    });
  });
}

// ============ 6. نظام تقييمات العملاء ============
let selectedRating = 5;
const starContainer = document.getElementById("starRating");
const ratingText = document.getElementById("ratingValueText");

function updateStarDisplay(rating) {
  if (!starContainer) return;
  const stars = starContainer.querySelectorAll("i");
  stars.forEach((star) => {
    const val = parseInt(star.getAttribute("data-val"), 10);
    if (val <= rating) {
      star.className = "fa-solid fa-star";
    } else {
      star.className = "fa-regular fa-star";
    }
  });
  if (ratingText) {
    ratingText.textContent = `(${rating} / 5)`;
  }
}

function initStarRating() {
  if (!starContainer) return;
  updateStarDisplay(selectedRating);

  const stars = starContainer.querySelectorAll("i");
  stars.forEach((star) => {
    const handleRating = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const val = parseInt(star.getAttribute("data-val"), 10);
      if (val) {
        selectedRating = val;
        updateStarDisplay(selectedRating);
      }
    };
    star.addEventListener("click", handleRating);
    star.addEventListener("touchstart", handleRating, { passive: false });
  });
}

const reviewsContainer = document.getElementById("reviewsContainer");

function listenToReviews() {
  if (!reviewsContainer) return;

  db.collection("reviews").onSnapshot(
    (snapshot) => {
      if (snapshot.empty) {
        reviewsContainer.innerHTML = `<div class="no-reviews-msg">كن أول من يقيّم خدماتنا ويشارك تجربته!</div>`;
        return;
      }

      let reviewsList = [];
      snapshot.forEach((doc) => {
        reviewsList.push(doc.data());
      });

      // ترتيب التقييمات تنازلياً
      reviewsList.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      reviewsContainer.innerHTML = "";
      reviewsList.forEach((rev) => {
        let starsHtml = "";
        for (let i = 1; i <= 5; i++) {
          starsHtml +=
            i <= rev.rating
              ? `<i class="fa-solid fa-star"></i> `
              : `<i class="fa-regular fa-star"></i> `;
        }

        const reviewCard = document.createElement("div");
        reviewCard.className = "review-box";
        reviewCard.innerHTML = `
          <div class="stars">${starsHtml}</div>
          <p>"${rev.comment || "تقييم ممتاز بدون تعليق إضافي"}"</p>
          <div class="user-info">
            <i class="fa-solid fa-circle-user"></i>
            <div>
              <h4>${rev.name}</h4>
              <span>عميل موثق</span>
            </div>
          </div>
        `;
        reviewsContainer.appendChild(reviewCard);
      });
    },
    (error) => {
      console.error("Firebase fetch error:", error);
      reviewsContainer.innerHTML = `<div class="no-reviews-msg">تعذر تحميل التقييمات حالياً.</div>`;
    },
  );
}

function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;
  const fakeDomains = [
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "throwawaymail.com",
    "yopmail.com",
  ];
  const domain = email.split("@")[1].toLowerCase();
  return !fakeDomains.includes(domain);
}

const reviewForm = document.getElementById("reviewForm");
const submitReviewBtn = document.getElementById("submitReviewBtn");

if (reviewForm) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("reviewerName").value.trim();
    const email = document.getElementById("reviewerEmail").value.trim();
    const comment = document.getElementById("reviewerComment").value.trim();

    if (!isValidEmail(email)) {
      alert("يرجى إدخال بريد إلكتروني حقيقي وصحيح.");
      return;
    }

    if (submitReviewBtn) {
      submitReviewBtn.disabled = true;
      submitReviewBtn.textContent = "جاري الإرسال...";
    }

    try {
      // 1. الحفظ في Firebase Firestore
      await db.collection("reviews").add({
        name: name,
        email: email,
        rating: selectedRating,
        comment: comment,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // 2. إرسال الإيميل عبر EmailJS
      if (window.emailjs) {
        try {
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            user_name: name,
            user_email: email,
            rating: selectedRating,
            message: comment || "بدون تعليق إضافي",
          });
        } catch (mailErr) {
          console.warn(
            "EmailJS sending error (Data was saved to Firebase):",
            mailErr,
          );
        }
      }

      reviewForm.reset();
      selectedRating = 5;
      updateStarDisplay(selectedRating);
      alert("شكراً لك! تم نشر تقييمك بنجاح.");
    } catch (error) {
      console.error("Full Submission Error:", error);
      alert(
        "حدث خطأ أثناء الإرسال: " +
          (error.message || "تأكد من إعدادات قاعدة البيانات"),
      );
    } finally {
      if (submitReviewBtn) {
        submitReviewBtn.disabled = false;
        submitReviewBtn.textContent = "إرسال التقييم";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initStarRating();
  listenToReviews();
});
