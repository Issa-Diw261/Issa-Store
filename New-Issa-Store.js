// ============ 1. تفعيل الحركة عند التمرير للأقسام ============
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
  {
    threshold: 0.2,
  },
);

sections.forEach((section) => observer.observe(section));

// ============ 2. البحث الحي بين بطاقات الخدمات ============
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

// ============ 3. نظام تقييمات العملاء التفاعلي وتخزينها ============
let selectedRating = 5; // القيمة الافتراضية
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

// تفعيل اختيار النجوم بالنقر
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

// جلب التقييمات وعرضها من التخزين المحلي
const reviewsContainer = document.getElementById("reviewsContainer");

function renderReviews() {
  if (!reviewsContainer) return;
  const storedReviews =
    JSON.parse(localStorage.getItem("issa_store_reviews")) || [];

  if (storedReviews.length === 0) {
    reviewsContainer.innerHTML = `<div class="no-reviews-msg">كن أول من يقيّم خدماتنا ويشارك تجربته!</div>`;
    return;
  }

  reviewsContainer.innerHTML = "";
  storedReviews.forEach((rev) => {
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
}

// معالجة نموذج إرسال التقييم
const reviewForm = document.getElementById("reviewForm");
if (reviewForm) {
  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("reviewerName").value.trim();
    const email = document.getElementById("reviewerEmail").value.trim();
    const comment = document.getElementById("reviewerComment").value.trim();

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("يرجى إدخال بريد إلكتروني صالح.");
      return;
    }

    const newReview = {
      name: name,
      email: email,
      rating: selectedRating,
      comment: comment,
      date: new Date().toISOString(),
    };

    const storedReviews =
      JSON.parse(localStorage.getItem("issa_store_reviews")) || [];
    storedReviews.unshift(newReview); // إضافة التقييم في البداية
    localStorage.setItem("issa_store_reviews", JSON.stringify(storedReviews));

    // إعادة تعيين الحقول وعرض التقييمات
    reviewForm.reset();
    selectedRating = 5;
    updateStarDisplay(selectedRating);
    renderReviews();
    alert("شكراً لك! تم إضافة تقييمك بنجاح.");
  });
}

// تشغيل عرض التقييمات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  renderReviews();
});
