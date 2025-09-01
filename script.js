const apiKey = "0iVwI0WzaPbYik8PEIa1BI7bC7o5dyT6W7Yo5xkA"; 
const dateInput = document.getElementById("dateInput");
const loader = document.getElementById("loader");
const photoCard = document.getElementById("photoCard");
const galleryBtn = document.getElementById("galleryBtn"); 
const dailyBtn = document.getElementById("dailyBtn");    
const headerText = document.getElementById("headerText");
const favoritesBtn = document.getElementById("favoritesBtn");
const favoritesContainer = document.getElementById("favoritesContainer");

const today = new Date().toISOString().split('T')[0];
dateInput.max = today;

window.addEventListener('DOMContentLoaded', () => {
  dateInput.value = today;
  showSection('photo');   
  getPhoto(today);

  galleryBtn.style.display = 'inline-block';  
  dailyBtn.style.display = 'none';             
});

galleryBtn.addEventListener('click', () => {
  showSection('gallery');
  dailyBtn.style.display = 'inline-block';  
  galleryBtn.style.display = 'none';         
});

dailyBtn.addEventListener('click', () => {
  showSection('photo');
  dailyBtn.style.display = 'none';         
  galleryBtn.style.display = 'inline-block';  
});

favoritesBtn.addEventListener('click', () => {
  showSection('favorites');
  dailyBtn.style.display = 'inline-block';
  galleryBtn.style.display = 'inline-block';
});

function getPhotoByDate() {
  const selectedDate = dateInput.value;
  if (!selectedDate) return;
  getPhoto(selectedDate);
}

function getPhoto(date) {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`;
  showLoading();

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return res.json();
    })
    .then(data => {
      hideLoading();

 
      if (data.date) {
        data.date = new Date(data.date).toISOString().split('T')[0];
      }

      document.getElementById("title").textContent = data.title;
      document.getElementById("description").textContent = data.explanation;
      document.getElementById("date").textContent = `Date: ${data.date}`;
      document.getElementById("apodImage").src = data.url;
      document.getElementById("apodImage").style.display = "block";

      document.getElementById("addToFavoritesBtn").onclick = () => addToFavorites(data);

      photoCard.classList.remove("hidden");
    })
    .catch(err => {
      hideLoading();
      console.error(err);
    });
}

function showLoading() {
  loader.classList.remove("hidden");
  photoCard.classList.add("hidden");
}

function hideLoading() {
  loader.classList.add("hidden");
}

function showSection(section) {
  const photoSection = document.getElementById("photoSection");
  const gallerySection = document.getElementById("gallerySection");
  const favoritesSection = document.getElementById("favoritesSection");

  photoSection.classList.add("hidden");
  gallerySection.classList.add("hidden");
  favoritesSection.classList.add("hidden");

  if (section === 'photo') {
    photoSection.classList.remove("hidden");
    headerText.textContent = "Select a date or browse the gallery!";
  } else if (section === 'gallery') {
    gallerySection.classList.remove("hidden");
    headerText.textContent = "Select a photo from the gallery!";
    loadGallery();
  } else if (section === 'favorites') {
    favoritesSection.classList.remove("hidden");
    headerText.textContent = "";
    loadFavorites();
  }
}

function loadGallery() {
  const today = new Date();
  const promises = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${dateStr}`;
    promises.push(fetch(url).then(res => {
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return res.json();
    }));
  }

  Promise.all(promises)
    .then(results => {
      const gallery = document.getElementById("galleryContainer");
      gallery.innerHTML = "";

      results.forEach(data => {
        if (data.media_type === "image") {
          const img = document.createElement("img");
          img.src = data.url;
          img.alt = data.title;
          img.title = `${data.title} (${data.date})`;
          img.onclick = () => {
            showSection('photo');
            dateInput.value = data.date;
            getPhoto(data.date);

            dailyBtn.style.display = 'none';   
            galleryBtn.style.display = 'inline-block'; 
          };
          gallery.appendChild(img);
        }
      });
    })
    .catch(err => {
      console.error("Gallery loading failed:", err);
    });
}

function addToFavorites(data) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];


  const newDate = (data.date || "").trim();

  const exists = favorites.some(fav => (fav.date || "").trim() === newDate);

  if (!exists) {
    favorites.push(data);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert("Added to favorites!");
  } else {
    alert("Already in favorites!");
  }
}


function removeFromFavorites(date) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(fav => (fav.date || "").trim() !== (date || "").trim());
  localStorage.setItem('favorites', JSON.stringify(favorites));
  loadFavorites();
}

function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favoritesContainer.innerHTML = "";

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = "<p>No favorites yet.</p>";
    return;
  }

  favorites.forEach(data => {
    const container = document.createElement("div");
    container.classList.add("favorite-item");
    container.style.position = "relative";
    container.style.display = "inline-block";
    container.style.margin = "8px";

    const img = document.createElement("img");
    img.src = data.url;
    img.alt = data.title;
    img.title = `${data.title} (${data.date})`;
    img.style.cursor = "pointer";
    img.style.maxWidth = "150px";
    img.style.borderRadius = "8px";
    img.onclick = () => {
      showSection('photo');
      dateInput.value = data.date;
      getPhoto(data.date);
      dailyBtn.style.display = 'none';
      galleryBtn.style.display = 'inline-block';
    };

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.style.display = "block";        
    removeBtn.style.margin = "8px auto 0";    
    removeBtn.style.background = "rgba(255, 0, 0, 0.8)";
    removeBtn.style.color = "white";
    removeBtn.style.border = "none";
    removeBtn.style.padding = "6px 12px";
    removeBtn.style.borderRadius = "6px";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.width = "150px"; 
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      removeFromFavorites(data.date);
    };

    container.appendChild(img);
    container.appendChild(removeBtn);
    favoritesContainer.appendChild(container);
  });
}
