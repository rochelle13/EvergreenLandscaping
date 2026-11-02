/* Evergreen Landscaping - site scripts (runs on every page; each feature checks its page first) */
const RECIPIENT = "romoodley@iie.ac.za"; // contact emails are addressed to this recipient

/* Service data used for dynamic listing, search and enquiry estimates (prices are estimates in ZAR) */
const SERVICES = [
  { name: "Garden Design & Landscaping", category: "Design", base: 1500, rate: 45, lead: 14, desc: "A customised design built around your style, soil and sun conditions.", items: ["Garden layout and planning", "Plant selection", "Beds and borders", "Pathways and outdoor areas"] },
  { name: "Lawn Installation & Maintenance", category: "Lawns", base: 600, rate: 12, lead: 3, desc: "Instant turf or seeded lawns, plus regular mowing, edging and feeding.", items: ["New lawn installation", "Mowing and edging", "Fertilising", "Weed control"] },
  { name: "Tree & Hedge Care", category: "Trees & Hedges", base: 450, rate: 6, lead: 5, desc: "Safe trimming and shaping that keeps trees healthy and hedges neat.", items: ["Tree trimming", "Hedge shaping", "Pruning", "Branch removal"] },
  { name: "Irrigation Systems", category: "Installation", base: 2500, rate: 35, lead: 10, desc: "Water-wise sprinkler and drip systems planned for your garden.", items: ["System installation", "Drip irrigation", "Maintenance", "Inspections"] },
  { name: "Garden Clean-Ups", category: "Maintenance", base: 400, rate: 8, lead: 2, desc: "A once-off tidy that clears overgrown areas and removes garden waste.", items: ["Weeding", "Leaf removal", "Debris removal", "Clearing overgrown areas"] }
];
const price = s => "R" + s.base.toLocaleString("en-ZA");
const $ = (id) => document.getElementById(id);

/* Footer year and today's date (null-safe so every page can load this file) */
if ($("year")) $("year").textContent = new Date().getFullYear();
if ($("current-date")) $("current-date").textContent = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });

/* ---------- Lightbox: any image inside [data-lightbox] opens full size ---------- */
const galleryImgs = [...document.querySelectorAll("[data-lightbox] img")];
if (galleryImgs.length) {
  let current = 0;
  const box = document.createElement("div");
  box.className = "lightbox"; box.hidden = true;
  box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Image viewer");
  box.innerHTML = '<button class="lb-close" aria-label="Close">&times;</button><button class="lb-prev" aria-label="Previous image">&#10094;</button><figure><img alt=""><figcaption></figcaption></figure><button class="lb-next" aria-label="Next image">&#10095;</button>';
  document.body.appendChild(box);
  const show = (i) => {
    current = (i + galleryImgs.length) % galleryImgs.length;
    const img = galleryImgs[current];
    box.querySelector("img").src = img.src; box.querySelector("img").alt = img.alt;
    box.querySelector("figcaption").textContent = img.alt + " (" + (current + 1) + " of " + galleryImgs.length + ")";
    box.hidden = false;
  };
  galleryImgs.forEach((img, i) => { img.tabIndex = 0; img.addEventListener("click", () => show(i)); img.addEventListener("keydown", e => { if (e.key === "Enter") show(i); }); });
  box.querySelector(".lb-close").onclick = () => (box.hidden = true);
  box.querySelector(".lb-prev").onclick = () => show(current - 1);
  box.querySelector(".lb-next").onclick = () => show(current + 1);
  box.addEventListener("click", e => { if (e.target === box) box.hidden = true; });
  document.addEventListener("keydown", e => {
    if (box.hidden) return;
    if (e.key === "Escape") box.hidden = true;
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
}

/* ---------- Dynamic services list with search, filter and sort ---------- */
if ($("services-list")) {
  const list = $("services-list");
  [...new Set(SERVICES.map(s => s.category))].forEach(c => $("category").add(new Option(c, c)));
  const render = () => {
    const q = $("search").value.trim().toLowerCase(), cat = $("category").value, sort = $("sort").value;
    const found = SERVICES.filter(s => (cat === "all" || s.category === cat) && (s.name + s.desc + s.items.join(" ")).toLowerCase().includes(q));
    found.sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "price-low" ? a.base - b.base : b.base - a.base);
    list.replaceChildren();
    found.forEach(s => {
      const card = document.createElement("article"); card.className = "card";
      const h = document.createElement("h2"); h.textContent = s.name;
      const p = document.createElement("p"); p.textContent = s.desc;
      const ul = document.createElement("ul"); s.items.forEach(t => { const li = document.createElement("li"); li.textContent 
        = t; ul.appendChild(li); });
      const f = document.createElement("p"); f.className = "from-price"; f.textContent = "From " + price(s) + " | Typical lead time: " + s.lead + " days";
      card.append(h, p, ul, f); list.appendChild(card);
    });
    $("results-count").textContent = found.length ? found.length + " service(s) shown." : "No services match your search. Try a different word.";
  };
  ["input", "change"].forEach(ev => document.querySelector(".toolbar").addEventListener(ev, render));
  render();
}

/* ---------- Accordion (FAQ) ---------- */
document.querySelectorAll(".accordion-btn").forEach(btn => btn.addEventListener("click", () => {
  const open = btn.getAttribute("aria-expanded") === "true";
  btn.setAttribute("aria-expanded", String(!open));
  btn.nextElementSibling.hidden = open;
}));

/* ---------- Form validation helpers ---------- */
const checks = {
  name: v => v.trim().length >= 2 || "Please enter your full name (at least 2 characters).",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Please enter a valid email address, e.g. name@example.com.",
  phone: v => /^(\+27|0)\d{9}$/.test(v.replace(/[\s-]/g, "")) || "Enter a South African number, e.g. 031 123 4567 or +27 31 123 4567.",
  service: v => v !== "" || "Please choose an option.",
  size: v => (Number(v) >= 10 && Number(v) <= 100000) || "Enter the area in m² (between 10 and 100 000).",
  date: v => { const d = new Date(v); const t = new Date(); t.setHours(0, 0, 0, 0); return (v !== "" && d >= t && d.getUTCDay() !== 0) || "Choose today or a future date (we are closed on Sundays)."; },
  message: v => (v.trim().length >= 10 && v.trim().length <= 500) || "Your message must be between 10 and 500 characters."
};
function validate(form) {
  let ok = true;
  form.querySelectorAll("[data-check]").forEach(f => {
    const res = checks[f.dataset.check](f.value), err = $(f.id + "-error");
    err.textContent = res === true ? "" : res;
    f.classList.toggle("invalid", res !== true); f.setAttribute("aria-invalid", String(res !== true));
    if (res !== true) ok = false;
  });
  if (!ok) form.querySelector(".invalid").focus();
  return ok;
}

/* ---------- Enquiry form: validate, then show cost and availability ---------- */
const enquiry = $("enquiry-form");
if (enquiry) {
  enquiry.addEventListener("submit", e => {
    e.preventDefault();
    if (!validate(enquiry)) return;
    const s = SERVICES.find(x => x.name === $("service").value);
    const cost = s.base + s.rate * Number($("size").value);
    const earliest = new Date(); earliest.setDate(earliest.getDate() + s.lead);
    if (earliest.getDay() === 0) earliest.setDate(earliest.getDate() + 1); // skip Sunday
    const fmt = d => d.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
    const wanted = new Date($("date").value);
    const out = $("enquiry-result");
    out.replaceChildren();
    const lines = ["Thank you, " + $("name").value.trim() + ". Here is your estimate for " + s.name + ".",
      "Estimated cost: R" + Math.round(cost * 0.9).toLocaleString("en-ZA") + " to R" + Math.round(cost * 1.1).toLocaleString("en-ZA") + 
      " (final price confirmed after a site visit).",
      wanted >= earliest ? "Availability: your preferred date (" + fmt(wanted) + ") is available." :
       "Availability: our earliest slot for this service is " + fmt(earliest) + ".",
      "We will contact you on " + $("email").value.trim() + " to confirm."];
    lines.forEach(t => { const p = document.createElement("p"); p.textContent = t; out.appendChild(p); }); 
    // textContent prevents script injection
    out.hidden = false; out.focus();
  });
}

/* ---------- Contact form: validate, compile an email and let the visitor send it ---------- */
const contact = $("contact-form");
if (contact) {
  contact.addEventListener("submit", e => {
    e.preventDefault();
    if (!validate(contact)) return;
    const v = id => $(id).value.trim();
    const subject = "[" + v("topic") + "] Message from " + v("name");
    const body = "Name: " + v("name") + "\nEmail: " + v("email") + "\nPhone: " + v("phone") + "\nType of message: " + v("topic") + "\n\n" + v("message");
    const out = $("contact-result"); out.replaceChildren();
    const p = document.createElement("p"); p.textContent = "Your email is ready. Press the button to send it to " + RECIPIENT 
    + " from your email app.";
    const a = document.createElement("a"); a.className = "button"; a.textContent = "Send email";
    a.href = "mailto:" + RECIPIENT + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    out.append(p, a); out.hidden = false;
  });
}

/* ---------- Interactive map (Leaflet) with more than one location ---------- */
if ($("map") && window.L) {
  const places = [["Head Office, Durban North", -29.7968, 31.0261], ["Umhlanga Depot", -29.7266, 31.0847], ["Pinetown Depot", -29.8180, 30.8630]];
  const map = L.map("map").setView([-29.78, 31.0], 11);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
  places.forEach(p => L.marker([p[1], p[2]]).addTo(map).bindPopup("<strong>" + p[0] + "</strong>"));
  map.fitBounds(places.map(p => [p[1], p[2]]), { padding: [30, 30] });
}
