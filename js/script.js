// Initialize AOS
AOS.init({
  duration: 1000,
  once: false,
  mirror: true,
});

// Initiate bootstrap tooltip
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

// Dynamic nav active highlight
const $sections = $("section");
const $navLinks = $(".nav-top-link");
$(window).on("scroll", () => {
  let current = "";
  $sections.each(function () {
    const sectionTop = $(this).offset().top - 100;
    if ($(window).scrollTop() >= sectionTop) current = $(this).attr("id");
  });
  $navLinks.removeClass("active");
  $navLinks.filter(`[href="#${current}"]`).addClass("active");
});

function scrollToSection(selector, height) {
  $("html, body").animate(
    {
      scrollTop: $(selector).offset().top - height,
    },
    0
  );
}

// Control portfolio section and mobile view height when clicking portfolio nav link
$('a[href^="#"]').on("click", function (e) {
  e.preventDefault();
  const target = $(this).attr("href");
  if ($(window).width() < 992 || target == "#portfolio") {
    // If navbar is collapsed, close it after clicking
    if ($(".navbar-collapse").hasClass("show")) {
      $(".navbar-collapse").collapse("hide");
    }
    scrollToSection(target, 100);
  } else {
    scrollToSection(target, 0);
  }
});

// Redirect to certificate tab from About section
$("#certificates")
  .closest(".col-md-3")
  .on("click", () => {
    new bootstrap.Tab($("#certificates-tab")[0]).show();
    scrollToSection("#portfolio", 100);
  });

// Utility: Fetch JSON
const fetchJSON = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    return null;
  }
};

// Document ready
$(async () => {
  // Experience Years
  $(".exp-year").text(new Date().getFullYear() - 2022);

  // Portfolio Info
  const portfolioData = await fetchJSON(
    "https://zaw-lwin-tun-portfolio-data.s3.ap-southeast-1.amazonaws.com/portfolio-data.json"
  );

  if (portfolioData) {
    const map = {
      "#contributedProjects": portfolioData.contributedProjects,
      "#personalProjects": portfolioData.personalProjects,
      "#certificates": portfolioData.certificates,
      "#location": portfolioData.location,
      "#phoneNum": portfolioData.phoneNum,
      "#email": portfolioData.email,
    };
    $.each(map, (selector, value) => $(selector).text(value));
    $("#emailLink").prop("href", `mailto:${portfolioData.email}`);
    $("#phoneLink").prop("href", `tel:${portfolioData.phoneNum}`);
  }

  // Render cards dynamically
  const cardDiv = ({ containerSelector, data, renderItem, tabSelector }) => {
    const $container = $(containerSelector).empty();
    data.forEach((item, i) => {
      const $col = $("<div>")
        .addClass("col-sm-12 col-md-6 col-lg-4")
        .attr({
          "data-aos": "zoom-in",
          "data-aos-delay": 100 + i * 100,
        });

      $col.append(renderItem(item));
      $container.append($col);
    });

    if (tabSelector) {
      document
        .querySelector(tabSelector)
        .addEventListener("shown.bs.tab", () => AOS.refresh());
    } else {
      AOS.refresh();
    }
  };

  // Tech Skills
  const skills = await fetchJSON(
    "https://zaw-lwin-tun-portfolio-data.s3.ap-southeast-1.amazonaws.com/tech-skills.json"
  );

  if (skills) {
    cardDiv({
      containerSelector: "#skillTab",
      data: skills,
      renderItem: ({ type, icon, name, subName }) => {
        const $card = $("<div>")
          .addClass(
            "card p-4 shadow-sm border-0 rounded-4 bg-dark-grey zoom-hover-sm"
          )
          .attr("role", "button");

        const $layout = $("<div>").addClass("d-flex align-items-center");

        const $iconBox = $("<div>").addClass("icon-box flex-shrink-0");
        if (type === "fa")
          $iconBox.append($("<i>").addClass(`${icon} text-white`));
        else if (type === "img")
          $iconBox.append(
            $("<img>").attr({ src: icon, alt: name }).addClass("skill-img")
          );

        const $textWrapper = $("<div>").addClass("d-flex flex-column ms-3");
        $textWrapper.append(
          $("<div>").addClass("fw-bold text-white").text(name)
        );
        if (subName?.trim())
          $textWrapper.append(
            $("<div>").addClass("text-secondary small").text(subName)
          );

        $layout.append($iconBox, $textWrapper);
        $card.append($layout);

        if (subName?.trim()) {
          $card.attr({
            "data-bs-toggle": "tooltip",
            "data-bs-placement": "top",
            "data-bs-custom-class": "custom-tooltip",
            "data-bs-title": subName,
          });
        }

        return $card;
      },
      tabSelector: "#certificates-tab",
    });
  }

  // Certificates
  const certificates = await fetchJSON(
    "https://zaw-lwin-tun-portfolio-data.s3.ap-southeast-1.amazonaws.com/certificates.json"
  );

  if (certificates) {
    cardDiv({
      containerSelector: "#certificateTab",
      data: certificates,
      renderItem: ({ title, image, link }) => {
        const $card = $("<div>").addClass("cert-card zoom-hover-sm");
        $card.append(
          $("<a>")
            .attr({ href: link, target: "_blank" })
            .append(
              $("<img>").attr({ src: image, alt: title }).addClass("w-100")
            ),
          $("<div>").addClass("h6 text-white m-2").text(title)
        );
        return $card;
      },
      tabSelector: "#certificates-tab",
    });
  }
});
