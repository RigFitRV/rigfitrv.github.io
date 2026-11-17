module.exports = function(eleventyConfig) {
  // Pass static assets straight through to _site
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("data");

  // Ignore backend server files
  eleventyConfig.ignores.add("server.js");
  eleventyConfig.ignores.add("sever.js");

  // Look up product details by gearKey
  eleventyConfig.addFilter("getProduct", function(products, gearKey) {
    if (!products || !gearKey) return null;
    return products[gearKey] || null;
  });

  // Look up campground by id
  eleventyConfig.addFilter("findCampground", function(campgrounds, id) {
    if (!Array.isArray(campgrounds) || !id) return null;
    return campgrounds.find(c => c.id === id) || null;
  });

  // Unique states filter
  eleventyConfig.addFilter("uniqueStates", function(campgrounds) {
    if (!Array.isArray(campgrounds)) return [];
    const states = [...new Set(campgrounds.map(c => c.state).filter(Boolean))];
    return states.sort();
  });

  // Filter campgrounds by state
  eleventyConfig.addFilter("byState", function(campgrounds, stateCode) {
    if (!Array.isArray(campgrounds)) return [];
    return campgrounds.filter(c => c.state === stateCode);
  });

  // Lowercase string helper
  eleventyConfig.addFilter("lower", function(str) {
    return str ? String(str).toLowerCase() : "";
  });

  // Filter campgrounds by Haversine distance (miles)
  eleventyConfig.addFilter("nearbyCamps", (campgrounds, currentCamp, limit = 2) => {
    if (!Array.isArray(campgrounds) || !currentCamp || !currentCamp.lat || !currentCamp.lng) {
      return [];
    }
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 3958.8; // Earth radius in miles

    return campgrounds
      .filter((c) => c.id !== currentCamp.id && c.lat && c.lng)
      .map((c) => {
        const dLat = toRad(c.lat - currentCamp.lat);
        const dLng = toRad(c.lng - currentCamp.lng);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(currentCamp.lat)) *
            Math.cos(toRad(c.lat)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const distanceMiles = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return { ...c, distanceMiles: Math.round(distanceMiles) };
      })
      .sort((a, b) => a.distanceMiles - b.distanceMiles)
      .slice(0, limit);
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "../data",
      output: "_site"
    },

    // Find regional hub guides featuring a specific campground ID
  eleventyConfig.addFilter("guidesForCamp", (guides, campId) => {
    if (!Array.isArray(guides) || !campId) return [];
    return guides.filter((g) => {
      const lists = [
        g.featuredCampgrounds,
        g.campgrounds,
        g.campgroundIds,
        g.stops,
        g.featured
      ].filter(Array.isArray);

      return lists.some((arr) =>
        arr.some((item) => {
          if (typeof item === "string") return item === campId;
          if (item && typeof item === "object") {
            return item.id === campId || item.campgroundId === campId || item.slug === campId;
          }
          return false;
        })
      );
    });
  });
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk"
  };
};
