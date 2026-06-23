import { useState, useEffect, useMemo } from "react";

const NAVY = "#10385B";

const PACKING_DATA = [
  {
    category: "Layers & Outerwear",
    items: [
      "Waterproof, windproof rain shell or jacket",
      "Warm mid-layers (fleece or hoodies)",
      "Long-sleeve shirts",
      "A few short-sleeve options for warmer days",
      "Warm hat and light gloves",
      "Scarf or buff for wind",
      "Comfortable everyday clothing",
    ],
  },
  {
    category: "Footwear",
    items: [
      "Comfortable, broken-in walking shoes",
      "Waterproof shoes or boots",
      "Sandals or slip-ons for the ship",
    ],
  },
  {
    category: "Onboard & Dinner",
    items: [
      "Smart-casual outfits for dinners",
      "Something dressier for formal night",
      "Swimwear",
      "Light layer for cool indoor areas",
    ],
  },
  {
    category: "Excursions & Outdoors",
    items: [
      "Small daypack",
      "Reusable water bottle",
      "Sunglasses and sunscreen",
      "Packable rain layer",
      "Binoculars (optional)",
    ],
  },
  {
    category: "Health & Toiletries",
    items: [
      "Personal toiletries and daily medications",
      "Motion-sickness remedies",
      "Basic first-aid items",
      "Lip balm and moisturizer",
    ],
  },
  {
    category: "Documents & Essentials",
    items: [
      "Passport / required travel ID",
      "Boarding documents and confirmations",
      "Payment cards and some cash",
      "Copies of important documents, kept separately",
    ],
  },
  {
    category: "Electronics",
    items: [
      "Phone and charger",
      "Portable battery pack",
      "Camera (optional)",
      "Any adapters you need",
    ],
  },
  {
    category: "Handy Extras",
    items: [
      "Reusable tote bag",
      "Day-of essentials in carry-on",
      "Personal snacks for travel days",
      "Entertainment for sea days",
    ],
  },
];

// Stable slug: "Layers & Outerwear" + "Warm hat..." → "layers-outerwear__warm-hat-and-light-gloves"
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function itemKey(category, item) {
  return `${slugify(category)}__${slugify(item)}`;
}

export default function PackingList({ personId = "guest" }) {
  const storageKey = `packing_v2:${personId}`;

  const [checked, setChecked] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Reload when person switches
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setChecked(raw ? JSON.parse(raw) : {});
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch { /* storage full — fail silently */ }
  }, [checked, storageKey]);

  const toggle = (key) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const { total, done } = useMemo(() => {
    let t = 0, d = 0;
    PACKING_DATA.forEach((sec) =>
      sec.items.forEach((item) => {
        t += 1;
        if (checked[itemKey(sec.category, item)]) d += 1;
      })
    );
    return { total: t, done: d };
  }, [checked]);

  const pct = total ? Math.round((done / total) * 100) : 0;

  const resetAll = () => {
    if (window.confirm("Clear all your checked items?")) setChecked({});
  };

  return (
    <div className="packing-page">
      <div className="packing-hero">
        <h2 className="packing-title">Packing List</h2>
        <p className="packing-subtitle">Alaska Cruise · August 2026</p>

        <div className="packing-progress-bar">
          <div className="packing-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="packing-progress-label">{done} of {total} packed ({pct}%)</div>
      </div>

      <div className="packing-body">
        {PACKING_DATA.map((section) => (
          <section className="packing-section" key={section.category}>
            <h3 className="packing-section-title">{section.category}</h3>
            {section.items.map((item) => {
              const key = itemKey(section.category, item);
              const isOn = !!checked[key];
              return (
                <label className={`packing-item${isOn ? " packing-item--done" : ""}`} key={key}>
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => toggle(key)}
                    style={{ width: 20, height: 20, accentColor: NAVY, flexShrink: 0 }}
                  />
                  <span className="packing-item-text">{item}</span>
                </label>
              );
            })}
          </section>
        ))}

        <button className="packing-reset-btn" onClick={resetAll}>
          Reset my list
        </button>
      </div>
    </div>
  );
}
