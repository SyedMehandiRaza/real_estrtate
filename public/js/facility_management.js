document.addEventListener("DOMContentLoaded", () => {
  // Modal open/close
  const modal = document.getElementById("assignPropertyModal");
  const btnNext = document.getElementById("btnNext");
  const btnBack = document.getElementById("btnBack");
  const propertyItems = document.querySelectorAll(".property-item");
  const searchInput = document.getElementById("searchInput");

  let currentStep = 0;
  let selectedProperty = null;

  function openAssignPropertyModal() {
    modal.classList.add("active");
    currentStep = 0;
    selectedProperty = null;
    propertyItems.forEach((p) => p.classList.remove("selected"));
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("notes").value = "";
    updateUI();
  }

  function closeAssignPropertyModal() {
    if (
      confirm(
        "Are you sure you want to close? Any unsaved changes will be lost."
      )
    ) {
      modal.classList.remove("active");
    }
  }

  // Property selection
  propertyItems.forEach((item) => {
    const selectBtn = item.querySelector(".btn-select");
    selectBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectProperty(item);
    });
    item.addEventListener("click", () => selectProperty(item));
  });

  function selectProperty(item) {
    propertyItems.forEach((p) => p.classList.remove("selected"));
    item.classList.add("selected");
    selectedProperty = {
      id: item.dataset.id,
      name: item.querySelector(".property-name").textContent,
      address: item.querySelector(".property-address").textContent,
      price: item.querySelector(".property-price").textContent,
    };
  }

  // Input search
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const search = e.target.value.toLowerCase();
      propertyItems.forEach((item) => {
        const name = item
          .querySelector(".property-name")
          .textContent.toLowerCase();
        const address = item
          .querySelector(".property-address")
          .textContent.toLowerCase();
        item.style.display =
          name.includes(search) || address.includes(search) ? "flex" : "none";
      });
    });
  }

  // Steps buttons
  btnNext.addEventListener("click", () => {
    if (currentStep === 0 && !selectedProperty) {
      alert("Please select a property");
      return;
    }

    if (currentStep === 1) {
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;
      const notes = document.getElementById("notes").value;

      if (!startDate || !endDate) {
        alert("Please fill in contract dates");
        return;
      }

      document.getElementById("confirmProperty").textContent =
        selectedProperty.name;
      document.getElementById("confirmDates").textContent =
        formatDate(startDate) + " - " + formatDate(endDate);
      document.getElementById("confirmNotes").textContent =
        notes || "No notes provided";
    }

    if (currentStep < panelsAssign.length - 1) {
      currentStep++;
      updateUI();
    } else {
      alert("Property assignment confirmed successfully!");
      closeAssignPropertyModal();
    }
  });

  btnBack.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      updateUI();
    }
  });

  function updateUI() {
    panelsAssign.forEach((panel, i) =>
      panel.classList.toggle("active", i === currentStep)
    );
    steps.forEach((step, i) => {
      step.classList.remove("active", "completed");
      if (i === currentStep) step.classList.add("active");
      if (i < currentStep) step.classList.add("completed");
    });
    btnBack.style.visibility = currentStep === 0 ? "hidden" : "visible";
    btnNext.textContent =
      currentStep === panelsAssign.length - 1 ? "Confirm" : "Next";
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAssignPropertyModal();
  });
});

// Modal opning
// async function openModal(companyId) {
//   const modal = document.querySelector(".modal-overlay");
//   modal.style.display = "flex";

//   try {
//     const response = await fetch(`/facility/${companyId}`);
//     if (!response.ok) throw new Error("Failed to fetch company data");

//     const data = await response.json();
//     const company = data[0];

//     console.log("company ---->", company);

//     modal.querySelector(".modal-company-name").textContent =
//       company.companyName || "-";

//     modal.querySelector(".phoneNumber").textContent =
//       company.phoneNumber || "-";

//     modal.querySelector(".numberOfProperty").textContent =
//       company.propertyContracts.length || "-";

//     modal.querySelector(".companyEmail").textContent =
//       company.companyEmail || "-";

//     modal.querySelector(".contactPerson").textContent =
//       company.contactPerson || "-";

//   } catch (error) {
//     console.error("Error fetching company:", error);
//     modal.querySelector(".modal-company-name").textContent =
//       "Error loading company data";
//   }
// }
async function openModal(companyId) {
  const modal = document.querySelector(".modal-overlay");
  modal.style.display = "flex";

  const response = await fetch(`/facility/${companyId}`);
  const data = await response.json();
  const company = data[0]; // because backend returns array
  console.log(response);
  console.log(company);
  // Basic info
  modal.querySelector(".modal-company-name").textContent = company.companyName;
  modal.querySelector(".contactPerson").textContent = company.contactPerson;
  modal.querySelector(".phoneNumber").textContent = company.phoneNumber;
  modal.querySelector(".companyEmail").textContent = company.companyEmail;
  modal.querySelector(".numberOfProperty").textContent =
    company.propertyContracts.length;

  // 🔥 PROPERTY LIST
  const propertyList = modal.querySelector(".property-list");
  propertyList.innerHTML = "";

  company.propertyContracts.forEach((contract) => {
    const property = contract.property;

    const imageUrl =
      property.media && property.media.length > 0
        ? property.media[0].url
        : "/images/no-image.png";

    const card = document.createElement("div");
    card.className = "property-card";

    const description =
      property.description && property.description.length > 36
        ? property.description.slice(0, 36) + "..."
        : property.description || "No description provided";

    card.innerHTML = `
    <div class="prop-thumb">
      <img src="${imageUrl}" 
           style="width:60px;height:60px;object-fit:cover;border-radius:8px"/>
    </div>

    <div class="prop-main">
      <h4>${property.title}</h4>
      <p>${description}</p>
    </div>

    <div class="prop-type">${property.city || ""}, ${property.state || ""}</div>
    <div class="status ${property.status.toLowerCase()}">${
      property.status
    }</div>
<button class="view-btn" onclick="goToProperty(${property.id})">
  View Property
</button>

  `;

    propertyList.appendChild(card);
  });
}
function goToProperty(id) {
  window.location.href = `/propertydetail/${id}`;
}

//

document.querySelector(".close-btn").addEventListener("click", () => {
  document.querySelector(".modal-overlay").style.display = "none";
});

// Tabs functionality (if used)
const tabs = document.querySelectorAll(".tabs .tab");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.getAttribute("data-tab");

    // Remove active class from all tabs
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    // Remove active class from all panels
    panels.forEach((p) => p.classList.remove("active"));

    // Add active class to target panel
    const targetPanel = document.querySelector(".tab-panel-" + target);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }
  });
});

// Note toggle functionality
const toggleBtn = document.getElementById("toggleNoteBtn");
const inputBox = document.querySelector(".input-box");
const noteMessage = document.getElementById("noteMessage");

if (toggleBtn && inputBox && noteMessage) {
  let isOpen = false;

  toggleBtn.addEventListener("click", () => {
    isOpen = !isOpen;

    if (isOpen) {
      inputBox.style.display = "block";
      toggleBtn.textContent = "×"; // change + to X
      noteMessage.focus();
    } else {
      inputBox.style.display = "none";
      toggleBtn.textContent = "+"; // back to +
      noteMessage.value = ""; // clear input
    }
  });
}

// Assign Property Modal
const modal = document.getElementById("assignPropertyModal");
const panelsAssign = document.querySelectorAll(".step-panel");
const steps = document.querySelectorAll(".step-wrap");
const btnNext = document.getElementById("btnNext");
const btnBack = document.getElementById("btnBack");
const propertyItems = document.querySelectorAll(".property-item");
const searchInput = document.getElementById("searchInput");

let currentStep = 0;
let selectedProperty = null;

// Open modal
function openAssignPropertyModal() {
  modal.classList.add("active");
  currentStep = 0;
  selectedProperty = null;
  propertyItems.forEach((p) => p.classList.remove("selected"));
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("notes").value = "";
  updateUI();
}

// Close modal
function closeAssignPropertyModal() {
  if (
    confirm("Are you sure you want to close? Any unsaved changes will be lost.")
  ) {
    modal.classList.remove("active");
  }
}

// Property selection
propertyItems.forEach((item) => {
  const selectBtn = item.querySelector(".btn-select");

  selectBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    selectProperty(item);
  });

  item.addEventListener("click", () => {
    selectProperty(item);
  });
});

function selectProperty(item) {
  propertyItems.forEach((p) => p.classList.remove("selected"));
  item.classList.add("selected");

  selectedProperty = {
    id: item.dataset.id,
    name: item.querySelector(".property-name").textContent,
    address: item.querySelector(".property-address").textContent,
    price: item.querySelector(".property-price").textContent,
  };
}

// Search properties
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const search = e.target.value.toLowerCase();
    propertyItems.forEach((item) => {
      const name = item
        .querySelector(".property-name")
        .textContent.toLowerCase();
      const address = item
        .querySelector(".property-address")
        .textContent.toLowerCase();
      item.style.display =
        name.includes(search) || address.includes(search) ? "flex" : "none";
    });
  });
}

// Next button
btnNext.addEventListener("click", () => {
  if (currentStep === 0 && !selectedProperty) {
    alert("Please select a property");
    return;
  }

  if (currentStep === 1) {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const notes = document.getElementById("notes").value;

    if (!startDate || !endDate) {
      alert("Please fill in contract dates");
      return;
    }

    // Update confirmation
    document.getElementById("confirmProperty").textContent =
      selectedProperty.name;
    document.getElementById("confirmDates").textContent =
      formatDate(startDate) + " - " + formatDate(endDate);
    document.getElementById("confirmNotes").textContent =
      notes || "No notes provided";
  }

  if (currentStep < panelsAssign.length - 1) {
    currentStep++;
    updateUI();
  } else {
    // Final confirmation
    alert("Property assignment confirmed successfully!");
    closeAssignPropertyModal();
  }
});

btnBack.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    updateUI();
  }
});

function updateUI() {
  panelsAssign.forEach((panel, i) => {
    panel.classList.toggle("active", i === currentStep);
  });

  steps.forEach((step, i) => {
    step.classList.remove("active", "completed");
    if (i === currentStep) step.classList.add("active");
    if (i < currentStep) step.classList.add("completed");
  });

  btnBack.style.visibility = currentStep === 0 ? "hidden" : "visible";
  btnNext.textContent =
    currentStep === panelsAssign.length - 1 ? "Confirm" : "Next";
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeAssignPropertyModal();
  }
});
