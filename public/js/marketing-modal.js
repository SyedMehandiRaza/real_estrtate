let selectedProperties = [];
let selectedPromotionTypes = [];
let selectedPlatforms = [];

document.getElementById("openModalBtn").addEventListener("click", () => {
  document.getElementById("marketingModal").style.display = "flex";
});


function selectMarketingProperty(id, card) {
  if (selectedProperties.includes(id)) {
    selectedProperties = selectedProperties.filter(p => p !== id);
    card.classList.remove("selected");
    card.style.background = "";
  } else {
    selectedProperties.push(id);
    card.classList.add("selected");
    card.style.background = "#f5f3ff";
  }

  document.getElementById("marketingSelectedProperty").value = selectedProperties.join(",");
}
function goToPostModal() {
  if (!selectedProperties.length) {
    alert("Please select at least one property");
    return;
  }

  document.getElementById("marketingModal").style.display = "none";
  document.getElementById("mk-post-modal").style.display = "flex";
}

document.querySelectorAll(".mk-promotion-card").forEach(card => {
  card.addEventListener("click", () => {
    const type = card.innerText.toLowerCase();

    if (selectedPromotionTypes.includes(type)) {
      selectedPromotionTypes = selectedPromotionTypes.filter(t => t !== type);
      card.classList.remove("selected");
    } else {
      selectedPromotionTypes.push(type);
      card.classList.add("selected");
    }
  });
});


document.querySelectorAll(".mk-platform-card").forEach(card => {
  card.addEventListener("click", () => {
    const platform = card.querySelector(".mk-platform-name")
                         .innerText.toLowerCase();

    if (selectedPlatforms.includes(platform)) {
      selectedPlatforms = selectedPlatforms.filter(p => p !== platform);
      card.classList.remove("selected");
    } else {
      selectedPlatforms.push(platform);
      card.classList.add("selected");
    }

    console.log("Selected Platforms:", selectedPlatforms);
  });
});

function goToReviewModal() {
  if (!selectedPromotionTypes.length) {
    alert("Please select a promotion type");
    return;
  }

  if (!selectedPlatforms.length) {
    alert("Please select at least one platform");
    return;
  }

  document.getElementById("mk-post-modal").style.display = "none";
  document.getElementById("mk-review-modal").style.display = "flex";

  fillReviewModal();
}

function fillReviewModal() {
  document.querySelector(".mk-review-property-name").innerText =
    "Selected Properties: " + selectedProperties.join(", ");

  document.querySelector(".mk-review-promo-type").innerText =
    selectedPromotionTypes.join(", ");

  const grid = document.querySelector(".mk-review-platform-grid");
  grid.innerHTML = "";

  selectedPlatforms.forEach(p => {
    grid.innerHTML += `
      <div class="mk-review-platform-box">
        <div class="mk-review-platform-icon">✔</div>
        <div class="mk-review-platform-name">${p}</div>
      </div>
    `;
  });
  console.log("FINAL DATA:", {
    selectedProperties,
    selectedPromotionTypes,
    selectedPlatforms
  });

}

function submitMarketing() {
  fetch("/marketing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      propertyId: selectedProperties[0],
      platforms: {
        instagram: selectedPlatforms.includes("instagram"),
        facebook: selectedPlatforms.includes("facebook"),
        youtube: selectedPlatforms.includes("youtube"),
        linkedin: selectedPlatforms.includes("linkedin")
      },
      promotionType: {
        single: selectedPromotionTypes.includes("single"),
        carousel: selectedPromotionTypes.includes("carousel"),
        story: selectedPromotionTypes.includes("story"),
        video: selectedPromotionTypes.includes("video")
      }
    })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      alert(data.message);
      return;
    }

    document.getElementById("mk-review-modal").style.display = "none";

    openSuccessModal();
  })
  .catch(err => {
    console.error(err);
    alert("Something went wrong");
  });
}


// SUCCESS MODAL
function openSuccessModal() {
  const modal = document.getElementById("mk-success-overlay");
  modal.style.display = "flex";

  setTimeout(() => {
    closeSuccessModal();
    window.location.href = "/marketing";
  }, 5000);
}

function closeSuccessModal() {
  document.getElementById("mk-success-overlay").style.display = "none";
  window.location.href = "/marketing";
}


//  close modal 
function closeModal() {
  document.getElementById("marketingModal").style.display = "none";
  document.getElementById("mk-post-modal").style.display = "none";
  document.getElementById("mk-review-modal").style.display = "none";

  selectedProperties = [];
  selectedPromotionTypes = [];
  selectedPlatforms = [];
}