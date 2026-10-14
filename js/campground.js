document.addEventListener('DOMContentLoaded', () => {
  const pageId = document.body.getAttribute('data-campground-id');
  if (!pageId) return;

  fetch('../data/campgrounds.json')
    .then(response => response.json())
    .then(campgrounds => {
      const data = campgrounds.find(c => c.id === pageId);
      if (!data) return;

      // Populate Head Title & Description
      document.title = `${data.name} RV Guide - RigFitRV`;

      // Populate Header & Info Table
      const pageTitle = document.getElementById('camp-title');
      if (pageTitle) pageTitle.textContent = `${data.name} RV Guide: Rig Clearance, Loop Fit & Toad Maneuverability`;

      const infoTable = document.getElementById('camp-info-table');
      if (infoTable) {
        infoTable.innerHTML = `
          <tr><td>📍 Physical Address</td><td>${data.address}</td></tr>
          <tr><td>🌐 GPS Coordinates</td><td><code>${data.gps}</code></td></tr>
          <tr><td>📞 Phone Number</td><td><a href="tel:${data.phone.replace(/[^0-9]/g, '')}">${data.phone}</a></td></tr>
          <tr><td>🔗 Official Website</td><td><a href="${data.website}" target="_blank" rel="noopener">${data.websiteLabel || data.name}</a></td></tr>
        `;
      }

      // Populate Rig-Fit Scorecard
      const scorecard = document.getElementById('camp-scorecard');
      if (scorecard && data.scorecard) {
        scorecard.innerHTML = `
          <ul>
            <li><strong>Recommended Max Rig Length:</strong> ${data.scorecard.maxRigLength}</li>
            <li><strong>Toad / Towed Vehicle Friendliness:</strong> ${data.scorecard.toadFriendliness}</li>
            <li><strong>Tree Clearance Warning:</strong> ${data.scorecard.treeClearance}</li>
            <li><strong>Best Loops for Big Rigs:</strong> ${data.scorecard.bestBigRigLoops}</li>
            <li><strong>Best Loops for Smaller Units:</strong> ${data.scorecard.bestSmallRigLoops}</li>
          </ul>
        `;
      }

      // Populate Toad Unhook Strategy
      const toadStrategy = document.getElementById('camp-toad-strategy');
      if (toadStrategy && data.toadStrategy) {
        toadStrategy.innerHTML = `<p>${data.toadStrategy}</p>`;
      }

      // Populate Overview & Images
      const overview = document.getElementById('camp-overview');
      if (overview && data.content) {
        overview.innerHTML = `
          ${data.image ? `<img src="${data.image}" alt="${data.name} Campsite" style="max-height: 380px; object-fit: cover; width: 100%; border-radius: 8px; margin-bottom: 1.5rem;">` : ''}
          <p>${data.content.overview}</p>
          
          <h3>Big-Rig & Loop Guidance</h3>
          <p>${data.content.loopC}</p>
          
          <h3>Tight Turns & Small Unit Loops</h3>
          <p>${data.content.loopsAB}</p>

          ${data.mapImage ? `
            <hr>
            <h2>🗺️ Official Campground Layout Map</h2>
            <img src="${data.mapImage}" alt="${data.name} Map" style="width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 1rem;">
          ` : ''}
        `;
      }

      // INJECT JSON-LD SCHEMA FOR GOOGLE RICH RESULTS
      injectCampgroundSchema(data);

    })
    .catch(err => console.error('Error loading campground data:', err));
});

// Automatically inject JSON-LD Schema for Google Rich Snippets
function injectCampgroundSchema(data) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Campground",
    "name": data.name,
    "description": data.summary,
    "url": window.location.href,
    "telephone": data.phone || "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.address || "",
      "addressLocality": data.city || "",
      "addressRegion": data.state || "",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": data.lat,
      "longitude": data.lng
    },
    "image": data.image ? `https://rigfitrv.com${data.image}` : "",
    "sameAs": data.website || ""
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}
