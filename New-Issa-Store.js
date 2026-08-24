// ============ 1. تهيئة FIREBASE ============
const firebaseConfig = {
  apiKey: "AIzaSyB8EdcXzXo9P_XlLJIIgCgwgfuT55K4DA4",
  authDomain: "issa-store-95457.firebaseapp.com",
  projectId: "issa-store-95457",
  storageBucket: "issa-store-95457.firebasestorage.app",
  messagingSenderId: "704815624988",
  appId: "1:704815624988:web:b13ac9bcfd838dddfc40d9",
};

// تشغيل Firebase و Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ============ 2. قائمة الهاتف المنسدلة (Hamburger Menu) ============
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navItems = document.querySelectorAll(".nav-item");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    const icon = menuToggle.querySelector("i");
    if (navLinks.classList.contains("open")) {
      icon.className = "fa-solid fa-xmark";
    } else {
      icon.className = "fa-solid fa-bars";
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

// ============ 3. تفعيل الحركة عند التمرير للأقسام ============
const sections = document.querySelectorAll(".why, .how-to-order");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      } else {
        entry.target.classList.remove("in-view");
      }
    });
  },
  { threshold: 0.2 },
);

sections.forEach((section) => observer.observe(section));

// ============ 4. البحث الحي بين بطاقات الخدمات ============
const searchInput = document.getElementById("serviceSearch");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll(".cards .card");

    cards.forEach((card) => {
      const title = card.querySelector("h2").textContent.toLowerCase();
      const desc = card.querySelector("p").textContent.toLowerCase();

      if (title.includes(term) || desc.includes(term)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}

// ============ 5. نظام تقييمات العملاء التفاعلي (FIRESTORE) ============
let selectedRating = 5;
const starContainer = document.getElementById("starRating");
const ratingText = document.getElementById("ratingValueText");

function updateStarDisplay(rating) {
  if (!starContainer) return;
  const stars = starContainer.querySelectorAll("i");
  stars.forEach((star) => {
    const val = parseInt(star.getAttribute("data-val"));
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

if (starContainer) {
  updateStarDisplay(selectedRating);
  const stars = starContainer.querySelectorAll("i");
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.getAttribute("data-val"));
      updateStarDisplay(selectedRating);
    });
  });
}

const reviewsContainer = document.getElementById("reviewsContainer");

// جلب التقييمات وعرضها حياً من Firebase
function listenToReviews() {
  if (!reviewsContainer) return;

  db.collection("reviews")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        if (snapshot.empty) {
          reviewsContainer.innerHTML = `<div class="no-reviews-msg">كن أول من يقيّم خدماتنا ويشارك تجربته!</div>`;
          return;
        }

        reviewsContainer.innerHTML = "";
        snapshot.forEach((doc) => {
          const rev = doc.data();
          let starsHtml = "";
          for (let i = 1; i <= 5; i++) {
            if (i <= rev.rating) {
              starsHtml += `<i class="fa-solid fa-star"></i> `;
            } else {
              starsHtml += `<i class="fa-regular fa-star"></i> `;
            }
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
        console.error("Error fetching reviews:", error);
        reviewsContainer.innerHTML = `<div class="no-reviews-msg">حدث خطأ في تحميل التقييمات.</div>`;
      },
    );
}

// دالة فحص البريد الإلكتروني الحقيقي
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
    "sharklasers.com",
  ];
  const domain = email.split("@")[1].toLowerCase();
  if (fakeDomains.includes(domain)) return false;

  return true;
}

// معالجة إرسال التقييم وحفظه في Firebase
const reviewForm = document.getElementById("reviewForm");
const submitReviewBtn = document.getElementById("submitReviewBtn");

if (reviewForm) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("reviewerName").value.trim();
    const email = document.getElementById("reviewerEmail").value.trim();
    const comment = document.getElementById("reviewerComment").value.trim();

    if (!isValidEmail(email)) {
      alert(
        "يرجى إدخال بريد إلكتروني حقيقي وصحيح (مثل Gmail أو Yahoo أو Outlook).",
      );
      return;
    }

    submitReviewBtn.disabled = true;
    submitReviewBtn.textContent = "جاري الإرسال...";

    try {
      // 1. الحفظ في Firebase Firestore
      await db.collection("reviews").add({
        name: name,
        email: email,
        rating: selectedRating,
        comment: comment,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // 2. إعادة ضبط النموذج
      reviewForm.reset();
      selectedRating = 5;
      updateStarDisplay(selectedRating);
      alert("شكراً لك! تم إضافة تقييمك وحفظه بنجاح.");
    } catch (error) {
      console.error("Error adding review:", error);
      alert("حدث خطأ أثناء إرسال التقييم، يرجى المحاولة مرة أخرى.");
    } finally {
      submitReviewBtn.disabled = false;
      submitReviewBtn.textContent = "إرسال التقييم";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  listenToReviews();
});
