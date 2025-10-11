document.addEventListener("DOMContentLoaded", () => {
  const bannerPlaceholder = document.getElementById("contact-banner-placeholder");

  if (bannerPlaceholder) {
    fetch("contact-banner.html")
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        throw new Error('Could not fetch contact-banner.html');
      })
      .then(data => {
        bannerPlaceholder.innerHTML = data;
      })
      .catch(error => {
        console.error("Error loading contact banner:", error);
        // Optionally, hide the placeholder if the banner fails to load
        bannerPlaceholder.style.display = 'none';
      });
  }
});
