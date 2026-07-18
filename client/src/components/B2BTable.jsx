import React from 'react';

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const TruckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
    <path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
    <circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
  </svg>
);

const FactoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

export default function B2BTable({ listings, searchQuery, setSearchQuery }) {
  const filteredListings = listings.filter(l =>
    l.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.farmer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="b2b-container animate-fade-in-up">
      <div className="b2b-toolbar">
        <div className="search-wrapper">
          <span className="search-icon"><SearchIcon /></span>
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un produit, une région..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="empty-state">
          <FactoryIcon />
          <h3>Aucune offre trouvée</h3>
          <p>Essayez de modifier votre recherche</p>
        </div>
      ) : (
        <div className="b2b-table-wrapper">
          <table className="b2b-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Origine</th>
                <th>Volume</th>
                <th>Prix</th>
                <th>Détails</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map((listing, index) => (
                <tr key={listing.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <td>
                    <div className="product-cell">
                      <span className="product-name">{listing.product}</span>
                      {listing.variety && <span className="product-variety">{listing.variety}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="region-cell">
                      <MapPinIcon />
                      {listing.region}
                    </div>
                  </td>
                  <td>
                    <strong>{listing.quantity}</strong> {listing.unit}
                  </td>
                  <td>
                    <span className="b2b-price">{listing.pricePerKg} DH/kg</span>
                  </td>
                  <td>
                    <div className="b2b-badges">
                      <span className={`transport-badge ${listing.transportIncluded ? 'included' : 'not-included'}`}>
                        <TruckIcon />
                        {listing.transportIncluded ? 'Transport inclus' : 'Sans transport'}
                      </span>
                      {listing.verified && (
                        <span className="verified-badge">
                          <CheckIcon />
                          Vérifié
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button className="contact-btn">
                      <PhoneIcon />
                      Contacter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
