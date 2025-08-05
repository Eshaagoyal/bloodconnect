// Load existing hospital stock
let stockList = JSON.parse(localStorage.getItem('hospitalStock')) || [];

// Delete hospital stock entry
window.deleteStock = function(index) {
  stockList.splice(index, 1);
  localStorage.setItem('hospitalStock', JSON.stringify(stockList));
  showBanner('🗑️ Stock deleted');
  renderStock();
};


// Render stock list and chart
function renderStock() {
  const stockTable = document.getElementById('stockTable')?.querySelector('tbody');
  const chartContainer = document.getElementById('stockChart');
  if (!stockTable) return;

  stockTable.innerHTML = '';
  stockList.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="padding:8px;">${item.hospital}</td>
      <td style="padding:8px;">${item.bloodType}</td>
      <td style="padding:8px;">${item.units}</td>
      <td style="padding:8px;">
        <button onclick="deleteStock(${index})" style="color:red; font-size:0.9rem;">🗑️ Delete</button>
      </td>
    `;
    stockTable.appendChild(row);
  });

  if (chartContainer) {
    chartContainer.innerHTML = '';
    const bloodGroupMap = {};
    stockList.forEach(item => {
      const key = item.bloodType;
      bloodGroupMap[key] = (bloodGroupMap[key] || 0) + parseInt(item.units);
    });
    Object.entries(bloodGroupMap).forEach(([bloodType, units]) => {
      const bar = document.createElement('div');
      bar.innerHTML = `<strong>${bloodType}</strong>
        <div style="background:#eee; border-radius:8px; overflow:hidden; margin:4px 0;">
          <div style="width:${units * 10}px; background:#3b82f6; color:white; padding:4px 8px;">${units} units</div>
        </div>`;
      chartContainer.appendChild(bar);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const stockForm = document.getElementById('stockForm');
  const locationInput = document.querySelector('input[placeholder="Enter your location"]');
  const searchButton = document.querySelector('button.btn-gradient');

  // Hospital stock form submission
  if (stockForm) {
    stockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const hospital = document.getElementById('hospital').value.trim().toLowerCase();
      const bloodType = document.getElementById('bloodType').value;
      const units = document.getElementById('units').value.trim();

      if (!hospital || !bloodType || !units) {
        showBanner('❗ Please fill all fields.');
        return;
      }

      const existingIndex = stockList.findIndex(
        item => item.hospital === hospital && item.bloodType === bloodType
      );

      if (existingIndex !== -1) {
        stockList[existingIndex].units = units;
        showBanner('🔁 Stock updated successfully!');
      } else {
        stockList.push({ hospital, bloodType, units });
        showBanner('✅ Stock added successfully!');
      }

      localStorage.setItem('hospitalStock', JSON.stringify(stockList));
      stockForm.reset();
      renderStock();
    });

    renderStock();
  }

  // Location enable button
  const enableBtn = document.getElementById('enable-location');
  if (enableBtn) {
    enableBtn.addEventListener('click', () => {
      enableBtn.textContent = 'Locating...';
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            alert(`Your location: Latitude ${latitude}, Longitude ${longitude}`);
            enableBtn.textContent = 'Location Enabled';
            enableBtn.disabled = true;

            const mapBox = document.getElementById('map-box');
            if (mapBox) {
              const pin = document.createElement('div');
              pin.textContent = `📍 Donor near (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
              pin.style.marginTop = '1rem';
              pin.style.color = '#444';
              mapBox.appendChild(pin);
            }
          },
          () => {
            alert('Failed to get your location.');
            enableBtn.textContent = 'Enable Location Services';
          }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
        enableBtn.textContent = 'Enable Location Services';
      }
    });
  }

  // Search donors (with loading effect)
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      if (!locationInput.value.trim()) {
        locationInput.style.border = '2px solid red';
        locationInput.style.animation = 'shake 0.3s';
        locationInput.addEventListener('animationend', () => {
          locationInput.style.animation = '';
        }, { once: true });
        showBanner('❗ Please enter a location.');
        return;
      }

      localStorage.setItem('userLocation', locationInput.value);

      const loader = document.createElement('div');
      loader.textContent = '🔄 Loading donors...';
      loader.style.position = 'fixed';
      loader.style.top = '50%';
      loader.style.left = '50%';
      loader.style.transform = 'translate(-50%, -50%)';
      loader.style.backgroundColor = '#fff';
      loader.style.padding = '1rem 2rem';
      loader.style.borderRadius = '8px';
      loader.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      loader.style.zIndex = '9999';
      document.body.appendChild(loader);

      setTimeout(() => {
        loader.remove();
        showBanner('✅ Donors updated.');
      }, 2000);
    });
  }

  // Restore location from localStorage
  const savedLocation = localStorage.getItem('userLocation');
  if (savedLocation && locationInput) {
    locationInput.value = savedLocation;
  }

  // Donor contact button: Show toast + timestamp
  const donorButtons = document.querySelectorAll('.donor-card button');
  donorButtons.forEach(button => {
    button.addEventListener('click', () => {
      const donorName = button.closest('.donor-card').querySelector('strong')?.textContent || 'Donor';
      showToast(`📞 Message sent to ${donorName}`);

      const timestamp = document.createElement('small');
      timestamp.textContent = `Last contacted: ${new Date().toLocaleTimeString()}`;
      button.parentElement.appendChild(timestamp);
    });
  });

  // Hover effect on donor cards
  const donorCards = document.querySelectorAll('.donor-card');
  donorCards.forEach(card => {
    card.style.transition = 'transform 0.3s ease';
    card.addEventListener('mouseenter', () => card.style.transform = 'scale(1.03)');
    card.addEventListener('mouseleave', () => card.style.transform = 'scale(1)');
  });

  // Scroll-to-top button
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.textContent = '↑ Top';
  scrollTopBtn.style.position = 'fixed';
  scrollTopBtn.style.bottom = '20px';
  scrollTopBtn.style.right = '20px';
  scrollTopBtn.style.padding = '10px';
  scrollTopBtn.style.display = 'none';
  scrollTopBtn.style.zIndex = '9999';
  document.body.appendChild(scrollTopBtn);

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    scrollTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  // Real-time clock
  const footer = document.querySelector('footer');
  if (footer) {
    const clock = document.createElement('div');
    clock.style.marginTop = '10px';
    clock.style.fontSize = '0.9rem';
    footer.appendChild(clock);
    setInterval(() => {
      const now = new Date();
      clock.textContent = `⏰ ${now.toLocaleTimeString()}`;
    }, 1000);
  }

  // Shake animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      50% { transform: translateX(5px); }
      75% { transform: translateX(-5px); }
      100% { transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);

  const donorForm = document.getElementById('donorForm');
if (donorForm) {
  donorForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const blood = document.getElementById('blood').value;
    const location = document.getElementById('location').value;

    if (!name || !email || !phone || !password || !confirmPassword || !blood || !location) {
      showBanner('❗ Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      showBanner('❌ Passwords do not match');
      return;
    }

    const donor = { name, email, phone, password, blood, location };
    saveDonorToStorage(donor);

    showBanner(`✅ Donor ${name} registered successfully!`);
    donorForm.reset();
  });
}

});

// Banner notification
function showBanner(message) {
  const banner = document.createElement('div');
  banner.textContent = message;
  banner.style.position = 'fixed';
  banner.style.top = '20px';
  banner.style.left = '50%';
  banner.style.transform = 'translateX(-50%)';
  banner.style.backgroundColor = '#333';
  banner.style.color = '#fff';
  banner.style.padding = '10px 20px';
  banner.style.borderRadius = '8px';
  banner.style.zIndex = '9999';
  banner.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 3000);
}

// Toast message
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.right = '30px';
  toast.style.backgroundColor = '#4caf50';
  toast.style.color = 'white';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '4px';
  toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  toast.style.zIndex = '10000';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease';
  document.body.appendChild(toast);

  setTimeout(() => { toast.style.opacity = '1'; }, 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
