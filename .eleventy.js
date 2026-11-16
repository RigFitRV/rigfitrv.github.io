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

  eleventyConfig.addFilter("lower", function(str) {
    return str ? String(str).toLowerCase() : "";
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "../data",
      output: "_site"
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk"
  };
};
