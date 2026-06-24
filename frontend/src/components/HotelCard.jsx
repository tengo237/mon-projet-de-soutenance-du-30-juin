import { Link } from "react-router-dom";
import { fmtFCFA } from "../api";
import { Icon } from "./Icon";
import { AmenityChips, SafetyBadge, Stars } from "./Shared";

export function HotelCard({ hotel, rank }) {
  return (
    <Link to={`/hotels/${hotel.slug}`} className="hcard">
      <div className="photo">
        {rank === 1 && <span className="rank">Top choix pour toi</span>}
        <img src={hotel.cover_image_url} alt={hotel.name} loading="lazy" />
      </div>
      <div className="body">
        <div className="top">
          <div>
            <h3>{hotel.name}</h3>
            <div className="place">
              <Icon name="pin" style={{ width: 14, height: 14 }} /> {hotel.quartier}, {hotel.city}
              <SafetyBadge index={hotel.safety_index} />
            </div>
            <div style={{ marginTop: ".4rem" }}>
              <Stars rating={hotel.rating} count={hotel.review_count} />
            </div>
          </div>
          <div className="price">
            <span className="amount">{fmtFCFA(hotel.price_from)}</span>
            <span className="unit">à partir de / nuit</span>
          </div>
        </div>

        {hotel.match_reason && (
          <div className="host-note">
            <span className="label"><Icon name="lamp" style={{ width: 14, height: 14 }} /> Pourquoi on te recommande ça</span>
            <p>{hotel.match_reason}</p>
          </div>
        )}

        <AmenityChips amenities={hotel.amenities} />
      </div>
    </Link>
  );
}
