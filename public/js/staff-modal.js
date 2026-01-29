document.addEventListener("DOMContentLoaded", function () {
  const openBtn = document.getElementById("smOpenModalBtn");
  const modal = document.getElementById("smAddStaffModal");

  if (!openBtn || !modal) return;

  openBtn.addEventListener("click", function () {
    modal.style.display = "flex";
  });

  window.smCloseModal = function () {
    modal.style.display = "none";
  };

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      smCloseModal();
    }
  });
});



document.addEventListener("click", async function (e) {
  if (e.target.classList.contains("remove")) {
    const staffId = e.target.dataset.id;

    if (!confirm("Are you sure you want to remove this staff member?")) return;

    try {
      const res = await fetch(`/staff/remove/${staffId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(res)
      const data = await res.json();
      console.log(data)

      if (data.success) {
        alert("Staff removed successfully");
        location.reload();
      } else {
        alert(data.message || "Failed to remove staff");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  }
});



// add staff - view detail modal JS
const PERMISSION_LABELS = {
  properties_management: "Properties Management",
  leads_crm: "Leads & CRM",
  payment_tracking: "Payment Tracking",
  marketing: "Marketing",
  facility_management: "Facility Management",
};

// function openStaffDetalModal(btn) {
//   const modal = document.querySelector(".modal-overlay");

//   // Get data from button
//   const name = btn.dataset.name;
//   const role = btn.dataset.role;
//   const email = btn.dataset.email;
//   const phone = btn.dataset.phone;
//   const status = btn.dataset.status;

//   // Set modal content
//   document.getElementById("sdName").innerText = name;
//   document.getElementById("sdRole").innerText = role;
//   document.getElementById("sdEmail").innerText = email;
//   document.getElementById("sdPhone").innerText = phone;
//   document.getElementById("sdStatus").innerText = status;

//   // Show modal
//   modal.style.display = "flex";
// }
function openStaffDetalModal(btn) {
  const modal = document.querySelector(".modal-overlay");

  // Basic info
  document.getElementById("sdName").innerText = btn.dataset.name;
  document.getElementById("sdRole").innerText = btn.dataset.role;
  document.getElementById("sdEmail").innerText = btn.dataset.email;
  document.getElementById("sdPhone").innerText = btn.dataset.phone;
  document.getElementById("sdStatus").innerHTML = `
  <span class="status-dot"></span>
  ${btn.dataset.status}
`;


  // Permissions
  const userPermissions = JSON.parse(btn.dataset.permissions || "[]");
  const list = document.getElementById("sdPermissionList");
  list.innerHTML = "";

  Object.keys(PERMISSION_LABELS).forEach(key => {
    const hasPermission = userPermissions.includes(key);

    const item = document.createElement("div");
    item.className = "permission-item";

    item.innerHTML = `
      <div class="permission-icon ${hasPermission ? "check" : "cross"}">
        ${hasPermission ? "✓" : "✕"}
      </div>
      ${PERMISSION_LABELS[key]}
    `;

    list.appendChild(item);
  });

  modal.style.display = "flex";
}


function closeModal() {
  document.querySelector(".modal-overlay").style.display = "none";
}
