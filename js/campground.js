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
          <tr><td>🏷️ Ownership Type</td><td><strong>${data.ownertype || 'Public / State Park'}</strong></td></tr>
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
      const toadStrategyEl = document.getElementById('camp-toad-strategy');
      if (toadStrategyEl && data.toadStrategy) {
        toadStrategyEl.innerHTML = `<p>${data.toadStrategy}</p>`;
      }

      // Dynamic Amazon Affiliate Gear Callout Box
      if (toadStrategyEl && data.recommendedGear) {
        let gearBox = document.getElementById('camp-gear-recommendation');
        if (!gearBox) {
          gearBox = document.createElement('div');
          gearBox.id = 'camp-gear-recommendation';
          toadStrategyEl.parentNode.insertBefore(gearBox, toadStrategyEl.nextSibling);
        }

        gearBox.innerHTML = `
          <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 1.25rem; border-radius: 6px; margin: 1.5rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <h4 style="margin: 0 0 0.5rem 0; color: #0f172a; font-size: 1.05rem;">⚙️ ${data.recommendedGear.title || 'Essential Gear for This Approach'}</h4>
            <p style="margin: 0 0 0.75rem 0; font-size: 0.92rem; color: #334155; line-height: 1.5;">
              <strong>Recommended Setup:</strong> <a href="${data.recommendedGear.affiliateUrl}" target="_blank" rel="nofollow noopener" style="color: #2563eb; font-weight: bold; text-decoration: underline;">${data.recommendedGear.productName}</a> — ${data.recommendedGear.reason}
            </p>
            <span style="font-size: 0.78rem; color: #64748b; font-style: italic;">RigFitRV is reader-supported. We may earn an affiliate commission from qualifying purchases made through our links.</span>
          </div>
        `;
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
    "additionalType": data.ownertype === "State Park" 
      ? "https://schema.org/GovernmentPermit" 
      : "https://schema.org/LocalBusiness",
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
