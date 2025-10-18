import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const OutfitGallery = () => {
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      setLoading(true);
      const result = await api.getOutfits();
      setOutfits(result.outfits || []);
    } catch (err) {
      console.error('Error fetching outfits:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await api.deleteOutfit(id);
      setOutfits(outfits.filter((outfit) => outfit.id !== id));
    } catch (err) {
      console.error('Error deleting outfit:', err);
      alert('Failed to delete outfit: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="gallery-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading outfits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-container">
        <div className="error-message">
          <p>Error loading outfits: {error}</p>
          <button onClick={fetchOutfits} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <header className="gallery-header">
        <div>
          <h1>Outfit Gallery</h1>
          <p className="subtitle">{outfits.length} outfit{outfits.length !== 1 ? 's' : ''} created</p>
        </div>
        <button onClick={() => navigate('/create')} className="btn-primary">
          + Create New Outfit
        </button>
      </header>

      {outfits.length === 0 ? (
        <div className="empty-state">
          <h2>No outfits yet</h2>
          <p>Start creating your first outfit!</p>
          <button onClick={() => navigate('/create')} className="btn-primary">
            Create Outfit
          </button>
        </div>
      ) : (
        <div className="outfit-grid">
          {outfits.map((outfit) => (
            <div key={outfit.id} className="outfit-card">
              <div className="outfit-image">
                {outfit.combined_image_url ? (
                  <img src={outfit.combined_image_url} alt={outfit.name} />
                ) : (
                  <div className="no-image">No preview</div>
                )}
              </div>

              <div className="outfit-content">
                <h3>{outfit.name}</h3>
                {outfit.description && (
                  <p className="description">{outfit.description}</p>
                )}

                <div className="outfit-meta">
                  <span className="template-badge">{outfit.template_type}</span>
                  <span className="product-count">
                    {outfit.products?.length || 0} product{outfit.products?.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="outfit-products">
                  {outfit.products?.slice(0, 3).map((product, index) => (
                    <div key={index} className="product-thumbnail">
                      <img src={product.processed_image_url} alt={product.product_name} />
                    </div>
                  ))}
                  {outfit.products?.length > 3 && (
                    <div className="more-products">
                      +{outfit.products.length - 3}
                    </div>
                  )}
                </div>

                <div className="outfit-links">
                  {outfit.products?.filter(p => p.product_link).map((product, index) => (
                    <a
                      key={index}
                      href={product.product_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="product-link"
                      title={product.product_name}
                    >
                      {product.product_name || `Product ${index + 1}`}
                    </a>
                  ))}
                </div>

                <div className="outfit-actions">
                  <button
                    onClick={() => navigate(`/edit/${outfit.id}`)}
                    className="btn-secondary btn-small"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(outfit.id, outfit.name)}
                    className="btn-danger btn-small"
                  >
                    Delete
                  </button>
                </div>

                <div className="outfit-date">
                  Created {new Date(outfit.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutfitGallery;
